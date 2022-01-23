import { KeyPair } from "near-api-js";
import Curve25519 from "../keys/curve25519";

export default class NearSigner extends Curve25519 {
  get publicKey(): Buffer {
    return Buffer.from(KeyPair.fromString(this._key).getPublicKey().data);
  }

  constructor(privateKey: string) {
    const keyPair = KeyPair.fromString(privateKey);
    super(privateKey, keyPair.getPublicKey().data.toString());
  }
}
