import { SignatureConfig, SIG_CONFIG } from "../../constants";
import Secp256k1 from "../keys/secp256k1";
import secp256k1 from "secp256k1";
import base64url from "base64url";
import Crypto from "crypto";
export default class CosmosSigner extends Secp256k1 {
  declare sk: Uint8Array;
  readonly ownerLength: number = SIG_CONFIG[SignatureConfig.COSMOS].pubLength;
  readonly signatureLength: number =
    SIG_CONFIG[SignatureConfig.COSMOS].sigLength;
  readonly signatureType: SignatureConfig = SignatureConfig.COSMOS;

  constructor(privkey: Uint8Array) {
    super(privkey.toString(), Buffer.from(secp256k1.publicKeyCreate(privkey, false)));
    this.sk = privkey;
  }
  
  get publicKey(): Buffer {
    return Buffer.from(this.pk, "hex");
  }

  public get key(): Uint8Array {
    return this.sk;
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    let p = pk;
    console.log("PK: ",pk);
    if (typeof pk === "string") p = base64url.toBuffer(pk);
    let verified = false;
    try {
      console.log("PK try:", p);
      console.log("Signature try:", signature);
      console.log("Message try:", message);
      
      verified = secp256k1.ecdsaVerify(
        signature,
        Crypto.createHash("sha256").update(Buffer.from(message)).digest(),
        p as Buffer,
      );
      // eslint-disable-next-line no-empty
    } catch (e) { }
    return verified;
  }

  sign(message: Uint8Array): Uint8Array {
    return secp256k1.ecdsaSign(
      Crypto.createHash("sha256").update(Buffer.from(message)).digest(),
      Buffer.from(this.sk),
    ).signature;
  }
}
