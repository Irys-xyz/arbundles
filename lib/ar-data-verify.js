"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDataStream = exports.verifyData = exports.verifyBundle = void 0;
const tslib_1 = require("tslib");
const buffer_1 = require("buffer");
const crypto = tslib_1.__importStar(require("crypto"));
const arweave_1 = tslib_1.__importDefault(require("arweave"));
const base64url_1 = tslib_1.__importDefault(require("base64url"));
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
function verifyDataStream(stream) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const hasher = crypto.createHash("sha384");
        console.log(hasher);
        const signature = stream.read(512);
        const owner = stream.read(512);
        // Create hashing context deep hash
        const hash = buffer_1.Buffer.from("");
        const targetPresent = stream.read(1)[0];
        if (targetPresent) {
        }
        return yield arweave_1.default.crypto.verify(base64url_1.default.encode(buffer_1.Buffer.from(owner), "hex"), hash, signature);
    });
}
exports.verifyDataStream = verifyDataStream;
//# sourceMappingURL=ar-data-verify.js.map