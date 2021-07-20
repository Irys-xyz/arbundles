import { DataItemCreateOptions } from "./ar-data-base";
import { JWKPublicInterface } from "./interface-jwk";
import assert from "assert";
import base64url from "base64url";
import { longTo8ByteArray } from "./utils";
import { tagsParser } from "./parser";
import DataItem from "./DataItem";
import { Buffer } from "buffer";

const EMPTY_ARRAY = new Array(512).fill(0);
const OWNER_LENGTH = 512;

/**
 * This will create a single DataItem in binary format (Uint8Array)
 *
 * @param opts - Options involved in creating data items
 * @param jwk - User's jwk
 * @param encoding - encoding for raw data
 */
export async function createData(
  opts: DataItemCreateOptions,
  jwk: JWKPublicInterface,
  encoding?: BufferEncoding
): Promise<DataItem> {
  // TODO: Add asserts
  // Parse all values to a buffer and
  const _owner = Buffer.from(base64url.decode(jwk.n, "hex"), "hex");
  assert(_owner.byteLength == OWNER_LENGTH, new Error(`Public key isn't the correct length: ${_owner.byteLength}`));

  const _target = opts.target ? Buffer.from(base64url.decode(opts.target, "hex")) : null;
  const target_length = 1 + (_target?.byteLength ?? 0);
  const _anchor = opts.anchor ? Buffer.from(opts.anchor) : null;
  const anchor_length = 1 + (_anchor?.byteLength ?? 0);
  const _tags = (opts.tags?.length ?? 0) > 0 ? await serializeTags(opts.tags) : null;
  const tags_length = 16 + (_tags ? _tags.byteLength : 0);
  const _data = typeof opts.data === "string" ? Buffer.from(opts.data, encoding) : Buffer.from(opts.data);
  const data_length = _data.byteLength;


  // See [https://github.com/joshbenaron/arweave-standards/blob/ans104/ans/ANS-104.md#13-dataitem-format]
  const length = 512 + OWNER_LENGTH + target_length + anchor_length + tags_length + data_length;
  // Create array with set length
  const bytes = Buffer.alloc(length);

  // Push bytes for `signature`
  bytes.set(EMPTY_ARRAY, 0);
  // // Push bytes for `id`
  // bytes.set(EMPTY_ARRAY, 32);
  // Push bytes for `owner`

  assert(_owner.byteLength == 512, new Error("Owner must be 512 bytes"));
  bytes.set(_owner, 512);

  // Push `presence byte` and push `target` if present
  // 64 + OWNER_LENGTH
  bytes[1024] = _target ? 1  : 0;
  if (_target) {
    assert(_target.byteLength == 32, new Error("Target must be 32 bytes"));
    bytes.set(_target, 1025);
  }

  // Push `presence byte` and push `anchor` if present
  // 64 + OWNER_LENGTH
  const anchor_start = 1024 + target_length;
  let tags_start = anchor_start + 1;
  bytes[anchor_start] = _anchor ? 1 : 0;
  if (_anchor) {
    tags_start += _anchor.byteLength;
    assert(_anchor.byteLength == 32, new Error("Anchor must be 32 bytes"));
    bytes.set(_anchor, anchor_start + 1);
  }

  // TODO: Shall I manually add 8 bytes?
  // TODO: Finish this
  bytes.set(longTo8ByteArray(opts.tags?.length ?? 0), tags_start);
  const bytesCount = longTo8ByteArray(_tags?.byteLength ?? 0);
  bytes.set(bytesCount, tags_start + 8);
  if (_tags) {
    bytes.set(_tags, tags_start + 16)
  }

  const data_start = tags_start + tags_length;

  bytes.set(_data, data_start);

  return new DataItem(bytes);
}

async function serializeTags(tags: { name: string; value: string }[]): Promise<Uint8Array> {
  if (tags!.length == 0) {
    return new Uint8Array(0);
  }

  return Uint8Array.from(tagsParser.toBuffer(tags));
}
