import { DataItemCreateOptions } from "./arDataBase";
import base64url from "base64url";
import { longTo8ByteArray, shortTo2ByteArray } from "./utils";
import DataItem from "./DataItem";
import { serializeTags } from "./parser";
import { Signer } from "./signing";

/**
 * This will create a single DataItem in binary format (Uint8Array)
 *
 * @param data
 * @param opts - Options involved in creating data items
 * @param signer
 */
export function createData(
  data: string | Uint8Array,
  signer: Signer,
  opts?: DataItemCreateOptions,
): DataItem {
  const _owner = signer.publicKey;

  const _target = opts?.target ? base64url.toBuffer(opts.target) : null;
  const targetLength = 1 + (_target?.byteLength ?? 0);
  const _anchor = opts?.anchor ? Buffer.from(opts.anchor) : null;
  const anchorLength = 1 + (_anchor?.byteLength ?? 0);
  const _tags = (opts?.tags?.length ?? 0) > 0 ? serializeTags(opts.tags) : null;
  const tagsLength = 16 + (_tags ? _tags.byteLength : 0);
  const _data =
    typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  const dataLength = _data.byteLength;

  const length =
    2 +
    signer.signatureLength +
    signer.ownerLength +
    targetLength +
    anchorLength +
    tagsLength +
    dataLength;

  const bytes = Buffer.alloc(length);

  bytes.set(shortTo2ByteArray(signer.signatureType), 0);

  bytes.set(new Uint8Array(signer.signatureLength).fill(0), 2);

  if (_owner.byteLength != signer.ownerLength) {
    throw new Error(
      `Owner must be ${signer.ownerLength} bytes, but was incorrectly ${_owner.byteLength}`,
    );
  }

  bytes.set(_owner, 2 + signer.signatureLength);

  const position = 2 + signer.signatureLength + signer.ownerLength;

  bytes[position] = _target ? 1 : 0;
  if (_target) {
    if (_target.byteLength != 32) {
      throw new Error(
        `Target must be 32 bytes but was incorrectly ${_target.byteLength}`,
      );
    }
    bytes.set(_target, position + 1);
  }

  const anchorStart = position + targetLength;
  let tagsStart = anchorStart + 1;
  bytes[anchorStart] = _anchor ? 1 : 0;
  if (_anchor) {
    tagsStart += _anchor.byteLength;
    if (_anchor.byteLength != 32) {
      throw new Error("Anchor must be 32 bytes");
    }
    bytes.set(_anchor, anchorStart + 1);
  }

  bytes.set(longTo8ByteArray(opts?.tags?.length ?? 0), tagsStart);
  const bytesCount = longTo8ByteArray(_tags?.byteLength ?? 0);
  bytes.set(bytesCount, tagsStart + 8);
  if (_tags) {
    bytes.set(_tags, tagsStart + 16);
  }

  const dataStart = tagsStart + tagsLength;

  bytes.set(_data, dataStart);

  return new DataItem(bytes);
}
