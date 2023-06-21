import { PassThrough, Transform } from "stream";
import type { Readable } from "stream";
import { byteArrayToLong } from "../utils";
import base64url from "base64url";
import { indexToType } from "../signing/constants";
import type { DataItemCreateOptions } from "../index";
import { createData, MIN_BINARY_SIZE } from "../index";
import { SIG_CONFIG } from "../constants";
import { stringToBuffer } from "$/utils";
import { deepHash } from "../deepHash";
import type { Signer } from "../signing/index";
import { deserializeTags } from "../tags";
import { createHash } from "crypto";

export async function processStream(stream: Readable): Promise<Record<string, any>[]> {
  const reader = getReader(stream);
  let bytes: Uint8Array = (await reader.next()).value;
  bytes = await readBytes(reader, bytes, 32);
  const itemCount = byteArrayToLong(bytes.subarray(0, 32));
  bytes = bytes.subarray(32);
  const headersLength = 64 * itemCount;
  bytes = await readBytes(reader, bytes, headersLength);
  const headers: [number, string][] = new Array(itemCount);
  for (let i = 0; i < headersLength; i += 64) {
    headers[i / 64] = [byteArrayToLong(bytes.subarray(i, i + 32)), base64url(Buffer.from(bytes.subarray(i + 32, i + 64)))];
  }

  bytes = bytes.subarray(headersLength);

  let offsetSum = 32 + headersLength;

  const items: Record<string, any>[] = [];

  for (const [length, id] of headers) {
    bytes = await readBytes(reader, bytes, MIN_BINARY_SIZE);

    // Get sig type
    bytes = await readBytes(reader, bytes, 2);
    const signatureType = byteArrayToLong(bytes.subarray(0, 2));
    bytes = bytes.subarray(2);

    const { sigLength, pubLength, sigName } = SIG_CONFIG[signatureType];

    // Get sig
    bytes = await readBytes(reader, bytes, sigLength);
    const signature = bytes.subarray(0, sigLength);
    bytes = bytes.subarray(sigLength);

    // Get owner
    bytes = await readBytes(reader, bytes, pubLength);
    const owner = bytes.subarray(0, pubLength);
    bytes = bytes.subarray(pubLength);

    // Get target
    bytes = await readBytes(reader, bytes, 1);
    const targetPresent = bytes[0] === 1;
    if (targetPresent) bytes = await readBytes(reader, bytes, 33);
    const target = targetPresent ? bytes.subarray(1, 33) : Buffer.allocUnsafe(0);
    bytes = bytes.subarray(targetPresent ? 33 : 1);

    // Get anchor
    bytes = await readBytes(reader, bytes, 1);
    const anchorPresent = bytes[0] === 1;
    if (anchorPresent) bytes = await readBytes(reader, bytes, 33);
    const anchor = anchorPresent ? bytes.subarray(1, 33) : Buffer.allocUnsafe(0);
    bytes = bytes.subarray(anchorPresent ? 33 : 1);

    // Get tags
    bytes = await readBytes(reader, bytes, 8);
    const tagsLength = byteArrayToLong(bytes.subarray(0, 8));
    bytes = bytes.subarray(8);

    bytes = await readBytes(reader, bytes, 8);
    const tagsBytesLength = byteArrayToLong(bytes.subarray(0, 8));
    bytes = bytes.subarray(8);

    bytes = await readBytes(reader, bytes, tagsBytesLength);
    const tagsBytes = bytes.subarray(0, tagsBytesLength);
    const tags = tagsLength !== 0 && tagsBytesLength !== 0 ? deserializeTags(Buffer.from(tagsBytes)) : [];
    if (tags.length !== tagsLength) throw new Error("Tags lengths don't match");
    bytes = bytes.subarray(tagsBytesLength);

    const transform = new Transform();
    transform._transform = function (chunk, _, done): void {
      this.push(chunk);
      done();
    };

    // Verify signature
    const signatureData = deepHash([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      stringToBuffer(signatureType.toString()),
      owner,
      target,
      anchor,
      tagsBytes,
      transform,
    ]);

    // Get offset of data start and length of data
    const dataOffset = 2 + sigLength + pubLength + (targetPresent ? 33 : 1) + (anchorPresent ? 33 : 1) + 16 + tagsBytesLength;
    const dataSize = length - dataOffset;

    if (bytes.byteLength > dataSize) {
      transform.write(bytes.subarray(0, dataSize));
      bytes = bytes.subarray(dataSize);
    } else {
      let skipped = bytes.byteLength;
      transform.write(bytes);
      while (dataSize > skipped) {
        bytes = (await reader.next()).value;
        if (!bytes) {
          throw new Error(`Not enough data bytes  expected: ${dataSize} received: ${skipped}`);
        }

        skipped += bytes.byteLength;

        if (skipped > dataSize) transform.write(bytes.subarray(0, bytes.byteLength - (skipped - dataSize)));
        else transform.write(bytes);
      }
      bytes = bytes.subarray(bytes.byteLength - (skipped - dataSize));
    }

    transform.end();

    // Check id
    if (id !== base64url(createHash("sha256").update(signature).digest())) throw new Error("ID doesn't match signature");

    const Signer = indexToType[signatureType];

    if (!(await Signer.verify(owner, (await signatureData) as any, signature))) throw new Error("Invalid signature");

    items.push({
      id,
      sigName,
      signature: base64url(Buffer.from(signature)),
      target: base64url(Buffer.from(target)),
      anchor: base64url(Buffer.from(anchor)),
      owner: base64url(Buffer.from(owner)),
      tags,
      dataOffset: offsetSum + dataOffset,
      dataSize,
    });

    offsetSum += dataOffset + dataSize;
  }

  return items;
}

/**
 * Signs a stream (requires two instances/read passes)
 * @param s1 Stream to sign - same as s2
 * @param s2 Stream to sign - same as s1
 * @param signer Signer to use to sign the stream
 * @param opts Optional options to apply to the stream (same as DataItem)
 */

export async function streamSigner(s1: Readable, s2: Readable, signer: Signer, opts?: DataItemCreateOptions): Promise<PassThrough> {
  const header = createData("", signer, opts);
  const output = new PassThrough();

  const parts = [
    stringToBuffer("dataitem"),
    stringToBuffer("1"),
    stringToBuffer(header.signatureType.toString()),
    header.rawOwner,
    header.rawTarget,
    header.rawAnchor,
    header.rawTags,
    s1,
  ];

  const hash = await deepHash(parts);
  const sigBytes = Buffer.from(await signer.sign(hash));
  header.setSignature(sigBytes);
  output.write(header.getRaw());

  return s2.pipe(output);
}

async function readBytes(reader: AsyncGenerator<Buffer>, buffer: Uint8Array, length: number): Promise<Uint8Array> {
  if (buffer.byteLength >= length) return buffer;

  const { done, value } = await reader.next();

  if (done && !value) throw new Error("Invalid buffer");

  return readBytes(reader, Buffer.concat([Buffer.from(buffer), Buffer.from(value)]), length);
}

async function* getReader(s: Readable): AsyncGenerator<Buffer> {
  for await (const chunk of s) {
    yield chunk;
  }
}

export default processStream;

export const streamExportForTesting = {
  readBytes,
  getReader,
};
