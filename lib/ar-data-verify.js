"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFile = exports.verifyBundle = void 0;
const tslib_1 = require("tslib");
const DataItem_1 = tslib_1.__importStar(require("./DataItem"));
const util_1 = require("util");
const fs = tslib_1.__importStar(require("fs"));
const utils_1 = require("./utils");
const parser_1 = require("./parser");
const buffer_1 = require("buffer");
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
function verifyFile(filename) {
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
        const targetPresent = yield read(fd, buffer_1.Buffer.alloc(1), 1024, 64, null).then(value => value.buffer[0] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = (targetPresent ? 1057 : 1025);
        const anchorPresent = yield read(fd, buffer_1.Buffer.alloc(1), anchorPresentByte, 64, null).then(value => value.buffer[0] == 1);
        tagsStart += anchorPresent ? 32 : 0;
        const numberOfTags = utils_1.byteArrayToLong(yield read(fd, buffer_1.Buffer.alloc(8), tagsStart, 8, 0).then(value => value.buffer));
        if (numberOfTags == 0) {
            return true;
        }
        const numberOfTagBytesArray = yield read(fd, buffer_1.Buffer.alloc(8), tagsStart + 8, 8, 0).then(value => value.buffer);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        try {
            const tagBytes = yield read(fd, buffer_1.Buffer.alloc(8), tagsStart + 16, numberOfTagBytes, 0).then(value => value.buffer);
            const tags = parser_1.tagsParser.fromBuffer(tagBytes);
            if (tags.length !== numberOfTags) {
                return false;
            }
        }
        catch (e) {
            return false;
        }
        return true;
    });
}
exports.verifyFile = verifyFile;
//# sourceMappingURL=ar-data-verify.js.map