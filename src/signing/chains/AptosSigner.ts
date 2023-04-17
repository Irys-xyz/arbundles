import Curve25519 from "../keys/curve25519";

export default class AptosSigner extends Curve25519 {
  constructor(privKey: string, pubKey: string) {
    super(privKey, pubKey);
  }

  public get publicKey(): Buffer {
    return Buffer.from(this.pk.slice(2), "hex");
  }

  public get key(): Uint8Array {
    return Buffer.from(this._key.slice(2), "hex");
  }
}
