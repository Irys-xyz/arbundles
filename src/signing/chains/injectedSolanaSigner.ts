import { Signer } from "..";
import * as ed25519 from "noble-ed25519";
import base64url from "base64url";

export default class InjectedSolanaSigner implements Signer {
  publicKey: Buffer;
  signatureType: number;
  signatureLength: number;
  ownerLength: number;
  pem?: string | Buffer;
  provider;

  constructor(provider) {
    this.provider = provider;
    this.publicKey = this.provider.publicKey;
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    if (!this.provider.signMessage)
      throw new Error("Selected Wallet does not support message signing");
    return await this.provider.signMessage(message);
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
      Buffer.from(message),
      Buffer.from(p),
    );
  }
}
