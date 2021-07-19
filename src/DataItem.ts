import { byteArrayToLong } from "./utils";
import { tagsParser } from "./parser";
import base64url from "base64url";
import { Buffer } from "buffer";
import { JWKPublicInterface } from "./interface-jwk";
import { sign } from "./ar-data-bundle";
import Arweave from "arweave";
import Transaction, { Tag } from 'arweave/node/lib/transaction';

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
  getRaw(): Uint8Array {
    return this.binary;
  }

  public async sign(jwk: JWKPublicInterface): Promise<Buffer> {
    this.id = await sign(this, jwk);

    return this.getRawId();
  }

  public isSigned(): boolean {
    return (this.id?.length ?? 0) > 0;
  }

  public async toTransaction(arweave: Arweave): Promise<Transaction> {
    return await arweave.createTransaction({
      target: this.getTarget(),
      owner: this.getOwner(),
      tags: this.getTags().map(t => new Tag(t.name, t.value)),
      data: this.getData()
    });
  }

  /**
   * Verifies a `Buffer` and checks it fits the format of a DataItem
   *
   * A binary is valid iff:
   * - the tags are encoded correctly
   */
  static verify(_: Buffer, __?: { id: Uint8Array, jwk: JWKPublicInterface }): boolean {
    // const numberOfDataItems = byteArrayToLong(buffer.slice(0, 32));

    // if (extras) {
    //   // Check if id matches
    // }
    //
    // try {
    //   let tags: { name: string, value:string }[] = tagsParser.fromBuffer(Buffer.from(buffer.slice(0, 0)));
    //
    //   if tags.length
    //
    // } catch (e) {
    //   return false;
    // }

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
