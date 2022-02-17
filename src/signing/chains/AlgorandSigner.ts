import Curve25519 from "../keys/curve25519";
export default class AlgorandSigner extends Curve25519 {
  get publicKey(): Buffer {
    return Buffer.from(this.pk);
  }

  get key(): Uint8Array {
    return Buffer.from(this._key);
  }

  constructor(key: any, pk: any) {
    super(key.subarray(0, 32), pk);
  }
}
