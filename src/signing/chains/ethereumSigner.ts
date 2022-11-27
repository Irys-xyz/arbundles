import Secp256k1 from "../keys/secp256k1";
import secp256k1 from "secp256k1";
import { arrayify, hashMessage } from "ethers/lib/utils";
import base64url from "base64url";
import { ethers } from "ethers";

export default class EthereumSigner extends Secp256k1 {
  get publicKey(): Buffer {
    return Buffer.from(this.pk, "hex");
  }

  constructor(key: string) {
    const b = Buffer.from(key, "hex");
    const pub = secp256k1.publicKeyCreate(b, false);
    super(key, Buffer.from(pub));
  }

  sign(message: Uint8Array): Uint8Array {
    const wallet = new ethers.Wallet(this._key);
    return wallet
      .signMessage(message)
      .then((r) => Buffer.from(r.slice(2), "hex")) as any;
    // below doesn't work due to lacking correct v derivation.
    //return Buffer.from(joinSignature(Buffer.from(secp256k1.ecdsaSign(arrayify(hashMessage(message)), this.key).signature)).slice(2), "hex");
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    // const address = ethers.utils.computeAddress(pk);
    // return ethers.utils.verifyMessage(message, signature) === address;
    return secp256k1.ecdsaVerify(
      (signature.length === 65) ? signature.slice(0, -1) : signature,
      arrayify(hashMessage(message)),
      (typeof pk === "string") ? base64url.toBuffer(pk) : pk,
    );
  }
}
