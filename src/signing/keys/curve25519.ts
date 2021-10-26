import { Signer } from '../Signer';
import { sign, verify } from 'curve25519-js';
import base64url from 'base64url';

export default class Curve25519 implements Signer {
  readonly ownerLength: number = 32;
  private readonly _publicKey: Buffer;
  public get publicKey(): Buffer {
        return this._publicKey;
    }
  readonly signatureLength: number = 64;
  readonly signatureType: number = 2;

  constructor(protected _key: string, public pk: string) {
  }

  public get key(): Uint8Array {
    return new Uint8Array(0);
  }

  sign(message: Uint8Array): Uint8Array {
    console.log(sign(this.key, message, null).length);
    return sign(this.key, message, null);
  }

  static async verify(
    pk: string | Buffer,
    message: Uint8Array,
    signature: Uint8Array
  ): Promise<boolean> {
    let p = pk;
    if (typeof pk === "string") p = base64url.toBuffer(pk);
    return verify(p, message, signature);
  }
}
