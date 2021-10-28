"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const ed25519_1 = tslib_1.__importDefault(require("ed25519"));
const constants_1 = require("../../constants");
class Curve25519 {
    _key;
    pk;
    ownerLength = constants_1.SIG_CONFIG[2].pubLength;
    signatureLength = constants_1.SIG_CONFIG[2].sigLength;
    _publicKey;
    get publicKey() {
        return this._publicKey;
    }
    signatureType = 2;
    constructor(_key, pk) {
        this._key = _key;
        this.pk = pk;
    }
    get key() {
        return new Uint8Array(0);
    }
    sign(message) {
        return ed25519_1.default.Sign(Buffer.from(message), Buffer.from(this.key));
    }
    static async verify(pk, message, signature) {
        let p = pk;
        if (typeof pk === "string")
            p = base64url_1.default.toBuffer(pk);
        return ed25519_1.default.Verify(Buffer.from(message), Buffer.from(signature), Buffer.from(p));
    }
}
exports.default = Curve25519;
//# sourceMappingURL=curve25519.js.map