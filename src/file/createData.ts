import FileDataItem from "./FileDataItem";
import type { DataItemCreateOptions } from "../ar-data-base";
import { tmpName } from "tmp-promise";
import base64url from "base64url";
import { longTo8ByteArray, shortTo2ByteArray } from "../utils";
import { serializeTags } from "../tags";
import type { Signer } from "../signing/index";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

export async function createData(
  data: string | Uint8Array | NodeJS.ReadableStream,
  signer: Signer,
  opts?: DataItemCreateOptions,
): Promise<FileDataItem> {
  const filename = await tmpName();
  const stream = createWriteStream(filename);

  // TODO: Add asserts
  // Parse all values to a buffer and
  const _owner = signer.publicKey;

  const _target = opts?.target ? base64url.toBuffer(opts.target) : null;
  const _anchor = opts?.anchor ? Buffer.from(opts.anchor) : null;
  // @ts-expect-error undefined opts.tags already has a guard
  const _tags = (opts?.tags?.length ?? 0) > 0 ? serializeTags(opts.tags) : null;

  stream.write(shortTo2ByteArray(signer.signatureType));
  // Signature
  stream.write(new Uint8Array(signer.signatureLength).fill(0));
  if (_owner.byteLength !== signer.ownerLength) new Error(`Owner must be ${signer.ownerLength} bytes`);

  stream.write(_owner);
  stream.write(_target ? singleItemBuffer(1) : singleItemBuffer(0));
  if (_target) {
    if (_target.byteLength !== 32) throw new Error("Target must be 32 bytes");
    stream.write(_target);
  }

  stream.write(_anchor ? singleItemBuffer(1) : singleItemBuffer(0));
  if (_anchor) {
    if (_anchor.byteLength !== 32) throw new Error("Anchor must be 32 bytes");
    stream.write(_anchor);
  }

  // TODO: Shall I manually add 8 bytes?
  // TODO: Finish this
  stream.write(longTo8ByteArray(opts?.tags?.length ?? 0));
  const bytesCount = longTo8ByteArray(_tags?.byteLength ?? 0);
  stream.write(bytesCount);
  if (_tags) {
    stream.write(_tags);
  }

  if (typeof data[Symbol.asyncIterator as keyof AsyncIterable<Buffer>] === "function") {
    await pipeline(data as NodeJS.ReadableStream, stream);
  } else {
    stream.write(Buffer.from(data as string | Buffer));
  }

  await new Promise((resolve) => {
    stream.end(resolve);
  });

  return new FileDataItem(filename);
}

function singleItemBuffer(i: number): Buffer {
  return Buffer.from([i]);
}
