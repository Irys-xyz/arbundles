import { Signer } from "../Signer";
import {
  sr25519Sign as sign,
  sr25519Verify as verify,
  sr25519PairFromSeed as fromSeed,
} from "@polkadot/util-crypto";
import { Keypair } from "@polkadot/util-crypto/types";
import { SIG_CONFIG } from "../../constants";

export default class Sr25519 implements Signer {
  readonly signatureType: number = 2;
  readonly ownerLength: number = SIG_CONFIG[2].pubLength;
  readonly signatureLength: number = SIG_CONFIG[2].sigLength;
  pem?: string | Buffer;
  protected keyPair: Keypair;
  protected pk: Buffer;
  constructor(privateKey: string) {
    this.keyPair = fromSeed(privateKey);
    this.pk = Buffer.from(this.keyPair.publicKey);
  }

  public get publicKey(): Buffer {
    return this.pk;
  }

  sign(message: Uint8Array): Uint8Array | Promise<Uint8Array> {
    return sign(message, this.keyPair);
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    return verify(message, signature, pk);
  }
}
