import Secp256k1 from "../keys/secp256k1";

export default class Ethereum extends Secp256k1 {
  sign(message: Uint8Array): Uint8Array {
    return super.sign(Buffer.concat([
      Buffer.from("\x19Ethereum Signed Message:\n"),
      new Uint8Array(1).fill(message.length),
      message
    ]));
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    return Secp256k1.verify(
      pk,
      Buffer.concat([
      Buffer.from("\x19Ethereum Signed Message:\n"),
      new Uint8Array(1).fill(message.length),
      message
    ]),
      signature
    );
  }
}
