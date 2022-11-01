import { Signer } from "..";
import { TxnBuilderTypes } from "aptos";
import * as ed25519 from "@noble/ed25519";
// import nacl from 'tweetnacl';
import { SignatureConfig, SIG_CONFIG } from "../../constants";

export default class MultiSignatureAptosSigner implements Signer {
  private _publicKey: Buffer;
  readonly ownerLength: number =
    SIG_CONFIG[SignatureConfig.MULTIAPTOS].pubLength;
  readonly signatureLength: number =
    SIG_CONFIG[SignatureConfig.MULTIAPTOS].sigLength;
  readonly signatureType: number = SignatureConfig.MULTIAPTOS;

  protected collectSignatures: (
    message: Uint8Array,
  ) => Promise<{ signatures: Buffer[]; bitmap: number[] }>;

  protected provider: any;

  constructor(
    publicKey: Buffer,
    collectSignatures: (
      message: Uint8Array,
    ) => Promise<{ signatures: Buffer[]; bitmap: number[] }>,
  ) {
    this._publicKey = publicKey;
    this.collectSignatures = collectSignatures;
  }

  public get publicKey(): Buffer {
    return this._publicKey;
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    const { signatures, bitmap } = await this.collectSignatures(message);
    const generatedBitmap =
      TxnBuilderTypes.MultiEd25519Signature.createBitmap(bitmap);
    const signature = Buffer.alloc(this.signatureLength);
    let sigPos = 0;
    for (let i = 0; i < 32; i++) {
      if (bitmap.includes(i)) {
        signature.set(signatures[sigPos++], i * 64);
      }
    }
    // signatures.forEach((s, i) => {
    //     signature.set(s, i * 64)
    // })
    signature.set(generatedBitmap, this.signatureLength - 4);
    return signature;
  }

  static async verify(
    pk: Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    const signatureLength = SIG_CONFIG[SignatureConfig.MULTIAPTOS].sigLength;
    const bitmapPos = signatureLength - 4;
    const signatures = signature.slice(0, bitmapPos);
    const encodedBitmap = signature.slice(bitmapPos);

    let oneFalse = false;
    for (let i = 0; i < 32; i++) {
      // check bitmap
      let bucket = Math.floor(i / 8);
      let bucket_pos = i - bucket * 8;
      const sigIncluded = (encodedBitmap[bucket] & (128 >> bucket_pos)) != 0;
      if (sigIncluded) {
        const signature = signatures.slice(i * 64, (i + 1) * 64);
        const pubkey = pk.slice(i * 32, (i + 1) * 32);
        if (
          !(await ed25519.verify(
            Buffer.from(signature),
            Buffer.from(message),
            Buffer.from(pubkey),
          ))
        )
          oneFalse = true;
      }
    }
    return !oneFalse;
  }
}
