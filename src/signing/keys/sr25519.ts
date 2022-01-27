import { Signer } from "../Signer";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady, signatureVerify } from "@polkadot/util-crypto";
import { Keypair } from "@polkadot/util-crypto/types";
// import { SubmittableExtrinsic } from "@polkadot/api/types";
import { SIG_CONFIG } from "../../constants";
// import base58 from "bs58";

export default class Sr25519 implements Signer {
  readonly signatureType: number = 4;
  readonly ownerLength: number = SIG_CONFIG[4].pubLength;
  readonly signatureLength: number = SIG_CONFIG[4].sigLength;
  pem?: string | Buffer;
  protected keyPair: Keypair;
  protected pk: Buffer;
  protected _pk;
  protected keyring;
  protected signature;
  constructor(privateKey: string) {
    this._pk = privateKey;
  }

  public get publicKey(): Buffer {
    return this.pk;
  }

  sign(message: Uint8Array): Uint8Array | Promise<Uint8Array>{
      const signer = this.signature
      return signer.sign(message);
  }

  public async ready(): Promise<void> {
    await cryptoWaitReady();
    this.keyring = new Keyring({ type: "sr25519", ss58Format: 0 });
    this.signature = this.keyring.createFromUri(this._pk, { name: "sr25519" });
    this.keyPair = this.signature;
    this.pk = Buffer.from(this.keyPair.publicKey);
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    const { isValid } = signatureVerify(message, signature, pk);
    return (isValid ? true : false);
  }
}
