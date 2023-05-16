import { Wallet, verifyTypedData } from "@ethersproject/wallet";
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import keccak256 from "../keccak256";
import EthereumSigner from "./ethereumSigner";

export default class TypedEthereumSigner extends EthereumSigner {
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.TYPEDETHEREUM].pubLength;
  readonly signatureLength: number = SIG_CONFIG[SignatureConfig.TYPEDETHEREUM].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.TYPEDETHEREUM;

  private address: string;
  private signer: Wallet;

  constructor(key: string) {
    super(key);
    this.address = "0x" + keccak256(super.publicKey.slice(1)).slice(-20).toString("hex");
    this.signer = new Wallet(key);
  }

  get publicKey(): Buffer {
    return Buffer.from(this.address);
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    const signature = await this.signer._signTypedData(domain, types, {
      address: this.address,
      "Transaction hash": message,
    });

    return Buffer.from(signature.slice(2), "hex"); // trim leading 0x, convert to hex.
  }

  static async verify(pk: string | Buffer, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    const address = pk.toString();
    const addr = verifyTypedData(domain, types, { address, "Transaction hash": message }, signature);
    return address.toLowerCase() === addr.toLowerCase();
  }
}

export const domain = {
  name: "Bundlr",
  version: "1",
};

export const types = {
  Bundlr: [
    { name: "Transaction hash", type: "bytes" },
    { name: "address", type: "address" },
  ],
};

export const MESSAGE = "Bundlr(bytes Transaction hash, address address)";
export const DOMAIN = "EIP712Domain(string name,string version)";
