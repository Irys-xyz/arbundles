import { byteArrayToLong } from "./utils";
import { tagsParser } from "./parser";
import base64url from "base64url";
import { Buffer } from "buffer";
import { JWKPublicInterface } from "./interface-jwk";
import { sign } from "./ar-data-bundle";
import Arweave from "arweave";

export default class DataItem {
  private readonly binary: Uint8Array;
  private id: Uint8Array;

  constructor(binary: Uint8Array) {
    this.binary = binary;
  };

  static isDataItem(obj: any): boolean {
    return obj.binary !== undefined;
  }

  getRawId() {
    return this.id;
  }

  getId() {
    return base64url.encode(Buffer.from(this.id), "hex");
  }

  getRawOwner(): Uint8Array {
    return this.binary.slice(512, 512 + 512);
  }

  getOwner(): string {
    return base64url.encode(Buffer.from(this.getRawOwner()), "hex");
  }


  getAddress(): string {
    return base64url.encode(Buffer.from(await Arweave.crypto.hash(this.getRawOwner(), "SHA-256")), "hex");
  }

  getRawTarget(): Uint8Array {
    const targetStart = this.getTargetStart();
    const isPresent = this.binary[targetStart] == 1;
    return isPresent ? this.binary.slice(targetStart + 1, targetStart + 33) : new Uint8Array(0);
  }

  getTarget(): Uint8Array {
    return this.getRawTarget();
  }

  getRawAnchor(): Uint8Array {
    const anchorStart = this.getAnchorStart();
    const isPresent = this.binary[anchorStart] == 1;

    return isPresent ? this.binary.slice(anchorStart + 1, anchorStart + 33) : new Uint8Array(0);
  }

  getAnchor(): Uint8Array {
    return this.getRawAnchor();
  }

  getRawTags(): Uint8Array {
    const tagsStart = this.getTagsStart();
    const tagsSize = byteArrayToLong(this.binary.slice(tagsStart + 8, tagsStart + 16));
    return this.binary.slice(tagsStart + 16, tagsStart + 16 + tagsSize);
  }

  getTags(): { name: string, value: string }[] {
    return tagsParser.fromBuffer(Buffer.from(this.getRawTags()));
  }

  getData(): Uint8Array {
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

  public async sign(jwk: JWKPublicInterface) {
    this.id = await sign(this, jwk);

    return this.getId();
  }

  public isSigned() {
    return (this.id?.length ?? 0) > 0;
  }

  public verify(): boolean {
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
