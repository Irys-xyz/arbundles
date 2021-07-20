import { byteArrayToLong } from "./utils";
import { tagsParser } from "./parser";
import base64url from "base64url";
import { Buffer } from "buffer";
import { JWKPublicInterface } from "./interface-jwk";
import { sign } from "./ar-data-bundle";
import Arweave from "arweave";

export default class DataItem {
  private readonly binary: Buffer;
  private id: Buffer;

  constructor(binary: Buffer) {
    this.binary = binary;
  };

  static isDataItem(obj: any): boolean {
    return obj.binary !== undefined;
  }

  isValid(): boolean {
    return DataItem.verify(this.binary);
  }

  getRawId(): Buffer {
    return this.id;
  }

  getId(): string {
    return base64url.encode(this.id, "hex");
  }

  getRawSignature(): Buffer {
    return this.binary.slice(0, 512);
  }

  getSignature(): string {
    return base64url.encode(this.getRawSignature(), "hex");
  }

  getRawOwner(): Buffer {
    return this.binary.slice(512, 512 + 512);
  }

  getOwner(): string {
    return base64url.encode(Buffer.from(this.getRawOwner()), "hex");
  }


  async getAddress(): Promise<string> {
    return base64url.encode(Buffer.from(await Arweave.crypto.hash(this.getRawOwner(), "SHA-256")), "hex");
  }

  getRawTarget(): Buffer {
    const targetStart = this.getTargetStart();
    const isPresent = this.binary[targetStart] == 1;
    return isPresent ? this.binary.slice(targetStart + 1, targetStart + 33) : Buffer.alloc(0);
  }

  getTarget(): string {
    const target = this.getRawTarget();
    return target.toString();
  }

  getRawAnchor(): Buffer {
    const anchorStart = this.getAnchorStart();
    const isPresent = this.binary[anchorStart] == 1;

    return isPresent ? this.binary.slice(anchorStart + 1, anchorStart + 33) : Buffer.alloc(0);
  }

  getAnchor(): string {
    return this.getRawAnchor().toString();
  }

  getRawTags(): Buffer {
    const tagsStart = this.getTagsStart();
    const tagsSize = byteArrayToLong(this.binary.slice(tagsStart + 8, tagsStart + 16));
    return this.binary.slice(tagsStart + 16, tagsStart + 16 + tagsSize);
  }

  getTags(): { name: string, value: string }[] {
    return tagsParser.fromBuffer(Buffer.from(this.getRawTags()));
  }

  getData(): Buffer {
    const tagsStart = this.getTagsStart();

    const numberOfTagBytesArray = this.binary.slice(tagsStart + 8, tagsStart + 16);
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);
    const dataStart = tagsStart + 16 + numberOfTagBytes;

    return this.binary.slice(dataStart, this.binary.length);
  }

  /**
   * UNSAFE!!
   * DO NOT MUTATE THE BINARY ARRAY. THIS WILL CAUSE UNDEFINED BEHAVIOUR.
   */
  getRaw(): Buffer {
    return this.binary;
  }

  public async sign(jwk: JWKPublicInterface): Promise<Buffer> {
    this.id = await sign(this, jwk);

    return this.getRawId();
  }

  public isSigned(): boolean {
    return (this.id?.length ?? 0) > 0;
  }

  /**
   * Returns a JSON representation of a DataItem
   */
  public toJSON(): { signature: string, target: string, owner: string, tags: string, data: string } {
    return {
      signature: base64url.encode(this.getSignature(), "hex"),
      owner: base64url.encode(this.getOwner().toString(), "hex"),
      target: base64url.encode(this.getTarget().toString(), "hex"),
      tags: base64url.encode(this.getTags().toString(), "hex"),
      data: base64url.encode(this.getData().toString(), "hex")
    };
  }

  /**
   * Verifies a `Buffer` and checks it fits the format of a DataItem
   *
   * A binary is valid iff:
   * - the tags are encoded correctly
   */
  static verify(buffer: Buffer, extras?: { id: Uint8Array, jwk: JWKPublicInterface }): boolean {
    let tagsStart = 512 + 512 + 2;
    const targetPresent = (buffer[1024] == 1);
    tagsStart += targetPresent ? 32: 0;
    const anchorPresentByte = (targetPresent ? 1057 : 1025);
    const anchorPresent = (buffer[anchorPresentByte] == 1);
    tagsStart += anchorPresent ? 32: 0;

    const numberOfTags = byteArrayToLong(buffer.slice(tagsStart, tagsStart + 8));
    const numberOfTagBytesArray = buffer.slice(tagsStart + 8, tagsStart + 16);
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

    if (extras) {
      // Check if id matches
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
