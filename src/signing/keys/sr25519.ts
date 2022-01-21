import { Signer } from "../Signer";
import {
  sr25519Sign as sign,
  sr25519Verify as verify,
  sr25519PairFromSeed as fromSeed,
  cryptoWaitReady,
} from "@polkadot/util-crypto";
import { Keypair } from "@polkadot/util-crypto/types";
import { SIG_CONFIG } from "../../constants";
// import base58 from "bs58";

export default class Sr25519 implements Signer {
  readonly signatureType: number = 2;
  readonly ownerLength: number = SIG_CONFIG[2].pubLength;
  readonly signatureLength: number = SIG_CONFIG[2].sigLength;
  pem?: string | Buffer;
  protected keyPair: Keypair;
  protected pk: Buffer;
  protected _pk;
  constructor(privateKey: string) {
    this._pk = privateKey;
  }

  public get publicKey(): Buffer {
    return this.pk;
  }

  sign(message: Uint8Array): Uint8Array | Promise<Uint8Array> {
    return sign(message, this.keyPair);
  }
  public async ready(): Promise<void> {
    await cryptoWaitReady();
    this.keyPair = fromSeed(this._pk);
    this.pk = Buffer.from(this.keyPair.publicKey);
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    return verify(message, signature, pk);
  }
}
