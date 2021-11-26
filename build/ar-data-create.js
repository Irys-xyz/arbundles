"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createData = void 0;
const assert_1 = __importDefault(require("assert"));
const base64url_1 = __importDefault(require("base64url"));
const utils_1 = require("./utils");
const DataItem_1 = __importDefault(require("./DataItem"));
const parser_1 = require("./parser");
/**
 * This will create a single DataItem in binary format (Uint8Array)
 *
 * @param data
 * @param opts - Options involved in creating data items
 * @param signer
 */
function createData(data, signer, opts) {
  // TODO: Add asserts
  // Parse all values to a buffer and
  const _owner = signer.publicKey;
  const _target = opts?.target
    ? base64url_1.default.toBuffer(opts.target)
    : null;
  const target_length = 1 + (_target?.byteLength ?? 0);
  const _anchor = opts?.anchor ? Buffer.from(opts.anchor) : null;
  const anchor_length = 1 + (_anchor?.byteLength ?? 0);
  const _tags =
    (opts?.tags?.length ?? 0) > 0 ? parser_1.serializeTags(opts.tags) : null;
  const tags_length = 16 + (_tags ? _tags.byteLength : 0);
  const _data =
    typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  const data_length = _data.byteLength;
  // See [https://github.com/joshbenaron/arweave-standards/blob/ans104/ans/ANS-104.md#13-dataitem-format]
  const length =
    2 +
    signer.signatureLength +
    signer.ownerLength +
    target_length +
    anchor_length +
    tags_length +
    data_length;
  // Create array with set length
  const bytes = Buffer.alloc(length);
  bytes.set(utils_1.shortTo2ByteArray(signer.signatureType), 0);
  // Push bytes for `signature`
  bytes.set(new Uint8Array(signer.signatureLength).fill(0), 2);
  // // Push bytes for `id`
  // bytes.set(EMPTY_ARRAY, 32);
  // Push bytes for `owner`
  assert_1.default(
    _owner.byteLength == signer.ownerLength,
    new Error(
      `Owner must be ${signer.ownerLength} bytes, but was incorrectly ${_owner.byteLength}`,
    ),
  );
  bytes.set(_owner, 2 + signer.signatureLength);
  const position = 2 + signer.signatureLength + signer.ownerLength;
  // Push `presence byte` and push `target` if present
  // 64 + OWNER_LENGTH
  bytes[position] = _target ? 1 : 0;
  if (_target) {
    assert_1.default(
      _target.byteLength == 32,
      new Error(
        "Target must be 32 bytes but was incorrectly ${_target.byteLength}",
      ),
    );
    bytes.set(_target, position + 1);
  }
  // Push `presence byte` and push `anchor` if present
  // 64 + OWNER_LENGTH
  const anchor_start = position + target_length;
  let tags_start = anchor_start + 1;
  bytes[anchor_start] = _anchor ? 1 : 0;
  if (_anchor) {
    tags_start += _anchor.byteLength;
    assert_1.default(
      _anchor.byteLength == 32,
      new Error("Anchor must be 32 bytes"),
    );
    bytes.set(_anchor, anchor_start + 1);
  }
  bytes.set(utils_1.longTo8ByteArray(opts?.tags?.length ?? 0), tags_start);
  const bytesCount = utils_1.longTo8ByteArray(_tags?.byteLength ?? 0);
  bytes.set(bytesCount, tags_start + 8);
  if (_tags) {
    bytes.set(_tags, tags_start + 16);
  }
  const data_start = tags_start + tags_length;
  bytes.set(_data, data_start);
  return new DataItem_1.default(bytes);
}
exports.createData = createData;
//# sourceMappingURL=ar-data-create.js.map
