"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFile = exports.verifyData = exports.verifyBundle = void 0;
const tslib_1 = require("tslib");
const DataItem_1 = tslib_1.__importDefault(require("./DataItem"));
const util_1 = require("util");
const fs = tslib_1.__importStar(require("fs"));
/**
 * Verifies a bundle and all of its DataItems
 *
 * @param bundle
 */
function verifyBundle(bundle) {
    return bundle.verify();
}
exports.verifyBundle = verifyBundle;
function verifyData(item) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return item.verify();
    });
}
exports.verifyData = verifyData;
const read = util_1.promisify(fs.read);
const readFile = util_1.promisify(fs.readFile);
const open = util_1.promisify(fs.open);
const stat = util_1.promisify(fs.stat);
const MAX_FILE_SIZE = 100 * 1028 * 1028;
function verifyFile(filename) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const status = yield stat(filename);
        if (status.size < MAX_FILE_SIZE) {
            return DataItem_1.default.verify(yield readFile(filename));
        }
        const fd = yield open(filename, 'r');
        const first = yield read(fd, Buffer.alloc(64), 0, 64, null);
        first.buffer;
        return true;
    });
}
exports.verifyFile = verifyFile;
//# sourceMappingURL=ar-data-verify.js.map