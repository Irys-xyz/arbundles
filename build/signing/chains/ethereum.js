"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1_1 = __importDefault(require("../keys/secp256k1"));
const secp256k1_2 = __importDefault(require("secp256k1"));
class Ethereum extends secp256k1_1.default {
  get publicKey() {
    return Buffer.from(this.pk, "hex");
  }
  constructor(key) {
    const b = Buffer.from(key, "hex");
    const pub = secp256k1_2.default.publicKeyCreate(b, false);
    super(key, Buffer.from(pub));
  }
  sign(message) {
    return super.sign(
      Buffer.concat([
        Buffer.from("\x19Ethereum Signed Message:\n"),
        new Uint8Array(1).fill(message.byteLength),
        message,
      ]),
    );
  }
  static async verify(pk, message, signature) {
    return secp256k1_1.default.verify(
      pk,
      Buffer.concat([
        Buffer.from("\x19Ethereum Signed Message:\n"),
        new Uint8Array(1).fill(message.byteLength),
        message,
      ]),
      signature,
    );
  }
}
exports.default = Ethereum;
//# sourceMappingURL=ethereum.js.map
