import Secp256k1 from "../keys/secp256k1";
import secp256k1 from 'secp256k1';

export default class Ethereum extends Secp256k1 {
  get publicKey(): Buffer {
    return Buffer.from(this.pk, "hex");
  }

  constructor(key: string) {
    const b = Buffer.from(key, "hex");
    const pub = secp256k1.publicKeyCreate(b, false);
    super(key, Buffer.from(pub));
  }

  sign(message: Uint8Array): Uint8Array {
    return super.sign(Buffer.concat([
      Buffer.from("\x19Ethereum Signed Message:\n"),
      new Uint8Array(1).fill(message.byteLength),
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
      new Uint8Array(1).fill(message.byteLength),
      message
    ]),
      signature
    );
  }
}
