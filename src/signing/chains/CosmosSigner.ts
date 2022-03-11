import { Signer } from "../Signer";
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import { Secp256k1, sha256, Bip39, Slip10, stringToPath, Slip10Curve, EnglishMnemonic, Secp256k1Signature } from "@cosmjs/crypto";

export default class CosmosSigner implements Signer {
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.COSMOS].pubLength;
  readonly signatureLength: number = SIG_CONFIG[SignatureConfig.COSMOS].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.COSMOS;
  pem?: string | Buffer;

  protected wallet;
  public pk;
  public signingKp;
  public coinpath;
  
  constructor(key: string, coin: string) {
    this.wallet = key;
    this.coinpath = coin;
  }

  public get publicKey(): Buffer {
    return this.pk;
  }

  public async ready(): Promise<void> {
    const walletSeed = await Bip39.mnemonicToSeed(new EnglishMnemonic(this.wallet));
    const path = stringToPath(`m/44'/${this.coinpath}'/0'/0/0`);
    const slip = Slip10.derivePath(Slip10Curve.Secp256k1, walletSeed ,path);
    this.signingKp = await Secp256k1.makeKeypair(slip.privkey);
    this.pk = Secp256k1.compressPubkey(this.signingKp.pubkey);
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    const signature = await Secp256k1.createSignature(sha256(message), this.signingKp.privkey);
    const trimmed = await Secp256k1.trimRecoveryByte(signature.toFixedLength());
    return trimmed;
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    if(typeof pk === "string"){
      pk = Buffer.from(pk);
    }
    const fromFixed = Secp256k1Signature.fromFixedLength(signature); 
    return await Secp256k1.verifySignature(fromFixed, sha256(message), pk);
  }
}
