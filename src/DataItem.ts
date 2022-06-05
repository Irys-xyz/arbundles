import { byteArrayToLong } from "./utils";
import { tagsParser } from "./parser";
import base64url from "base64url";
import { Buffer } from "buffer";
import { sign } from "./arDataBundle";
import { BundleItem } from "./BundleItem";
import { indexToType, Signer } from "./signing/index";
import { getSignatureData } from "./arDataBase";
import axios, { AxiosResponse } from "axios";
import { SIG_CONFIG, SignatureConfig } from "./constants";
import * as crypto from "crypto";

export const MIN_BINARY_SIZE = 80;

export default class DataItem implements BundleItem {
  private readonly binary: Buffer;
  private _id: Buffer;

  constructor(binary: Buffer) {
    this.binary = binary;
  }

  static isDataItem(obj: any): boolean {
    return obj.binary !== undefined;
  }

  get signatureType(): SignatureConfig {
    const signatureTypeVal: number = byteArrayToLong(
      this.binary.subarray(0, 2),
    );

    switch (signatureTypeVal) {
      case 1: {
        return SignatureConfig.ARWEAVE;
      }
      case 2: {
        return SignatureConfig.ED25519;
      }
      case 3: {
        return SignatureConfig.ETHEREUM;
      }
      case 4: {
        return SignatureConfig.SOLANA;
      }
      case 5: {
        return SignatureConfig.COSMOS;
      }
      default: {
        throw new Error("Unknown signature type: " + signatureTypeVal);
      }
    }
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
    return crypto.createHash("sha256").update(this.rawSignature).digest();
  }

  set rawId(id: Buffer) {
    this._id = id;
  }

  get rawSignature(): Buffer {
    return this.binary.subarray(2, 2 + this.signatureLength);
  }

  get signature(): string {
    return base64url.encode(this.rawSignature);
  }

  get signatureLength(): number {
    return SIG_CONFIG[this.signatureType].sigLength;
  }

  get rawOwner(): Buffer {
    return this.binary.subarray(
      2 + this.signatureLength,
      2 + this.signatureLength + this.ownerLength,
    );
  }

  get owner(): string {
    return base64url.encode(this.rawOwner);
  }

  get ownerLength(): number {
    return SIG_CONFIG[this.signatureType].pubLength;
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
      this.binary.subarray(tagsStart + 8, tagsStart + 16),
    );
    return this.binary.subarray(tagsStart + 16, tagsStart + 16 + tagsSize);
  }

  get tags(): { name: string; value: string }[] {
    const tagsStart = this.getTagsStart();
    const tagsCount = byteArrayToLong(
      this.binary.subarray(tagsStart, tagsStart + 8),
    );
    if (tagsCount == 0) {
      return [];
    }

    const tagsSize = byteArrayToLong(
      this.binary.subarray(tagsStart + 8, tagsStart + 16),
    );

    return tagsParser.fromBuffer(
      Buffer.from(
        this.binary.subarray(tagsStart + 16, tagsStart + 16 + tagsSize),
      ),
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
      tagsStart + 16,
    );
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);
    return tagsStart + 16 + numberOfTagBytes;
  }

  get rawData(): Buffer {
    const tagsStart = this.getTagsStart();

    const numberOfTagBytesArray = this.binary.subarray(
      tagsStart + 8,
      tagsStart + 16,
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

  /**
   * @deprecated Since version 0.3.0. Will be deleted in version 0.4.0. Use @bundlr-network/client package instead to interact with Bundlr
   */
  public async sendToBundler(bundler: string): Promise<AxiosResponse> {
    const headers = {
      "Content-Type": "application/octet-stream",
    };

    if (!this.isSigned())
      throw new Error("You must sign before sending to bundler");
    const response = await axios.post(`${bundler}/tx`, this.getRaw(), {
      headers,
      timeout: 100000,
      maxBodyLength: Infinity,
      validateStatus: (status) =>
        (status > 200 && status < 300) || status !== 402,
    });

    if (response.status === 402)
      throw new Error("Not enough funds to send data");

    return response;
  }

  /**
   * Verifies a `Buffer` and checks it fits the format of a DataItem
   *
   * A binary is valid iff:
   * - the tags are encoded correctly
   */
  static async verify(buffer: Buffer): Promise<boolean> {
    if (buffer.byteLength < MIN_BINARY_SIZE) {
      return false;
    }
    const item = new DataItem(buffer);
    const sigType = item.signatureType;
    const tagsStart = item.getTagsStart();

    const numberOfTags = byteArrayToLong(
      buffer.subarray(tagsStart, tagsStart + 8),
    );
    const numberOfTagBytesArray = buffer.subarray(
      tagsStart + 8,
      tagsStart + 16,
    );
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

    if (numberOfTagBytes > 4096) return false;

    if (numberOfTags > 0) {
      try {
        const tags: { name: string; value: string }[] = tagsParser.fromBuffer(
          Buffer.from(
            buffer.subarray(tagsStart + 16, tagsStart + 16 + numberOfTagBytes),
          ),
        );

        if (tags.length !== numberOfTags) {
          return false;
        }
      } catch (e) {
        return false;
      }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Signer = indexToType[sigType];

    const signatureData = await getSignatureData(item);
    return await Signer.verify(item.rawOwner, signatureData, item.rawSignature);
  }

  public async getSignatureData(): Promise<Uint8Array> {
    return getSignatureData(this);
  }

  /**
   * Returns the start byte of the tags section (number of tags)
   *
   * @private
   */
  private getTagsStart(): number {
    const targetStart = this.getTargetStart();
    const targetPresent = this.binary[targetStart] == 1;
    let tagsStart = targetStart + (targetPresent ? 33 : 1);
    const anchorPresent = this.binary[tagsStart] == 1;
    tagsStart += anchorPresent ? 33 : 1;

    return tagsStart;
  }

  /**
   * Returns the start byte of the tags section (number of tags)
   *
   * @private
   */
  private getTargetStart(): number {
    return 2 + this.signatureLength + this.ownerLength;
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
