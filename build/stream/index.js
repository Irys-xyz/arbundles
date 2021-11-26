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
exports.verifyAndIndexStream = void 0;
const utils_1 = require("../utils");
const base64url_1 = __importDefault(require("base64url"));
const index_1 = require("../index");
const constants_1 = require("../constants");
const parser_1 = require("../parser");
const fs = __importStar(require("fs"));
async function* verifyAndIndexStream(stream) {
  const reader = getReader(stream);
  let bytes = (await reader.next()).value;
  bytes = await hasEnough(reader, bytes, 32);
  const itemCount = utils_1.byteArrayToLong(bytes.subarray(0, 32));
  bytes = bytes.subarray(32);
  const headersLength = 64 * itemCount;
  bytes = await hasEnough(reader, bytes, headersLength);
  const headers = new Array(itemCount);
  for (let i = 0; i < headersLength; i += 64) {
    headers[i / 64] = [
      utils_1.byteArrayToLong(bytes.subarray(i, i + 32)),
      base64url_1.default(Buffer.from(bytes.subarray(i + 32, i + 64))),
    ];
  }
  bytes = bytes.subarray(headersLength);
  let offsetSum = 32 + headersLength;
  for (const [length, id] of headers) {
    const now = performance.now();
    bytes = await hasEnough(reader, bytes, index_1.MIN_BINARY_SIZE);
    // Get sig type
    bytes = await hasEnough(reader, bytes, 2);
    const signatureType = utils_1.byteArrayToLong(bytes.subarray(0, 2));
    bytes = bytes.subarray(2);
    // Get sig
    const sigLength = constants_1.SIG_CONFIG[signatureType].sigLength;
    bytes = await hasEnough(reader, bytes, sigLength);
    const signature = bytes.subarray(0, sigLength);
    bytes = bytes.subarray(sigLength);
    // Get owner
    const pubLength = constants_1.SIG_CONFIG[signatureType].pubLength;
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
    const tagsLength = utils_1.byteArrayToLong(bytes.subarray(0, 8));
    bytes = bytes.subarray(8);
    bytes = await hasEnough(reader, bytes, 8);
    const tagsBytesLength = utils_1.byteArrayToLong(bytes.subarray(0, 8));
    bytes = bytes.subarray(8);
    bytes = await hasEnough(reader, bytes, tagsBytesLength);
    const tags =
      tagsLength !== 0 && tagsBytesLength !== 0
        ? parser_1.tagsParser.fromBuffer(
            Buffer.from(bytes.subarray(0, tagsBytesLength)),
          )
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
      signature: base64url_1.default(Buffer.from(signature)),
      target: base64url_1.default(Buffer.from(target)),
      anchor: base64url_1.default(Buffer.from(anchor)),
      owner: base64url_1.default(Buffer.from(owner)),
      tags,
      dataOffset: offsetSum + dataOffset,
    };
    offsetSum += dataOffset + dataSize;
    console.log(`Index item took ${performance.now() - now}`);
  }
}
exports.verifyAndIndexStream = verifyAndIndexStream;
async function hasEnough(reader, buffer, length) {
  if (buffer.byteLength > length) return buffer;
  buffer = Buffer.concat([buffer, (await reader.next()).value]);
  if (buffer.byteLength > length) return buffer;
  return buffer;
}
async function* getReader(s) {
  for await (const chunk of s) {
    console.log(chunk.length);
    yield chunk;
  }
}
//# sourceMappingURL=index.js.map
