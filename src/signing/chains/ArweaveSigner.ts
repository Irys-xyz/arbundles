import Rsa4096Pss from "../keys/Rsa4096Pss";
import type { JWKInterface } from "../../interface-jwk";
import { jwkTopem } from "arweave/node/lib/crypto/pem";
import base64url from "base64url";
import { getCryptoDriver } from "$/utils";

export default class ArweaveSigner extends Rsa4096Pss {
  protected jwk: JWKInterface;

  constructor(jwk: JWKInterface) {
    super(jwkTopem(jwk), jwk.n);
    this.jwk = jwk;
  }

  get publicKey(): Buffer {
    if (!this.pk) throw new Error("ArweaveSigner - pk is undefined");
    return base64url.toBuffer(this.pk);
  }

  sign(message: Uint8Array): Uint8Array {
    return getCryptoDriver().sign(this.jwk, message) as any;
  }

  static async verify(pk: string, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    return await getCryptoDriver().verify(pk, message, signature);
  }
}
