import Rsa4096Pss from "../../keys/Rsa4096Pss";
import { JWKInterface } from "../../../interface-jwk";
import { jwkTopem } from "arweave/node/lib/crypto/pem";
import base64url from "base64url";
import Arweave from 'arweave';

export default class ArweaveSigner extends Rsa4096Pss {
  get publicKey(): Buffer {
    return base64url.toBuffer(this.pk);
  }

  constructor(private jwk: JWKInterface) {
    const pem = jwkTopem(jwk);
    super(pem, jwk.n);
  }

  sign(message: Uint8Array): Uint8Array {
    return Arweave.crypto.sign(this.jwk, message) as any;
  }

  static async verify(
    pk: string,
    message: Uint8Array,
    signature: Uint8Array
  ): Promise<boolean> {
    return await Arweave.crypto.verify(pk, message, signature);
  }
}
