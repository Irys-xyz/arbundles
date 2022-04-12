import Secp256k1 from "../keys/secp256k1";
import secp256k1 from "secp256k1";
// import { Wallet, utils } from "ethers"
import { personalSign, recoverPersonalSignature } from "@metamask/eth-sig-util";
import keccak256 from "../keccak256";

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
    return Buffer.from(
      personalSign({
        privateKey: Buffer.from(this._key, "hex"),
        data: message,
      }).slice(2),
    );
    // const wallet = new Wallet(this._key);
    // const sig = wallet
    //   .signMessage(message)
    //   .then((r) => Buffer.from(r.slice(2), "hex")) as any;
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    // const address = utils.computeAddress(pk);
    // return utils.verifyMessage(message, signature) === address;
    const address = "0x" + keccak256(pk.slice(1)).slice(-20).toString("hex");

    let _message = Buffer.from(message).toString("hex");
    if (_message.slice(0, 2) != "0x") {
      _message = "0x" + _message;
    }

    let _signature = Buffer.from(signature).toString("hex");
    if (_signature.slice(0, 2) != "0x") {
      _signature = "0x" + _signature;
    }

    return (
      recoverPersonalSignature({
        data: _message,
        signature: _signature,
      }) === address
    );
  }
}
