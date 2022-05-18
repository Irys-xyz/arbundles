/* eslint-disable @typescript-eslint/naming-convention */
import { SignatureConfig, SIG_CONFIG } from "../../constants";
import secp256k1 from "secp256k1";
import base64url from "base64url";
// import Crypto from "crypto";
import * as amino from "@cosmjs/amino";
import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import { fromBase64, toAscii, toBase64 } from "@cosmjs/encoding";
export default class CosmosSigner extends Secp256k1 {
  declare sk: Uint8Array;
  declare pk: Buffer;
  declare static prefix: string;

  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.COSMOS].pubLength;
  readonly signatureLength: number =
    SIG_CONFIG[SignatureConfig.COSMOS].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.COSMOS;

  constructor(privkey: Uint8Array, prefix: string) {
    super();
    this.sk = privkey;
    this.pk = Buffer.from(secp256k1.publicKeyCreate(privkey, false));
    // this.pk = Buffer.from(pubKey);
    CosmosSigner.prefix = prefix;
  }


  get publicKey(): Buffer {
    return this.pk;
  }

  public get key(): Uint8Array {
    return this.sk;
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    const signBytes = amino.serializeSignDoc(CosmosSigner.makeADR036AminoSignDoc(Buffer.from(message).toString("base64"), toBase64(Secp256k1.compressPubkey(this.pk)), CosmosSigner.prefix));
    const messageHash = sha256(signBytes);
    
    const signed = (Secp256k1Signature.fromDer((await Secp256k1.createSignature(messageHash, this.sk)).toDer()).toFixedLength());
    
    const prefix = Buffer.from(CosmosSigner.prefix);
    const newSignature = new Uint8Array(96);

    newSignature.set(prefix, 0);
    newSignature.set(signed, 32);

    return Buffer.from(newSignature);
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array
  ): Promise<boolean> {
    let p = pk;
    if (typeof pk === "string") p = base64url.toBuffer(pk);
  
    let verified = false;

    const prefixBuffer = Buffer.from(signature.slice(0, 32));
    const prefixHex = prefixBuffer.toString("hex");
    const regex = /00/ig;
    const bufferRemove00s = prefixHex.replace(regex, "");
    const newPrefixBuffer = Buffer.from(bufferRemove00s, "hex").toString("utf-8");

    const newSignature = signature.slice(-64);
    
    try {      
      verified = await CosmosSigner.verifyADR036Signature(toBase64(message), toBase64(Secp256k1.compressPubkey(Buffer.from(p))), toBase64(Buffer.from(newSignature)), newPrefixBuffer)
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
