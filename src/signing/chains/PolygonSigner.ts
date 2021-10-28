import Secp256k1 from '../keys/secp256k1';
import secp256k1 from 'secp256k1';

export default class PolygonSigner extends Secp256k1 {
  get publicKey(): Buffer {
    return Buffer.from(this.pk, "hex");
  }

  constructor(key: string) {
    const b = Buffer.from(key, "hex");
    const pub = secp256k1.publicKeyCreate(b, false);
    super(key, Buffer.from(pub));
  }
}
