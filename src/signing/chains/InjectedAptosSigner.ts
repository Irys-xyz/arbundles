import { verify } from "@noble/ed25519";
import type { Signer } from "../index";
import { SignatureConfig, SIG_CONFIG } from "../../constants";

export default class InjectedAptosSigner implements Signer {
  private _publicKey: Buffer;
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.INJECTEDAPTOS].pubLength;
  readonly signatureLength: number = SIG_CONFIG[SignatureConfig.INJECTEDAPTOS].sigLength;
  readonly signatureType: number = SignatureConfig.INJECTEDAPTOS;
  pem?: string | Buffer;

  protected provider: any;
  constructor(provider: any, publicKey: Buffer) {
    this.provider = provider;
    this._publicKey = publicKey;
  }

  public get publicKey(): Buffer {
    return this._publicKey;
  }

  /**
   * signMessage constructs a message and then signs it.
   * the format is "APTOS(\n)
   * message: <hexString>(\n)
   * nonce: bundlr"
   */

  async sign(message: Uint8Array): Promise<Uint8Array> {
    if (!this.provider.signMessage) throw new Error("Selected Wallet does not support message signing");
    const signingResponse = await this.provider.signMessage({
      message: Buffer.from(message).toString("hex"),
      nonce: "bundlr",
    });
    const signature = signingResponse.signature;
    return typeof signature === "string" ? Buffer.from(signature, "hex") : signature.data.toUint8Array();
  }

  static async verify(pk: Buffer, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    const p = pk;
    return verify(
      Buffer.from(signature),
      Buffer.from(`APTOS\nmessage: ${Buffer.from(message).toString("hex")}\nnonce: bundlr`), // see comment above sign
      Buffer.from(p),
    );
  }
}
