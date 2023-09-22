import { hashMessage } from "@ethersproject/hash";
import { recoverPublicKey } from "@ethersproject/signing-key";
import type { Signer } from "../index";
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import type { Bytes } from "@ethersproject/bytes";
import { arrayify } from "@ethersproject/bytes";
import { computeAddress } from "@ethersproject/transactions";
import { verifyMessage } from "@ethersproject/wallet";
export interface InjectedEthereumSignerMinimalSigner {
  signMessage(message: string | Bytes): Promise<string>;
}
export interface InjectedEthereumSignerMinimalProvider {
  getSigner(): InjectedEthereumSignerMinimalSigner;
}

export class InjectedEthereumSigner implements Signer {
  // protected signer: JsonRpcSigner;
  protected signer: InjectedEthereumSignerMinimalSigner;
  public publicKey: Buffer;
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.ETHEREUM].pubLength;
  readonly signatureLength: number = SIG_CONFIG[SignatureConfig.ETHEREUM].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.ETHEREUM;

  constructor(provider: InjectedEthereumSignerMinimalProvider) {
    this.signer = provider.getSigner();
  }

  async setPublicKey(): Promise<void> {
    const address = "sign this message to connect to Bundlr.Network";
    const signedMsg = await this.signer.signMessage(address);
    const hash = await hashMessage(address);
    const recoveredKey = recoverPublicKey(arrayify(hash), signedMsg);
    this.publicKey = Buffer.from(arrayify(recoveredKey));
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    if (!this.publicKey) {
      await this.setPublicKey();
    }
    const sig = await this.signer.signMessage(message);
    return Buffer.from(sig.slice(2), "hex");
  }

  static verify(pk: Buffer, message: Uint8Array, signature: Uint8Array): boolean {
    const address = computeAddress(pk);
    return verifyMessage(message, signature) === address;
  }
}
export default InjectedEthereumSigner;
