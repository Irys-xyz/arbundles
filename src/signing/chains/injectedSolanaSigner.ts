import { Signer } from "..";
import * as ed25519 from "@noble/ed25519";
import base64url from "base64url";
import { SIG_CONFIG } from "../../constants";
import { MessageSignerWalletAdapter } from "@solana/wallet-adapter-base";

export default class InjectedSolanaSigner implements Signer {
  private readonly _publicKey: Buffer;
  readonly ownerLength: number = SIG_CONFIG[2].pubLength;
  readonly signatureLength: number = SIG_CONFIG[2].sigLength;
  readonly signatureType: number = 2;
  pem?: string | Buffer;
  provider: MessageSignerWalletAdapter;

  constructor(provider) {
    this.provider = provider;
    this._publicKey = this.provider.publicKey.toBuffer();
  }

  public get publicKey(): Buffer {
    return this._publicKey;
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
