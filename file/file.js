"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTags = exports.getAnchor = exports.getTarget = exports.getOwner = exports.getSignature = exports.getHeaders = exports.getHeaderAt = exports.numberOfItems = exports.fileToJson = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const util_1 = require("util");
const utils_1 = require("../lib/utils");
const parser_1 = require("../lib/parser");
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const read = util_1.promisify(fs.read);
const fileToFd = (f) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return typeof f === "string"
        ? yield fs.promises.open(f, 'r')
        : f;
});
function fileToJson(filename) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fs.promises.open(filename, 'r').then(handle => handle.fd);
        let tagsStart = 512 + 512 + 2;
        const targetPresent = yield read(fd, Buffer.alloc(1), 1024, 64, null).then(value => value.buffer[0] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = (targetPresent ? 1057 : 1025);
        const anchorPresent = yield read(fd, Buffer.alloc(1), anchorPresentByte, 64, null).then(value => value.buffer[0] == 1);
        tagsStart += anchorPresent ? 32 : 0;
        const numberOfTags = utils_1.byteArrayToLong(yield read(fd, Buffer.alloc(8), tagsStart, 8, 0).then(value => value.buffer));
        let tags = [];
        if (numberOfTags > 0) {
            const numberOfTagBytesArray = yield read(fd, Buffer.alloc(8), tagsStart + 8, 8, 0).then(value => value.buffer);
            const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
            const tagBytes = yield read(fd, Buffer.alloc(8), tagsStart + 16, numberOfTagBytes, 0).then(value => value.buffer);
            tags = parser_1.tagsParser.fromBuffer(tagBytes);
        }
        const id = filename;
        const owner = "";
        const target = "";
        const data_size = 0;
        const fee = 0;
        const signature = "";
        return {
            id,
            owner,
            tags,
            target,
            data_size,
            fee,
            signature
        };
    });
}
exports.fileToJson = fileToJson;
function numberOfItems(file) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fileToFd(file);
        const headerBuffer = yield read(fd.fd, Buffer.allocUnsafe(32), 0, 32, 0).then(v => v.buffer);
        yield fd.close();
        return utils_1.byteArrayToLong(headerBuffer);
    });
}
exports.numberOfItems = numberOfItems;
function getHeaderAt(file, index) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fileToFd(file);
        const headerBuffer = yield read(fd.fd, Buffer.alloc(64), 0, 64, 32 + (64 * index)).then(v => v.buffer)
            .catch(_ => console.log("lol"));
        return {
            offset: utils_1.byteArrayToLong(headerBuffer.slice(0, 32)),
            id: base64url_1.default.encode(headerBuffer.slice(32, 64))
        };
    });
}
exports.getHeaderAt = getHeaderAt;
function getHeaders(file) {
    return tslib_1.__asyncGenerator(this, arguments, function* getHeaders_1() {
        const count = yield tslib_1.__await(numberOfItems(file));
        console.log(count);
        for (let i = 0; i < count; i++) {
            yield yield tslib_1.__await(getHeaderAt(file, i));
        }
    });
}
exports.getHeaders = getHeaders;
function getSignature(file, options) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fileToFd(file);
        const offset = (_a = options.offset) !== null && _a !== void 0 ? _a : 0;
        const buffer = yield read(fd.fd, Buffer.allocUnsafe(512), offset, 512, null).then(r => r.buffer);
        yield fd.close();
        return buffer;
    });
}
exports.getSignature = getSignature;
function getOwner(file, options) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fileToFd(file);
        const offset = (_a = options.offset) !== null && _a !== void 0 ? _a : 0;
        const buffer = yield read(fd.fd, Buffer.allocUnsafe(512), offset + 512, 512, null).then(r => r.buffer);
        yield fd.close();
        return base64url_1.default.encode(buffer, "hex");
    });
}
exports.getOwner = getOwner;
function getTarget(file, options) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fileToFd(file);
        const offset = (_a = options.offset) !== null && _a !== void 0 ? _a : 0;
        const targetStart = offset + 1024;
        const targetPresent = yield read(fd.fd, Buffer.allocUnsafe(1), targetStart, 1, null).then(value => value.buffer[0] == 1);
        if (!targetPresent) {
            return undefined;
        }
        const buffer = yield read(fd.fd, Buffer.allocUnsafe(32), targetStart + 1, 32, null).then(r => r.buffer);
        yield fd.close();
        return base64url_1.default.encode(buffer, "hex");
    });
}
exports.getTarget = getTarget;
function getAnchor(file, options) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fileToFd(file);
        const offset = (_a = options.offset) !== null && _a !== void 0 ? _a : 0;
        const targetPresent = yield read(fd.fd, Buffer.allocUnsafe(1), 1024, 1, null).then(value => value.buffer[0] == 1);
        let anchorStart = offset + 1025;
        if (targetPresent) {
            anchorStart += 32;
        }
        const anchorPresent = yield read(fd.fd, Buffer.allocUnsafe(1), anchorStart, 1, null).then(value => value.buffer[0] == 1);
        if (!anchorPresent) {
            return undefined;
        }
        const buffer = yield read(fd.fd, Buffer.allocUnsafe(32), anchorStart + 1, 32, null).then(r => r.buffer);
        yield fd.close();
        return base64url_1.default.encode(buffer, "hex");
    });
}
exports.getAnchor = getAnchor;
function getTags(file, options) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fileToFd(file);
        const offset = (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : 0;
        let tagsStart = 512 + 512 + 2 + ((_b = options === null || options === void 0 ? void 0 : options.offset) !== null && _b !== void 0 ? _b : 0);
        const targetPresent = yield read(fd.fd, Buffer.allocUnsafe(1), 0, 1, offset + 1024).then(value => value.buffer[0] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = offset + (targetPresent ? 1057 : 1025);
        const anchorPresent = yield read(fd.fd, Buffer.allocUnsafe(1), 0, 1, anchorPresentByte).then(value => value.buffer[0] == 1);
        tagsStart += anchorPresent ? 32 : 0;
        console.log(tagsStart - offset);
        const numberOfTags = utils_1.byteArrayToLong(yield read(fd.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart).then(value => value.buffer));
        console.log(numberOfTags);
        if (numberOfTags == 0) {
            return [];
        }
        const numberOfTagBytesArray = yield read(fd.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart + 8).then(value => value.buffer);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        const tagBytes = yield read(fd.fd, Buffer.allocUnsafe(numberOfTagBytes), 0, numberOfTagBytes, tagsStart + 16).then(value => value.buffer);
        yield fd.close();
        return parser_1.tagsParser.fromBuffer(tagBytes);
    });
}
exports.getTags = getTags;
//# sourceMappingURL=file.js.map
