// import Secp256k1 from "../keys/secp256k1";
// import secp256k1 from "secp256k1";
import { Signer } from "../Signer";
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
// import * as signingcosmos from "@cosmjs/proto-signing";
import * as aminocosmos from "@cosmjs/amino";
import * as encode from "@cosmjs/encoding";


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
    this.pk = this.keyPair.pubkey;
  }

  async sign(_message: Uint8Array): Promise<Uint8Array> {
    const signDoc = {
      msgs: [{
        type: "SignMsg",
        value: "message"
      }],
      fee: {
        amount: [],
        gas: "1" },
      chain_id: "vega-testnet",
      memo: "",
      account_number: "0",
      sequence: "0",
    };

    const { /*  signed, */ signature } = await this.keyring.signAmino(this.keyPair.address, signDoc);
    return Buffer.from(signature.signature);
  }

  static async verify(
    pk: string | Buffer,
    _message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    const signDoc = {
      msgs: [{
        type: "SignMsg",
        value: "message"
      }],
      fee: {
        amount: [],
        gas: "1" },
      chain_id: "vega-testnet",
      memo: "",
      account_number: "0",
      sequence: "0",
    };
    return await Secp256k1.verifySignature(
      Secp256k1Signature.fromFixedLength(encode.fromBase64(signature.toString())),
      sha256(aminocosmos.serializeSignDoc(signDoc)),
      Buffer.from(pk),
    ); 
  }
}
