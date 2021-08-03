"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDataItemInFile = exports.verifyBundle = void 0;
const tslib_1 = require("tslib");
const DataItem_1 = tslib_1.__importStar(require("./DataItem"));
const util_1 = require("util");
const fs = tslib_1.__importStar(require("fs"));
const utils_1 = require("./utils");
const parser_1 = require("./parser");
const buffer_1 = require("buffer");
const arweave_1 = tslib_1.__importDefault(require("arweave"));
const deepHash_1 = tslib_1.__importDefault(require("./deepHash"));
const utils_2 = require("arweave/web/lib/utils");
/**
 * Verifies a bundle and all of its DataItems
 *
 * @param bundle
 */
function verifyBundle(bundle) {
    return bundle.verify();
}
exports.verifyBundle = verifyBundle;
const MAX_SINGLE_FILE_SIZE = 100 * 1028 * 1028;
const read = util_1.promisify(fs.read);
function verifyDataItemInFile(filename, signatureVerification) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const status = yield fs.promises.stat(filename);
        if (status.size < DataItem_1.MIN_BINARY_SIZE) {
            return false;
        }
        if (status.size < MAX_SINGLE_FILE_SIZE) {
            return DataItem_1.default.verify(yield fs.promises.readFile(filename));
        }
        const fd = yield fs.promises.open(filename, 'r').then(handle => handle.fd);
        let tagsStart = 512 + 512 + 2;
        const targetPresent = yield read(fd, buffer_1.Buffer.alloc(1), 1024, 1, null).then(value => value.buffer[0] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = (targetPresent ? 1057 : 1025);
        const anchorPresent = yield read(fd, buffer_1.Buffer.alloc(1), anchorPresentByte, 1, null).then(value => value.buffer[0] == 1);
        tagsStart += anchorPresent ? 32 : 0;
        const numberOfTags = utils_1.byteArrayToLong(yield read(fd, buffer_1.Buffer.alloc(8), tagsStart, 8, null).then(value => value.buffer));
        if (numberOfTags == 0) {
            return true;
        }
        const numberOfTagBytesArray = yield read(fd, buffer_1.Buffer.alloc(8), tagsStart + 8, 8, null).then(value => value.buffer);
        const numberOfTagsBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        const tagBytes = yield read(fd, buffer_1.Buffer.alloc(8), tagsStart + 16, numberOfTagsBytes, null).then(value => value.buffer);
        try {
            const tags = parser_1.tagsParser.fromBuffer(tagBytes);
            if (tags.length !== numberOfTags) {
                return false;
            }
        }
        catch (e) {
            return false;
        }
        const owner = yield read(fd, buffer_1.Buffer.alloc(512), 512, 1024, null).then(value => Uint8Array.from(value.buffer));
        const target = targetPresent ? yield read(fd, buffer_1.Buffer.alloc(32), 1025, 1025 + 32, null).then(value => Uint8Array.from(value.buffer)) : buffer_1.Buffer.alloc(0);
        const anchor = anchorPresent ? yield read(fd, buffer_1.Buffer.alloc(32), anchorPresentByte + 1, anchorPresentByte + 33, null).then(value => Uint8Array.from(value.buffer)) : buffer_1.Buffer.alloc(0);
        const tags = tagBytes;
        const data = yield read(fd, buffer_1.Buffer.alloc(512), tagsStart + 16 + numberOfTagsBytes, status.size - tagsStart + 16 + numberOfTagsBytes, null).then(value => Uint8Array.from(value.buffer));
        console.log(data.length);
        if (signatureVerification) {
            const { n, signature } = signatureVerification;
            const signatureData = yield deepHash_1.default([
                utils_2.stringToBuffer('dataitem'),
                utils_2.stringToBuffer('1'),
                owner,
                target,
                anchor,
                tags,
                data,
            ]);
            return yield arweave_1.default.crypto.verify(n, signatureData, signature);
        }
        return true;
    });
}
exports.verifyDataItemInFile = verifyDataItemInFile;
//# sourceMappingURL=ar-data-verify.js.map