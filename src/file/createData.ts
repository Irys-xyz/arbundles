import FileDataItem from './FileDataItem';
import { DataItemCreateOptions } from '../ar-data-base';
import { PathLike } from 'fs';
import * as fs from 'fs';
import { file } from 'tmp-promise';
import base64url from 'base64url';
import assert from 'assert';
import { Buffer } from 'buffer';
import { longTo8ByteArray, shortTo2ByteArray } from '../utils';
import { serializeTags } from '../parser';
import { Signer } from '../signing';

const EMPTY_ARRAY = new Array(512).fill(0);
const OWNER_LENGTH = 512;

interface CreateFileDataItemOptions {
  path?: PathLike;
  stream?: fs.WriteStream
}

export async function createData(
  opts: DataItemCreateOptions,
  signer: Signer,
  createOpts?: CreateFileDataItemOptions
): Promise<FileDataItem> {
  const filename = await file();
  const stream = createOpts?.stream ?? fs.createWriteStream(filename.path);

  // TODO: Add asserts
  // Parse all values to a buffer and
  const _owner = signer.publicKey;
  assert(_owner.byteLength == OWNER_LENGTH, new Error(`Public key isn't the correct length: ${_owner.byteLength}`));

  const _target = opts.target ? base64url.toBuffer(opts.target) : null;
  const _anchor = opts.anchor ? Buffer.from(opts.anchor) : null;
  const _tags = (opts.tags?.length ?? 0) > 0 ? await serializeTags(opts.tags) : null;
  const _data = typeof opts.data === "string" ? Buffer.from(opts.data) : Buffer.from(opts.data);


  stream.write(shortTo2ByteArray(signer.signatureType));
  // Signature
  stream.write(Uint8Array.from(EMPTY_ARRAY));


  stream.write(_owner);
  stream.write(_target ? singleItemBuffer(1)  : singleItemBuffer(0))
  if (_target) {
    assert(_target.byteLength == 32, new Error("Target must be 32 bytes"));
    stream.write(_target);
  }

  stream.write(_anchor ? singleItemBuffer(1) : singleItemBuffer(0));
  if (_anchor) {
    assert(_anchor.byteLength == 32, new Error("Anchor must be 32 bytes"));
    stream.write(_anchor);
  }

  // TODO: Shall I manually add 8 bytes?
  // TODO: Finish this
  stream.write(longTo8ByteArray(opts.tags?.length ?? 0));
  const bytesCount = longTo8ByteArray(_tags?.byteLength ?? 0);
  stream.write(bytesCount);
  if (_tags) {
    stream.write(_tags);
  }

  stream.write(_data);

  await new Promise(resolve => {
    stream.end(resolve);
  });

  return new FileDataItem(filename.path);
}

function singleItemBuffer(i: number): Buffer {
  return Buffer.from([i]);
}

