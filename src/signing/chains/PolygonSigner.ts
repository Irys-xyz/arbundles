import secp256k1 from 'secp256k1';
import Ethereum from "./ethereum";

export default class PolygonSigner extends Ethereum {
  get publicKey(): Buffer {
    return Buffer.from(this.pk, "hex");
  }

  constructor(key: string) {
    const b = Buffer.from(key, "hex");
    const pub = secp256k1.publicKeyCreate(b, false);
    super(key, Buffer.from(pub));
  }
}
