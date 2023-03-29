import { SignatureConfig, SIG_CONFIG } from "../../constants";
import { verifyTypedData } from "ethers/lib/utils";
import InjectedEthereumSigner from "./injectedEthereumSigner";
import { domain, types } from "./TypedEthereumSigner";

export default class InjectedTypedEthereumSigner extends InjectedEthereumSigner {
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.TYPEDETHEREUM].pubLength;
  readonly signatureLength: number = SIG_CONFIG[SignatureConfig.TYPEDETHEREUM].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.TYPEDETHEREUM;
  private address: string;

  async ready(): Promise<void> {
    this.address = await this.signer.getAddress();
    this.publicKey = Buffer.from(this.address); // pk *is* address
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    const signature = await this.signer._signTypedData(domain, types, {
      address: this.address,
      message,
    });

    return Buffer.from(signature.slice(2), "hex"); // trim leading 0x, convert to hex.
  }

  static verify(pk: string | Buffer, message: Uint8Array, signature: Uint8Array): boolean {
    const address = pk;
    const addr = verifyTypedData(domain, types, { address, message }, signature);
    return address === addr;
  }
}
