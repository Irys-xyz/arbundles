import base64url from "base64url";
import InjectedSolanaSigner from "./injectedSolanaSigner";
import * as ed25519 from "noble-ed25519";

export default class PhantomSigner extends InjectedSolanaSigner {
  signatureType = 4; // for Phantom signer type

  constructor(provider) {
    super(provider);
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return super.sign(Buffer.from(Buffer.from(message).toString("hex")));
  }

  static async verify(
    pk: Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    let p = pk;
    if (typeof pk === "string") p = base64url.toBuffer(pk);
    return ed25519.verify(
      Buffer.from(signature),
      Buffer.from(Buffer.from(message).toString("hex")),
      Buffer.from(p),
    );
  }
}
