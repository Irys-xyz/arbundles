"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeaders = exports.getHeaderAt = exports.numberOfItems = exports.fileToJson = exports.getTags = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const util_1 = require("util");
const buffer_1 = require("buffer");
const utils_1 = require("./utils");
const parser_1 = require("./parser");
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const read = util_1.promisify(fs.read);
function getTags(filename) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fs.promises.open(filename, 'r').then(handle => handle.fd);
        let tagsStart = 512 + 512 + 2;
        const targetPresent = yield read(fd, buffer_1.Buffer.alloc(1), 1024, 64, null).then(value => value.buffer[0] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = (targetPresent ? 1057 : 1025);
        const anchorPresent = yield read(fd, buffer_1.Buffer.alloc(1), anchorPresentByte, 64, null).then(value => value.buffer[0] == 1);
        tagsStart += anchorPresent ? 32 : 0;
        const numberOfTags = utils_1.byteArrayToLong(yield read(fd, buffer_1.Buffer.alloc(8), tagsStart, 8, 0).then(value => value.buffer));
        if (numberOfTags == 0) {
            return [];
        }
        const numberOfTagBytesArray = yield read(fd, buffer_1.Buffer.alloc(8), tagsStart + 8, 8, 0).then(value => value.buffer);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        const tagBytes = yield read(fd, buffer_1.Buffer.alloc(8), tagsStart + 16, numberOfTagBytes, 0).then(value => value.buffer);
        return parser_1.tagsParser.fromBuffer(tagBytes);
    });
}
exports.getTags = getTags;
function fileToJson(filename) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = yield fs.promises.open(filename, 'r').then(handle => handle.fd);
        let tagsStart = 512 + 512 + 2;
        const targetPresent = yield read(fd, buffer_1.Buffer.alloc(1), 1024, 64, null).then(value => value.buffer[0] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = (targetPresent ? 1057 : 1025);
        const anchorPresent = yield read(fd, buffer_1.Buffer.alloc(1), anchorPresentByte, 64, null).then(value => value.buffer[0] == 1);
        tagsStart += anchorPresent ? 32 : 0;
        const numberOfTags = utils_1.byteArrayToLong(yield read(fd, buffer_1.Buffer.alloc(8), tagsStart, 8, 0).then(value => value.buffer));
        let tags = [];
        if (numberOfTags > 0) {
            const numberOfTagBytesArray = yield read(fd, buffer_1.Buffer.alloc(8), tagsStart + 8, 8, 0).then(value => value.buffer);
            const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
            const tagBytes = yield read(fd, buffer_1.Buffer.alloc(8), tagsStart + 16, numberOfTagBytes, 0).then(value => value.buffer);
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
        const fd = typeof file === "number"
            ? file
            : yield fs.promises.open(file, 'r').then(handle => handle.fd);
        const headerBuffer = yield read(fd, buffer_1.Buffer.allocUnsafe(64), 0, 32, null).then(v => v.buffer);
        return utils_1.byteArrayToLong(headerBuffer);
    });
}
exports.numberOfItems = numberOfItems;
function getHeaderAt(file, index) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fd = typeof file === "number"
            ? file
            : yield fs.promises.open(file, 'r').then(handle => handle.fd);
        const headerBuffer = yield read(fd, buffer_1.Buffer.allocUnsafe(64), 32 + (64 * index), 64, null).then(v => v.buffer);
        return {
            offset: utils_1.byteArrayToLong(headerBuffer.slice(0, 32)),
            id: base64url_1.default.encode(headerBuffer.slice(32, 64))
        };
    });
}
exports.getHeaderAt = getHeaderAt;
function getHeaders(file) {
    return tslib_1.__asyncGenerator(this, arguments, function* getHeaders_1() {
        const fd = typeof file === "number"
            ? file
            : yield tslib_1.__await(fs.promises.open(file, 'r').then(handle => handle.fd));
        const count = yield tslib_1.__await(numberOfItems(fd));
        for (let i = 0; i < count; i++) {
            yield yield tslib_1.__await(getHeaderAt(fd, i));
        }
    });
}
exports.getHeaders = getHeaders;
//# sourceMappingURL=file.js.map