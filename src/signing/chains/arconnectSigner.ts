import type { Signer } from "..";
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import type Arweave from "@irys/arweave";
import base64url from "base64url";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as _ from "arconnect";
import { getCryptoDriver } from "$/utils";

export default class InjectedArweaveSigner implements Signer {
  private signer: Window["arweaveWallet"];
  public publicKey: Buffer;
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.ARWEAVE].pubLength;
  readonly signatureLength: number = SIG_CONFIG[SignatureConfig.ARWEAVE].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.ARWEAVE;
  protected arweave: Arweave;
  constructor(windowArweaveWallet: Window["arweaveWallet"], arweave: Arweave) {
    this.signer = windowArweaveWallet;
    this.arweave = arweave;
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
    const buf = new Uint8Array(Object.values(signature).map((v) => +v));
    return buf;
  }

  static async verify(pk: string, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    return await getCryptoDriver().verify(pk, message, signature);
  }
}
