import { byteArrayToLong } from "./utils";
import { tagsParser } from "./parser";
import base64url from "base64url";
import { Buffer } from "buffer";
import { sign } from "./ar-data-bundle";
import { BundleItem } from "./BundleItem";
import { Signer } from "./signing/index";
import { indexToType } from "./signing/index";
import { getSignatureData } from "./ar-data-base";
import axios, { AxiosResponse } from "axios";
import { BUNDLER } from "./constants";

export const MIN_BINARY_SIZE = 1044;

export default class DataItem implements BundleItem {
  private readonly binary: Buffer;
  private _id: Buffer;

  constructor(binary: Buffer) {
    this.binary = binary;
  }

  static isDataItem(obj: any): boolean {
    return obj.binary !== undefined;
  }

  get signatureType(): number {
    return byteArrayToLong(this.binary.subarray(0, 2));
  }

  async isValid(): Promise<boolean> {
    return DataItem.verify(this.binary);
  }

  get id(): string {
    return base64url.encode(this.rawId);
  }

  set id(id: string) {
    this._id = base64url.toBuffer(id);
  }

  get rawId(): Buffer {
    if (!this._id) {
      throw new Error("To get the data item id you must sign the item first");
    }
    return this._id;
  }

  set rawId(id: Buffer) {
    this._id = id;
  }

  get rawSignature(): Buffer {
    return this.binary.subarray(2, 514);
  }

  get signature(): string {
    return base64url.encode(this.rawSignature);
  }

  get rawOwner(): Buffer {
    return this.binary.subarray(514, 514 + 512);
  }

  get owner(): string {
    return base64url.encode(this.rawOwner);
  }

  get rawTarget(): Buffer {
    const targetStart = this.getTargetStart();
    const isPresent = this.binary[targetStart] == 1;
    return isPresent
      ? this.binary.subarray(targetStart + 1, targetStart + 33)
      : Buffer.alloc(0);
  }

  get target(): string {
    return base64url.encode(this.rawTarget);
  }

  get rawAnchor(): Buffer {
    const anchorStart = this.getAnchorStart();
    const isPresent = this.binary[anchorStart] == 1;

    return isPresent
      ? this.binary.subarray(anchorStart + 1, anchorStart + 33)
      : Buffer.alloc(0);
  }

  get anchor(): string {
    return this.rawAnchor.toString();
  }

  get rawTags(): Buffer {
    const tagsStart = this.getTagsStart();
    const tagsSize = byteArrayToLong(
      this.binary.subarray(tagsStart + 8, tagsStart + 16)
    );
    return this.binary.subarray(tagsStart + 16, tagsStart + 16 + tagsSize);
  }

  get tags(): { name: string; value: string }[] {
    const tagsStart = this.getTagsStart();
    const tagsCount = byteArrayToLong(
      this.binary.subarray(tagsStart, tagsStart + 8)
    );
    if (tagsCount == 0) {
      return [];
    }

    const tagsSize = byteArrayToLong(
      this.binary.subarray(tagsStart + 8, tagsStart + 16)
    );

    return tagsParser.fromBuffer(
      Buffer.from(
        this.binary.subarray(tagsStart + 16, tagsStart + 16 + tagsSize)
      )
    );
  }

  get tagsB64Url(): { name: string; value: string }[] {
    const _tags = this.tags;
    return _tags.map((t) => ({
      name: base64url.encode(t.name),
      value: base64url.encode(t.value),
    }));
  }

  getStartOfData(): number {
    const tagsStart = this.getTagsStart();

    const numberOfTagBytesArray = this.binary.subarray(
      tagsStart + 8,
      tagsStart + 16
    );
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);
    return tagsStart + 16 + numberOfTagBytes;
  }

  get rawData(): Buffer {
    const tagsStart = this.getTagsStart();

    const numberOfTagBytesArray = this.binary.subarray(
      tagsStart + 8,
      tagsStart + 16
    );
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);
    const dataStart = tagsStart + 16 + numberOfTagBytes;

    return this.binary.subarray(dataStart, this.binary.length);
  }

  get data(): string {
    return base64url.encode(this.rawData);
  }

  /**
   * UNSAFE!!
   * DO NOT MUTATE THE BINARY ARRAY. THIS WILL CAUSE UNDEFINED BEHAVIOUR.
   */
  getRaw(): Buffer {
    return this.binary;
  }

  public async sign(signer: Signer): Promise<Buffer> {
    this._id = await sign(this, signer);

    return this.rawId;
  }

  public isSigned(): boolean {
    return (this._id?.length ?? 0) > 0;
  }

  /**
   * Returns a JSON representation of a DataItem
   */
  public toJSON(): {
    owner: string;
    data: string;
    signature: string;
    target: string;
    tags: { name: string; value: string }[];
  } {
    return {
      signature: this.signature,
      owner: this.owner,
      target: this.target,
      tags: this.tags.map((t) => ({
        name: base64url.encode(t.name),
        value: base64url.encode(t.value),
      })),
      data: this.data,
    };
  }

  public async sendToBundler(bundler?: string): Promise<AxiosResponse> {
    const headers = {
      "Content-Type": "application/octet-stream",
    };

    if (!this.isSigned())
      throw new Error("You must sign before sending to bundler");
    return await axios.post(`${bundler ?? BUNDLER}/tx`, this.getRaw(), {
      headers,
      timeout: 100000,
      maxBodyLength: Infinity,
    });
  }

  /**
   * Verifies a `Buffer` and checks it fits the format of a DataItem
   *
   * A binary is valid iff:
   * - the tags are encoded correctly
   */
  static async verify(buffer: Buffer): Promise<boolean> {
    if (buffer.length < MIN_BINARY_SIZE) {
      return false;
    }
    const sigType = byteArrayToLong(buffer.subarray(0, 2));
    let tagsStart = 2 + 512 + 512 + 2;
    const targetPresent = buffer[1026] == 1;
    tagsStart += targetPresent ? 32 : 0;
    const anchorPresentByte = targetPresent ? 1059 : 1027;
    const anchorPresent = buffer[anchorPresentByte] == 1;
    tagsStart += anchorPresent ? 32 : 0;

    const numberOfTags = byteArrayToLong(
      buffer.subarray(tagsStart, tagsStart + 8)
    );
    const numberOfTagBytesArray = buffer.subarray(
      tagsStart + 8,
      tagsStart + 16
    );
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

    if (numberOfTags > 0) {
      try {
        const tags: { name: string; value: string }[] = tagsParser.fromBuffer(
          Buffer.from(
            buffer.subarray(tagsStart + 16, tagsStart + 16 + numberOfTagBytes)
          )
        );

        if (tags.length !== numberOfTags) {
          return false;
        }
      } catch (e) {
        return false;
      }
    }

    const Signer = indexToType[sigType];

    const item = new DataItem(buffer);
    const signatureData = await getSignatureData(item);

    return await Signer.verify(
      item.owner,
      signatureData,
      buffer.subarray(2, 514)
    );
  }

  /**
   * Returns the start byte of the tags section (number of tags)
   *
   * @private
   */
  private getTagsStart(): number {
    let tagsStart = 2 + 512 + 512 + 2;
    const targetPresent = this.binary[1026] == 1;
    tagsStart += targetPresent ? 32 : 0;
    const anchorPresentByte = targetPresent ? 1059 : 1027;
    const anchorPresent = this.binary[anchorPresentByte] == 1;
    tagsStart += anchorPresent ? 32 : 0;

    return tagsStart;
  }

  /**
   * Returns the start byte of the tags section (number of tags)
   *
   * @private
   */
  private getTargetStart(): number {
    return 1026;
  }

  /**
   * Returns the start byte of the tags section (number of tags)
   *
   * @private
   */
  private getAnchorStart(): number {
    let anchorStart = this.getTargetStart() + 1;
    const targetPresent = this.binary[this.getTargetStart()] == 1;
    anchorStart += targetPresent ? 32 : 0;

    return anchorStart;
  }
}
