import { ethers } from "ethers";
import { Signer } from "..";
import { SignatureConfig, SIG_CONFIG } from "../../constants";

export default class InjectedEthereumSigner implements Signer {
  private signer: ethers.providers.JsonRpcSigner;
  public publicKey: Buffer;
  readonly ownerLength: number =
    SIG_CONFIG[SignatureConfig.INJECTEDETHEREUMSIGNER].pubLength;
  readonly signatureLength: number =
    SIG_CONFIG[SignatureConfig.INJECTEDETHEREUMSIGNER].sigLength;
  readonly signatureType: SignatureConfig =
    SignatureConfig.INJECTEDETHEREUMSIGNER;

  constructor(provider: ethers.providers.Web3Provider) {
    this.signer = provider.getSigner();
  }

  async setPublicKey(): Promise<void> {
    const signedMsg = await this.signer.signMessage(
      "sign this message to connect to the Bundlr Network",
    );
    const hash = await ethers.utils.hashMessage(signedMsg);
    const recoveredKey = ethers.utils.recoverPublicKey(
      ethers.utils.arrayify(hash),
      signedMsg,
    );
    this.publicKey = Buffer.from(ethers.utils.arrayify(recoveredKey));
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    if (!this.publicKey) {
      await this.setPublicKey();
    }
    const sig = await this.signer.signMessage(message);
    return Buffer.from(sig.slice(2), "hex");
  }

  static verify(
    pk: string,
    message: Uint8Array,
    signature: Uint8Array,
  ): boolean {
    const address = ethers.utils.computeAddress(pk);
    return ethers.utils.verifyMessage(message, signature) === address;
  }
}
