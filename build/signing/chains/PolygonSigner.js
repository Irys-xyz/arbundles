"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const secp256k1_1 = tslib_1.__importDefault(require("../keys/secp256k1"));
const secp256k1_2 = tslib_1.__importDefault(require("secp256k1"));
class PolygonSigner extends secp256k1_1.default {
    get publicKey() {
        return Buffer.from(this.pk, "hex");
    }
    constructor(key) {
        const b = Buffer.from(key, "hex");
        const pub = secp256k1_2.default.publicKeyCreate(b, false);
        super(key, Buffer.from(pub));
    }
}
exports.default = PolygonSigner;
//# sourceMappingURL=PolygonSigner.js.map