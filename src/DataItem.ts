import { byteArrayToLong } from './utils';
import { tagsParser } from './parser';
import base64url from 'base64url';
import { Buffer } from 'buffer';
import { JWKPublicInterface } from './interface-jwk';
import { sign } from './ar-data-bundle';
import Arweave from 'arweave';

export const MIN_BINARY_SIZE = 1042;

export default class DataItem {
  private readonly binary: Buffer;
  private _id: Buffer;

  constructor(binary: Buffer) {
    this.binary = binary;
  };

  static isDataItem(obj: any): boolean {
    return obj.binary !== undefined;
  }

  isValid(): boolean {
    return DataItem.verify(this.binary);
  }

  get id(): string {
    return base64url.encode(this._id, "hex");
  }

  set id(id: string) {
    this._id = Buffer.from(base64url.decode(id, "hex"), "hex");
  }

  get rawId(): Buffer {
    return this._id;
  }

  set rawId(id: Buffer) {
    this._id = id;
  }

  get rawSignature(): Buffer {
    return this.binary.slice(0, 512);
  }

  get signature(): string {
    return base64url.encode(this.rawSignature);
  }

  get rawOwner(): Buffer {
    return this.binary.slice(512, 512 + 512);
  }

  get owner(): string {
    return base64url.encode(Buffer.from(this.rawOwner), "hex");
  }


  async getAddress(): Promise<string> {
    return base64url.encode(Buffer.from(await Arweave.crypto.hash(this.rawOwner, "SHA-256")), "hex");
  }

  get rawTarget(): Buffer {
    const targetStart = this.getTargetStart();
    const isPresent = this.binary[targetStart] == 1;
    return isPresent ? this.binary.slice(targetStart + 1, targetStart + 33) : Buffer.alloc(0);
  }

  get target(): string {
    const target = this.rawTarget;
    return base64url.encode(target, "hex");
  }

  get rawAnchor(): Buffer {
    const anchorStart = this.getAnchorStart();
    const isPresent = this.binary[anchorStart] == 1;

    return isPresent ? this.binary.slice(anchorStart + 1, anchorStart + 33) : Buffer.alloc(0);
  }

  get anchor(): string {
    return this.rawAnchor.toString();
  }

  get rawTags(): Buffer {
    const tagsStart = this.getTagsStart();
    const tagsSize = byteArrayToLong(this.binary.slice(tagsStart + 8, tagsStart + 16));
    return this.binary.slice(tagsStart + 16, tagsStart + 16 + tagsSize);
  }

  get tags(): { name: string, value: string }[] {
    const tagsStart = this.getTagsStart();
    const tagsCount = byteArrayToLong(this.binary.slice(tagsStart, tagsStart + 8));
    if (tagsCount == 0) {
      return [];
    }

    const tagsSize = byteArrayToLong(this.binary.slice(tagsStart + 8, tagsStart + 16));

    return tagsParser.fromBuffer(Buffer.from(this.binary.slice(tagsStart + 16, tagsStart + 16 + tagsSize)));
  }

  getStartOfData(): number {
    const tagsStart = this.getTagsStart();

    const numberOfTagBytesArray = this.binary.slice(tagsStart + 8, tagsStart + 16);
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);
    return tagsStart + 16 + numberOfTagBytes;
  }

  get rawData(): Buffer {
    const tagsStart = this.getTagsStart();

    const numberOfTagBytesArray = this.binary.slice(tagsStart + 8, tagsStart + 16);
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);
    const dataStart = tagsStart + 16 + numberOfTagBytes;

    return this.binary.slice(dataStart, this.binary.length);
  }

  get data(): string {
    const tagsStart = this.getTagsStart();

    const numberOfTagBytesArray = this.binary.slice(tagsStart + 8, tagsStart + 16);
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);
    const dataStart = tagsStart + 16 + numberOfTagBytes;

    return base64url.encode(this.binary.slice(dataStart, this.binary.length), "hex");
  }

  /**
   * UNSAFE!!
   * DO NOT MUTATE THE BINARY ARRAY. THIS WILL CAUSE UNDEFINED BEHAVIOUR.
   */
  getRaw(): Buffer {
    return this.binary;
  }

  public async sign(jwk: JWKPublicInterface): Promise<Buffer> {
    this._id = await sign(this, jwk);

    return this.rawId;
  }

  public isSigned(): boolean {
    return (this._id?.length ?? 0) > 0;
  }

  /**
   * Returns a JSON representation of a DataItem
   */
  public toJSON(): { owner: string; data: string; signature: string; target: string; tags: { name: string; value: string }[] } {
    return {
      signature: this.signature,
      owner: this.owner,
      target: this.target,
      tags: this.tags.map(t => ({ name: base64url.encode(t.name), value: base64url.encode(t.value) })),
      data: this.data
    };
  }

  /**
   * Verifies a `Buffer` and checks it fits the format of a DataItem
   *
   * A binary is valid iff:
   * - the tags are encoded correctly
   */
  static verify(buffer: Buffer, extras?: { id: Uint8Array, jwk: JWKPublicInterface }): boolean {
    if (buffer.length < MIN_BINARY_SIZE) {
      return false;
    }
    let tagsStart = 512 + 512 + 2;
    const targetPresent = (buffer[1024] == 1);
    tagsStart += targetPresent ? 32: 0;
    const anchorPresentByte = (targetPresent ? 1057 : 1025);
    const anchorPresent = (buffer[anchorPresentByte] == 1);
    tagsStart += anchorPresent ? 32: 0;

    const numberOfTags = byteArrayToLong(buffer.slice(tagsStart, tagsStart + 8));
    if (numberOfTags == 0) {
      return true;
    }
    const numberOfTagBytesArray = buffer.slice(tagsStart + 8, tagsStart + 16);
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

    if (extras) {
      // TODO: Check if id matches
    }

    try {
      const tags: { name: string, value:string }[] = tagsParser.fromBuffer(Buffer.from(buffer.slice(tagsStart + 16, tagsStart + 16 + numberOfTagBytes)));

      if (tags.length !== numberOfTags) {
        return false
      }
    } catch (e) {
      return false;
    }

    return true;
  }

  /**
   * Returns the start byte of the tags section (number of tags)
   *
   * @private
   */
  private getTagsStart(): number {
    let tagsStart = 512 + 512 + 2;
    const targetPresent = (this.binary[1024] == 1);
    tagsStart += targetPresent ? 32: 0;
    const anchorPresentByte = (targetPresent ? 1057 : 1025);
    const anchorPresent = (this.binary[anchorPresentByte] == 1);
    tagsStart += anchorPresent ? 32: 0;


    return tagsStart;
  }

  /**
   * Returns the start byte of the tags section (number of tags)
   *
   * @private
   */
  private getTargetStart(): number {
    return 1024;
  }

  /**
   * Returns the start byte of the tags section (number of tags)
   *
   * @private
   */
  private getAnchorStart(): number {
    let anchorStart = this.getTargetStart() + 1;
    const targetPresent = (this.binary[this.getTargetStart()] == 1);
    anchorStart += (targetPresent ? 32: 0);

    return anchorStart;
  }
}
