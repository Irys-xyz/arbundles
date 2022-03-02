// import Secp256k1 from "../keys/secp256k1";
// import secp256k1 from "secp256k1";
import { Signer } from "../Signer";
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
// import * as signingcosmos from "@cosmjs/proto-signing";
import * as aminocosmos from "@cosmjs/amino";

export default class CosmosSigner implements Signer {
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.COSMOS].pubLength;
  readonly signatureLength: number = SIG_CONFIG[SignatureConfig.COSMOS].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.COSMOS;
  pem?: string | Buffer;

  protected wallet;
  protected keyring;
  public keyPair;
  public pk;

  constructor(key: string) {
    this.wallet = key;
  }

  public get publicKey(): Buffer {
    return Buffer.from(this.pk);
  }

  public async ready(): Promise<void> {
    this.keyring = await aminocosmos.Secp256k1HdWallet.fromMnemonic(this.wallet);
    const [first] = await this.keyring.getAccounts();
    this.keyPair = first;
    this.pk = await this.keyPair.pubkey;
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    // const signDoc = {
    //   msgs: [{
    //     type: "signMessage",
    //     value: message
    //   }],
    //   fee: {
    //     amount: [],
    //     gas: "1" },
    //   chain_id: -1,
    //   memo: "",
    //   account_number: "0",
    //   sequence: "0",
    // };

    // const signDoc = aminocosmos.makeSignDoc(
    //   [{
    //     type: "signMessage",
    //     value: message
    //   }],
    //   {
    //     amount: [],
    //     gas: "1"
    //   },
    //   "-1",
    //   "",
    //   "0",
    //   "0"
    //   )

    // const { signed/* , signature */ } = await this.keyring.signDirect(this.address, signDoc);
    // return signed;
    return message;
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
      return await Secp256k1.verifySignature(
      Secp256k1Signature.fromFixedLength(signature),
      sha256(message),
      Buffer.from(pk),
    );  
  }
}
