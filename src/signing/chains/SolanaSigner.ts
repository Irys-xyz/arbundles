import Curve25519 from "../keys/curve25519";
import bs58 from "bs58";

export default class SolanaSigner extends Curve25519 {
  get publicKey(): Buffer {
    return bs58.decode(this.pk);
  }

  get key(): Uint8Array {
    return bs58.decode(this._key);
  }

  constructor(_key: string) {
    const b = bs58.decode(_key);
    super(bs58.encode(b.subarray(0, 32)), bs58.encode(b.subarray(32, 64)));
  }
}
