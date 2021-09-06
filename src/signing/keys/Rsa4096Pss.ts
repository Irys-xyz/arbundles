import { Signer } from '../Signer';
import * as crypto from 'crypto';
import { constants } from 'crypto';
import Arweave from 'arweave';

export default class Rsa4096Pss implements Signer {
  readonly signatureType: number =  1

  get publicKey(): Buffer {
    return Buffer.allocUnsafe(0);
  }

  constructor(private _key: string, public pk?: string) {
    if (!pk) {
      this.pk = crypto.createPublicKey({
        key: _key,
        type: 'pkcs1',
        format: "pem"
      }).export({
        format: 'pem',
        type: 'pkcs1'
      }).toString();
    }
  }

  sign(message: Uint8Array): Uint8Array {
    return crypto
      .createSign("sha256")
      .update(message)
      .sign({
        key: this._key,
        padding: constants.RSA_PKCS1_PSS_PADDING
      });
  }

  static async verify(pk: string, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    return await Arweave.crypto.verify(pk, message, signature);
  }
}
