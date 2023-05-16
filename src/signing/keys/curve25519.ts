import type { Signer } from "../Signer";
import base64url from "base64url";
import { SIG_CONFIG } from "../../constants";
import { sign, verify } from "@noble/ed25519";

export default class Curve25519 implements Signer {
  readonly ownerLength: number = SIG_CONFIG[2].pubLength;
  readonly signatureLength: number = SIG_CONFIG[2].sigLength;
  private readonly _publicKey: Buffer;
  public get publicKey(): Buffer {
    return this._publicKey;
  }
  readonly signatureType: number = 2;

  constructor(protected _key: string, public pk: string) {}

  public get key(): Uint8Array {
    throw new Error("You must implement `key`");
  }

  sign(message: Uint8Array): Promise<Uint8Array> {
    return sign(Buffer.from(message), Buffer.from(this.key));
  }

  static async verify(pk: string | Buffer, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    let p = pk;
    if (typeof pk === "string") p = base64url.toBuffer(pk);
    return verify(Buffer.from(signature), Buffer.from(message), Buffer.from(p));
  }
}
