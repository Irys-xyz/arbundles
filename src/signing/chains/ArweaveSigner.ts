import Rsa4096Pss from "../keys/Rsa4096Pss";
import { JWKInterface } from "../../interface-jwk";
import { jwkTopem } from "arweave/node/lib/crypto/pem";
import base64url from "base64url";

export default class ArweaveSigner extends Rsa4096Pss {
  get publicKey(): Buffer {
    return base64url.toBuffer(this.pk);
  }

  constructor(jwk: JWKInterface) {
    const pem = jwkTopem(jwk);
    super(pem, jwk.n);
  }
}
