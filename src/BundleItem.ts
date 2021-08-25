import { Signer } from './signing/Signer';
import { Buffer } from 'buffer';

export abstract class BundleItem {
  readonly signatureType: number;
  readonly rawSignature: Buffer;
  readonly signature: string;
  readonly rawOwner: Buffer;
  readonly owner: string;
  readonly rawTarget: Buffer;
  readonly target: string;
  readonly rawAnchor: Buffer;
  readonly anchor: string;
  readonly rawTags: Buffer;
  readonly tags: { name: string, value: string }[];
  readonly rawData: Buffer;
  readonly data: string;
  abstract sign(signer: Signer): Promise<Buffer>;
  abstract isValid(): Promise<boolean>
  static async verify(..._: any[]): Promise<boolean> {
    throw new Error("You must implement `verify`");
  }
}

