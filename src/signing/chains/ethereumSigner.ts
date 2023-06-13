import Secp256k1 from "../keys/secp256k1";
import secp256k1 from "secp256k1";
import base64url from "base64url";
import { arrayify } from "@ethersproject/bytes";
import { Wallet } from "@ethersproject/wallet";
import { hashMessage } from "@ethersproject/hash";

export default class EthereumSigner extends Secp256k1 {
  public get publicKey(): Buffer {
    return Buffer.from(this.pk, "hex");
  }

  constructor(key: string) {
    if (key.startsWith("0x")) key = key.slice(2);
    const b = Buffer.from(key, "hex");
    const pub = secp256k1.publicKeyCreate(b, false);
    super(key, Buffer.from(pub));
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    const wallet = new Wallet(this._key);
    return wallet.signMessage(message).then((r) => Buffer.from(r.slice(2), "hex")) as any;
    // below doesn't work due to lacking correct v derivation.
    // return Buffer.from(joinSignature(Buffer.from(secp256k1.ecdsaSign(arrayify(hashMessage(message)), this.key).signature)).slice(2), "hex");
  }

  static async verify(pk: string | Buffer, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    // const address = ethers.utils.computeAddress(pk);
    // return ethers.utils.verifyMessage(message, signature) === address;
    return secp256k1.ecdsaVerify(
      signature.length === 65 ? signature.slice(0, -1) : signature,
      arrayify(hashMessage(message)),
      typeof pk === "string" ? base64url.toBuffer(pk) : pk,
    );
  }
}
