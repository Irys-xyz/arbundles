"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const curve25519_1 = tslib_1.__importDefault(require("../keys/curve25519"));
const bs58_1 = tslib_1.__importDefault(require("bs58"));
const bs58_2 = tslib_1.__importDefault(require("bs58"));
class SolanaSigner extends curve25519_1.default {
    get publicKey() {
        return bs58_1.default.decode(this.pk);
    }
    get key() {
        return bs58_1.default.decode(this._key);
    }
    constructor(_key) {
        const b = bs58_1.default.decode(_key);
        super(bs58_2.default.encode(b.subarray(0, 32)), bs58_2.default.encode(b.subarray(32, 64)));
    }
}
exports.default = SolanaSigner;
//# sourceMappingURL=SolanaSigner.js.map