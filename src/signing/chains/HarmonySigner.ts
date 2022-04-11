import { Signer } from "../Signer";
import { SignatureConfig, SIG_CONFIG } from "../../constants";
// import { Secp256k1, sha256, Secp256k1Signature } from "@cosmjs/crypto";
import * as harmony from "@harmony-js/crypto";

export default class HarmonySigner implements Signer {
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.HARMONY].pubLength;
  readonly signatureLength: number = SIG_CONFIG[SignatureConfig.HARMONY].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.HARMONY;
  pem?: string | Buffer;

  protected wallet;
  public pk;
  
  constructor(key: string) {
    this.wallet = key;
    this.pk = Buffer.from(harmony.getPubkeyFromPrivateKey(key));    
  }

  public get publicKey(): Buffer {
    return this.pk;
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    // sign
    const signature = harmony.sign(harmony.keccak256(message), this.wallet);
    // json stringify
    const stringifed = JSON.stringify(signature);
    // string to buffer
    return Buffer.from(stringifed);
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    // json parse(buffer to string)
    // verify
    const sigParse = JSON.parse(signature.toString());
    return harmony.verifySignature(harmony.keccak256(message), sigParse, pk.toString());
  }
}
