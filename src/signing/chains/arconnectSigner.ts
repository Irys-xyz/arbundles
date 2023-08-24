import type { Signer } from "..";
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import Arweave from "arweave";
import base64url from "base64url";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as _ from "arconnect";

export default class InjectedArweaveSigner implements Signer {
  private signer: Window["arweaveWallet"];
  public publicKey: Buffer;
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.ARWEAVE].pubLength;
  readonly signatureLength: number = SIG_CONFIG[SignatureConfig.ARWEAVE].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.ARWEAVE;

  constructor(windowArweaveWallet: Window["arweaveWallet"]) {
    this.signer = windowArweaveWallet;
  }

  async setPublicKey(): Promise<void> {
    const arOwner = await this.signer.getActivePublicKey();
    this.publicKey = base64url.toBuffer(arOwner);
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    if (!this.publicKey) {
      await this.setPublicKey();
    }

    const algorithm = {
      name: "RSA-PSS",
      saltLength: 32,
    };

    const signature = await this.signer.signature(message, algorithm);
    const buf = new Uint8Array(Object.values(signature));
    return buf;
  }

  static async verify(pk: string, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    return await Arweave.crypto.verify(pk, message, signature);
  }
}
