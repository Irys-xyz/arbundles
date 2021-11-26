import { Readable } from "stream";
import { byteArrayToLong } from "../utils";
import base64url from "base64url";
import { MIN_BINARY_SIZE } from "../index";
import { SIG_CONFIG } from "../constants";
import { tagsParser } from "../parser";
import * as fs from "fs";

export async function* verifyAndIndexStream(
  stream: Readable,
): AsyncGenerator<Record<string, any>> {
  const reader = getReader(stream);
  let bytes: Uint8Array = (await reader.next()).value;
  bytes = await hasEnough(reader, bytes, 32);
  const itemCount = byteArrayToLong(bytes.subarray(0, 32));
  bytes = bytes.subarray(32);
  const headersLength = 64 * itemCount;
  bytes = await hasEnough(reader, bytes, headersLength);
  const headers: [number, string][] = new Array(itemCount);
  for (let i = 0; i < headersLength; i += 64) {
    headers[i / 64] = [
      byteArrayToLong(bytes.subarray(i, i + 32)),
      base64url(Buffer.from(bytes.subarray(i + 32, i + 64))),
    ];
  }

  bytes = bytes.subarray(headersLength);

  let offsetSum = 32 + headersLength;

  for (const [length, id] of headers) {
    const now = performance.now();

    bytes = await hasEnough(reader, bytes, MIN_BINARY_SIZE);

    // Get sig type
    bytes = await hasEnough(reader, bytes, 2);
    const signatureType = byteArrayToLong(bytes.subarray(0, 2));
    bytes = bytes.subarray(2);

    // Get sig
    const sigLength = SIG_CONFIG[signatureType].sigLength;
    bytes = await hasEnough(reader, bytes, sigLength);
    const signature = bytes.subarray(0, sigLength);
    bytes = bytes.subarray(sigLength);

    // Get owner
    const pubLength = SIG_CONFIG[signatureType].pubLength;
    bytes = await hasEnough(reader, bytes, pubLength);
    const owner = bytes.subarray(0, pubLength);
    bytes = bytes.subarray(pubLength);

    // Get target
    bytes = await hasEnough(reader, bytes, 1);
    const targetPresent = bytes[0] === 1;
    if (targetPresent) bytes = await hasEnough(reader, bytes, 33);
    const target = targetPresent
      ? bytes.subarray(1, 33)
      : Buffer.allocUnsafe(0);
    bytes = bytes.subarray(targetPresent ? 33 : 1);

    // Get anchor
    bytes = await hasEnough(reader, bytes, 1);
    const anchorPresent = bytes[0] === 1;
    if (anchorPresent) bytes = await hasEnough(reader, bytes, 33);
    const anchor = anchorPresent
      ? bytes.subarray(1, 33)
      : Buffer.allocUnsafe(0);
    bytes = bytes.subarray(anchorPresent ? 33 : 1);

    // Get tags
    bytes = await hasEnough(reader, bytes, 8);
    const tagsLength = byteArrayToLong(bytes.subarray(0, 8));
    bytes = bytes.subarray(8);

    bytes = await hasEnough(reader, bytes, 8);
    const tagsBytesLength = byteArrayToLong(bytes.subarray(0, 8));
    bytes = bytes.subarray(8);

    bytes = await hasEnough(reader, bytes, tagsBytesLength);
    const tags =
      tagsLength !== 0 && tagsBytesLength !== 0
        ? tagsParser.fromBuffer(Buffer.from(bytes.subarray(0, tagsBytesLength)))
        : [];
    if (tags.length !== tagsLength) throw new Error("Tags lengths don't match");
    bytes = bytes.subarray(tagsBytesLength);

    // Get offset of data start and length of data
    const dataOffset =
      2 +
      sigLength +
      pubLength +
      (targetPresent ? 33 : 1) +
      (anchorPresent ? 33 : 1) +
      16 +
      tagsBytesLength;
    const dataSize = length - dataOffset;

    const beforeSkip = performance.now();
    if (bytes.byteLength > dataSize) {
      bytes = bytes.subarray(dataSize);
    } else {
      let skipped = Math.min(dataSize, bytes.byteLength);
      // TODO: Skip data
      let data = bytes;
      while (dataSize > skipped) {
        bytes = (await reader.next()).value;
        if (!bytes) {
          fs.writeFileSync("dump", data);
          throw new Error(
            `Not enough data bytes  expected: ${dataSize} received: ${skipped}`,
          );
        }
        data = Buffer.concat([data, bytes]);

        skipped += bytes.byteLength;
      }
      bytes = bytes.subarray(bytes.byteLength - (skipped - dataSize));
    }
    const afterSkip = performance.now();
    console.log(`Skip took ${afterSkip - beforeSkip}`);

    yield {
      id,
      signature: base64url(Buffer.from(signature)),
      target: base64url(Buffer.from(target)),
      anchor: base64url(Buffer.from(anchor)),
      owner: base64url(Buffer.from(owner)),
      tags,
      dataOffset: offsetSum + dataOffset,
    };

    offsetSum += dataOffset + dataSize;
    console.log(`Index item took ${performance.now() - now}`);
  }
}

async function hasEnough(
  reader: AsyncGenerator<Buffer>,
  buffer: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  if (buffer.byteLength > length) return buffer;
  buffer = Buffer.concat([buffer, (await reader.next()).value]);
  if (buffer.byteLength > length) return buffer;

  return buffer;
}

async function* getReader(s: Readable): AsyncGenerator<Buffer> {
  for await (const chunk of s) {
    console.log(chunk.length);
    yield chunk;
  }
}
