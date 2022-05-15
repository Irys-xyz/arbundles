/* eslint-disable @typescript-eslint/naming-convention */
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import secp256k1 from "secp256k1";
import base64url from "base64url";
import Crypto from "crypto";
import * as amino from "@cosmjs/amino";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import { fromBase64, toAscii, toBase64 } from "@cosmjs/encoding";
export default class CosmosSigner extends Secp256k1 {
  declare sk: Uint8Array;
  declare pk: Buffer;
  // declare prefix: string;
  declare static prefix: string;

  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.COSMOS].pubLength;
  readonly signatureLength: number =
    SIG_CONFIG[SignatureConfig.COSMOS].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.COSMOS;

  constructor(privkey: Uint8Array, prefix: string) {
    super();
    this.sk = privkey;
    this.pk = Buffer.from(secp256k1.publicKeyCreate(privkey, false));
    CosmosSigner.prefix = prefix;
  }


  get publicKey(): Buffer {
    return this.pk;
  }

  public get key(): Uint8Array {
    return this.sk;
  }

  sign(message: Uint8Array): Uint8Array {
    return Buffer.from(secp256k1.ecdsaSign(
      Crypto.createHash("sha256").update(Buffer.from(message)).digest(),
      Buffer.from(this.sk),
    ).signature);
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array
    ): Promise<boolean> {
    let p = pk;
    if (typeof pk === "string") p = base64url.toBuffer(pk);
    let verified = false;
    try {      
      console.log(this.prefix);
      console.log("PubKey", pk);
      console.log("message", message);
      console.log("signature", message);
      verified = await CosmosSigner.verifyADR036Signature(toBase64(message), toBase64(Secp256k1.compressPubkey(Buffer.from(p))), toBase64(Buffer.from(signature)), this.prefix)
      //eslint-disable-next-line no-empty
    } catch (e) {
      console.log(e);
    }
    console.log(`Is Verified: ${verified}`);
    return verified;
  }

  static makeADR036AminoSignDoc(message: string, pubKey: string, prefix: string): amino.StdSignDoc {
    const signer = amino.pubkeyToAddress(
      {
        type: "tendermint/PubKeySecp256k1",
        value: pubKey,
      },
      prefix,
    );

    return amino.makeSignDoc(
      [
        {
          type: "sign/MsgSignData",
          value: {
            signer,
            data: toBase64(toAscii(message)),
          },
        },
      ],
      {
        gas: "0",
        amount: [],
      },
      "",
      "",
      0,
      0,
    );
  }

  static async verifyADR036Signature(
    message: string,
    pubKey: string,
    signature: string,
    prefix: string,
  ): Promise<boolean> {
    const signBytes = amino.serializeSignDoc(CosmosSigner.makeADR036AminoSignDoc(message, pubKey, prefix));
    const messageHash = sha256(signBytes);

    const parsedSignature = Secp256k1Signature.fromFixedLength(
      fromBase64(signature),
    );
    const parsedPubKey = fromBase64(pubKey);

    return await Secp256k1.verifySignature(
      parsedSignature,
      messageHash,
      parsedPubKey,
    );
  }
}
