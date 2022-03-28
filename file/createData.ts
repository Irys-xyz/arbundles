import FileDataItem from "./FileDataItem";
import { DataItemCreateOptions } from "../src/arDataBase";
import * as fs from "fs";
import { tmpName } from "tmp-promise";
import base64url from "base64url";
import { longTo8ByteArray, shortTo2ByteArray } from "../src/utils";
import { serializeTags } from "../src/parser";
import { Signer } from "../src/signing";
import { pipeline } from "stream/promises";

/**
 * @param data
 * @param signer
 * @param opts
 * @returns
 */
export async function createData(
  data: string | Uint8Array | NodeJS.ReadableStream,
  signer: Signer,
  opts?: DataItemCreateOptions,
): Promise<FileDataItem> {
  const filename = await tmpName();
  const stream = fs.createWriteStream(filename);

  const _owner = signer.publicKey;

  const _target = opts?.target ? base64url.toBuffer(opts.target) : null;
  const _anchor = opts?.anchor ? Buffer.from(opts.anchor) : null;
  const _tags =
    (opts?.tags?.length ?? 0) > 0 ? await serializeTags(opts.tags) : null;

  stream.write(shortTo2ByteArray(signer.signatureType));

  stream.write(new Uint8Array(signer.signatureLength).fill(0));

  if (_owner.byteLength != signer.ownerLength) {
    throw new Error(`Owner must be ${signer.ownerLength} bytes`);
  }

  stream.write(_owner);
  stream.write(_target ? singleItemBuffer(1) : singleItemBuffer(0));
  if (_target) {
    if (_target.byteLength != 32) {
      throw new Error("Target must be 32 bytes");
    }
    stream.write(_target);
  }

  stream.write(_anchor ? singleItemBuffer(1) : singleItemBuffer(0));
  if (_anchor) {
    if (_anchor.byteLength != 32) {
      throw new Error("Anchor must be 32 bytes");
    }
    stream.write(_anchor);
  }

  stream.write(longTo8ByteArray(opts?.tags?.length ?? 0));
  const bytesCount = longTo8ByteArray(_tags?.byteLength ?? 0);
  stream.write(bytesCount);
  if (_tags) {
    stream.write(_tags);
  }

  if (
    typeof data[Symbol.asyncIterator as keyof AsyncIterable<Buffer>] ===
    "function"
  ) {
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
