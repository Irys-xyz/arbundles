"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
class Signer {
    publicKey;
    signatureType;
    static verify(_) {
        throw new Error("You must implement verify method on child");
    }
}
exports.Signer = Signer;
//# sourceMappingURL=Signer.js.map