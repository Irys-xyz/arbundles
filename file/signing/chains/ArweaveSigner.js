"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Rsa4096Pss_1 = tslib_1.__importDefault(require("../keys/Rsa4096Pss"));
const pem_1 = require("arweave/node/lib/crypto/pem");
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const arweave_1 = tslib_1.__importDefault(require("arweave"));
class ArweaveSigner extends Rsa4096Pss_1.default {
    jwk;
    get publicKey() {
        return base64url_1.default.toBuffer(this.pk);
    }
    constructor(jwk) {
        const pem = pem_1.jwkTopem(jwk);
        super(pem, jwk.n);
        this.jwk = jwk;
    }
    sign(message) {
        return arweave_1.default.crypto.sign(this.jwk, message);
    }
    static async verify(pk, message, signature) {
        return await arweave_1.default.crypto.verify(pk, message, signature);
    }
}
exports.default = ArweaveSigner;
//# sourceMappingURL=ArweaveSigner.js.map