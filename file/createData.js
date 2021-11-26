"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createData = void 0;
const FileDataItem_1 = __importDefault(require("./FileDataItem"));
const fs = __importStar(require("fs"));
const tmp_promise_1 = require("tmp-promise");
const base64url_1 = __importDefault(require("base64url"));
const assert_1 = __importDefault(require("assert"));
const utils_1 = require("../build/utils");
const parser_1 = require("../build/parser");
const promises_1 = require("stream/promises");
async function createData(data, signer, opts) {
  const filename = await tmp_promise_1.tmpName();
  const stream = fs.createWriteStream(filename);
  // TODO: Add asserts
  // Parse all values to a buffer and
  const _owner = signer.publicKey;
  const _target = opts?.target
    ? base64url_1.default.toBuffer(opts.target)
    : null;
  const _anchor = opts?.anchor ? Buffer.from(opts.anchor) : null;
  const _tags =
    (opts?.tags?.length ?? 0) > 0
      ? await parser_1.serializeTags(opts.tags)
      : null;
  stream.write(utils_1.shortTo2ByteArray(signer.signatureType));
  // Signature
  stream.write(new Uint8Array(signer.signatureLength).fill(0));
  assert_1.default(
    _owner.byteLength == signer.ownerLength,
    new Error(`Owner must be ${signer.ownerLength} bytes`),
  );
  stream.write(_owner);
  stream.write(_target ? singleItemBuffer(1) : singleItemBuffer(0));
  if (_target) {
    assert_1.default(
      _target.byteLength == 32,
      new Error("Target must be 32 bytes"),
    );
    stream.write(_target);
  }
  stream.write(_anchor ? singleItemBuffer(1) : singleItemBuffer(0));
  if (_anchor) {
    assert_1.default(
      _anchor.byteLength == 32,
      new Error("Anchor must be 32 bytes"),
    );
    stream.write(_anchor);
  }
  // TODO: Shall I manually add 8 bytes?
  // TODO: Finish this
  stream.write(utils_1.longTo8ByteArray(opts?.tags?.length ?? 0));
  const bytesCount = utils_1.longTo8ByteArray(_tags?.byteLength ?? 0);
  stream.write(bytesCount);
  if (_tags) {
    stream.write(_tags);
  }
  if (typeof data[Symbol.asyncIterator] === "function") {
    await promises_1.pipeline(data, stream);
  } else {
    stream.write(Buffer.from(data));
  }
  await new Promise((resolve) => {
    stream.end(resolve);
  });
  return new FileDataItem_1.default(filename);
}
exports.createData = createData;
function singleItemBuffer(i) {
  return Buffer.from([i]);
}
//# sourceMappingURL=createData.js.map
