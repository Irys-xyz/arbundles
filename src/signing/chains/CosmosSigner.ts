import Secp256k1 from "../keys/secp256k1";
import secp256k1 from "secp256k1";


export default class CosmosSigner extends Secp256k1 {
  get publicKey(): Buffer {
    return Buffer.from(this.pk, "hex");
  }

  constructor(key: string) {
    const b = Buffer.from(key, "hex");
    const pub = secp256k1.publicKeyCreate(b, false);
    super(key, Buffer.from(pub));
  }

  sign(message: Uint8Array): Uint8Array {
    const wallet = this._key;
    const signed = secp256k1.ecdsaSign(message, Buffer.from(wallet, "hex"));
    return signed.signature;
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    return secp256k1.ecdsaVerify(signature, message, Buffer.from(pk));
  }
}
