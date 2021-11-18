"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const secp256k1_1 = tslib_1.__importDefault(require("../keys/secp256k1"));
class Ethereum extends secp256k1_1.default {
    sign(message) {
        return super.sign(Buffer.concat([
            Buffer.from("\x19Ethereum Signed Message:\n"),
            new Uint8Array(1).fill(message.length),
            message
        ]));
    }
    static async verify(pk, message, signature) {
        return secp256k1_1.default.verify(pk, Buffer.concat([
            Buffer.from("\x19Ethereum Signed Message:\n"),
            new Uint8Array(1).fill(message.length),
            message
        ]), signature);
    }
}
exports.default = Ethereum;
//# sourceMappingURL=ethereum.js.map