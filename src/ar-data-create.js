"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createData = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const utils_1 = require("./utils");
const parser_1 = require("./parser");
const DataItem_1 = tslib_1.__importDefault(require("./DataItem"));
const buffer_1 = require("buffer");
const EMPTY_ARRAY = new Array(512).fill(0);
const OWNER_LENGTH = 512;
/**
 * This will create a single DataItem in binary format (Uint8Array)
 *
 * @param opts - Options involved in creating data items
 * @param jwk - User's jwk
 * @param encoding - encoding for raw data
 */
function createData(opts, jwk, encoding) {
    var _a, _b, _c, _d, _e, _f, _g;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // TODO: Add asserts
        // Parse all values to a buffer and
        const _owner = buffer_1.Buffer.from(base64url_1.default.decode(jwk.n, "hex"), "hex");
        assert_1.default(_owner.byteLength == OWNER_LENGTH, new Error(`Public key isn't the correct length: ${_owner.byteLength}`));
        const _target = opts.target ? buffer_1.Buffer.from(opts.target) : null;
        const target_length = 1 + ((_a = _target === null || _target === void 0 ? void 0 : _target.byteLength) !== null && _a !== void 0 ? _a : 0);
        const _anchor = opts.anchor ? buffer_1.Buffer.from(opts.anchor) : null;
        const anchor_length = 1 + ((_b = _anchor === null || _anchor === void 0 ? void 0 : _anchor.byteLength) !== null && _b !== void 0 ? _b : 0);
        const _tags = ((_d = (_c = opts.tags) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0 ? yield serializeTags(opts.tags) : null;
        const tags_length = 16 + (_tags ? _tags.byteLength : 0);
        const _data = typeof opts.data === "string" ? buffer_1.Buffer.from(opts.data, encoding) : buffer_1.Buffer.from(opts.data);
        const data_length = _data.byteLength;
        // See [https://github.com/joshbenaron/arweave-standards/blob/ans104/ans/ANS-104.md#13-dataitem-format]
        const length = 512 + OWNER_LENGTH + target_length + anchor_length + tags_length + data_length;
        // Create array with set length
        const bytes = new Uint8Array(length);
        // Push bytes for `signature`
        bytes.set(EMPTY_ARRAY, 0);
        // // Push bytes for `id`
        // bytes.set(EMPTY_ARRAY, 32);
        // Push bytes for `owner`
        assert_1.default(_owner.byteLength == 512, new Error("Owner must be 512 bytes"));
        bytes.set(_owner, 512);
        // Push `presence byte` and push `target` if present
        // 64 + OWNER_LENGTH
        bytes[1024] = _target ? 1 : 0;
        if (_target) {
            assert_1.default(_target.byteLength == 32, new Error("Target must be 32 bytes"));
            bytes.set(_target, 1025);
        }
        // Push `presence byte` and push `anchor` if present
        // 64 + OWNER_LENGTH
        const anchor_start = 1024 + target_length;
        let tags_start = anchor_start + 1;
        bytes[anchor_start] = _anchor ? 1 : 0;
        if (_anchor) {
            tags_start += _anchor.byteLength;
            assert_1.default(_anchor.byteLength == 32, new Error("Anchor must be 32 bytes"));
            bytes.set(_anchor, anchor_start + 1);
        }
        // TODO: Shall I manually add 8 bytes?
        // TODO: Finish this
        bytes.set(utils_1.longTo8ByteArray((_f = (_e = opts.tags) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0), tags_start);
        const bytesCount = utils_1.longTo8ByteArray((_g = _tags === null || _tags === void 0 ? void 0 : _tags.byteLength) !== null && _g !== void 0 ? _g : 0);
        bytes.set(bytesCount, tags_start + 8);
        if (_tags) {
            bytes.set(_tags, tags_start + 16);
        }
        const data_start = tags_start + tags_length;
        bytes.set(_data, data_start);
        return new DataItem_1.default(bytes);
    });
}
exports.createData = createData;
function serializeTags(tags) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (tags.length == 0) {
            return new Uint8Array(0);
        }
        return Uint8Array.from(parser_1.tagsParser.toBuffer(tags));
    });
}
//# sourceMappingURL=ar-data-create.js.map