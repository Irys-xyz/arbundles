"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = tslib_1.__importStar(require("crypto"));
const crypto_1 = require("crypto");
const arweave_1 = tslib_1.__importDefault(require("arweave"));
class Rsa4096Pss {
    _key;
    pk;
    signatureType = 1;
    get publicKey() {
        return Buffer.allocUnsafe(0);
    }
    constructor(_key, pk) {
        this._key = _key;
        this.pk = pk;
        if (!pk) {
            this.pk = crypto.createPublicKey({
                key: _key,
                type: 'pkcs1',
                format: "pem"
            }).export({
                format: 'pem',
                type: 'pkcs1'
            }).toString();
        }
    }
    sign(message) {
        return crypto
            .createSign("sha256")
            .update(message)
            .sign({
            key: this._key,
            padding: crypto_1.constants.RSA_PKCS1_PSS_PADDING
        });
    }
    static async verify(pk, message, signature) {
        return await arweave_1.default.crypto.verify(pk, message, signature);
    }
}
exports.default = Rsa4096Pss;
//# sourceMappingURL=Rsa4096Pss.js.map