import base64url from "base64url";
import { createReadStream, promises, read as FSRead, write as FSWrite } from "fs";
import type { PathLike } from "fs";
import { byteArrayToLong } from "../utils";
import type { BundleItem } from "../BundleItem";
import { deepHash, MAX_TAG_BYTES } from "../index";
import { getCryptoDriver, stringToBuffer } from "$/utils";
import type { Signer } from "../signing/index";
import { indexToType } from "../signing/index";
import type { AxiosResponse } from "axios";
import axios from "axios";
import { SIG_CONFIG } from "../constants";
import { promisify } from "util";
import { deserializeTags } from "../tags";
import type { Base64URLString } from "../types";

const read = promisify(FSRead);
const write = promisify(FSWrite);

export class FileDataItem implements BundleItem {
  public readonly filename: PathLike;
  async signatureLength(): Promise<number> {
    const type = await this.signatureType();
    const length = SIG_CONFIG[type]?.sigLength;
    if (!length) throw new Error("Signature type not supported");
    return length;
  }

  async ownerLength(): Promise<number> {
    const length = SIG_CONFIG[await this.signatureType()]?.pubLength;
    if (!length) throw new Error("Signature type not supported");
    return length;
  }

  constructor(filename: PathLike, id?: Buffer) {
    this.filename = filename;
    this._id = id;
  }

  private _id?: Buffer;

  get id(): string {
    if (!this._id) throw new Error("FileDataItem - ID is undefined");
    return base64url.encode(this._id);
  }

  get rawId(): Buffer {
    if (this._id) {
      return this._id;
    }

    throw new Error("ID is not set");
  }

  set rawId(id: Buffer) {
    this._id = id;
  }

  static isDataItem(obj: any): boolean {
    // return obj?.filename ? typeof obj.filename === "string" : false;
    return obj instanceof FileDataItem;
  }

  static async verify(filename: PathLike): Promise<boolean> {
    const handle = await promises.open(filename, "r");
    const item = new FileDataItem(filename);
    const sigType = await item.signatureType();
    const tagsStart = await item.getTagsStart();

    const numberOfTags = await read(handle.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart).then((r) => byteArrayToLong(r.buffer));
    const numberOfTagsBytes = await read(handle.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart + 8).then((r) => byteArrayToLong(r.buffer));
    if (numberOfTagsBytes > MAX_TAG_BYTES) {
      await handle.close();
      return false;
    }

    const tagsBytes = await read(handle.fd, Buffer.allocUnsafe(numberOfTagsBytes), 0, numberOfTagsBytes, tagsStart + 16).then((r) => r.buffer);
    if (numberOfTags > 0) {
      try {
        deserializeTags(tagsBytes);
      } catch (e) {
        await handle.close();
        return false;
      }
    }
    const Signer = indexToType[sigType];
    const owner = await item.rawOwner();

    const signatureData = await deepHash([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      stringToBuffer(sigType.toString()),
      owner,
      await item.rawTarget(),
      await item.rawAnchor(),
      await item.rawTags(),
      createReadStream(filename, {
        start: await item.dataStart(),
      }),
    ]);
    const sig = await item.rawSignature();
    if (!(await Signer.verify(owner, signatureData, sig))) {
      await handle.close();
      return false;
    }

    await handle.close();

    return true;
  }

  isValid(): Promise<boolean> {
    return FileDataItem.verify(this.filename);
  }

  isSigned(): boolean {
    return this._id !== undefined;
  }

  async size(): Promise<number> {
    return await promises.stat(this.filename).then((r) => r.size);
  }

  async signatureType(): Promise<number> {
    const handle = await promises.open(this.filename, "r");
    const buffer = await read(handle.fd, Buffer.allocUnsafe(2), 0, 2, 0).then((r) => r.buffer);
    await handle.close();
    return byteArrayToLong(buffer);
  }

  async rawSignature(): Promise<Buffer> {
    const handle = await promises.open(this.filename, "r");
    const length = await this.signatureLength();

    const buffer = await read(handle.fd, Buffer.alloc(length), 0, length, 2).then((r) => r.buffer);
    await handle.close();
    return buffer;
  }

  async signature(): Promise<string> {
    return base64url.encode(await this.rawSignature());
  }

  async rawOwner(): Promise<Buffer> {
    const handle = await promises.open(this.filename, "r");
    const length = await this.ownerLength();
    const buffer = await read(handle.fd, Buffer.allocUnsafe(length), 0, length, 2 + (await this.signatureLength())).then((r) => r.buffer);
    await handle.close();
    return buffer;
  }

  async owner(): Promise<string> {
    return base64url.encode(await this.rawOwner());
  }

  async rawTarget(): Promise<Buffer> {
    const handle = await promises.open(this.filename, "r");
    const targetStart = await this.getTargetStart();
    const targetPresentBuffer = await read(handle.fd, Buffer.allocUnsafe(1), 0, 1, targetStart).then((r) => r.buffer);
    const targetPresent = targetPresentBuffer[0] === 1;
    if (targetPresent) {
      const targetBuffer = await read(handle.fd, Buffer.allocUnsafe(32), 0, 32, targetStart + 1).then((r) => r.buffer);
      await handle.close();
      return targetBuffer;
    }
    await handle.close();
    return Buffer.allocUnsafe(0);
  }

  async target(): Promise<string> {
    return base64url.encode(await this.rawTarget());
  }

  async getTargetStart(): Promise<number> {
    return 2 + (await this.signatureLength()) + (await this.ownerLength());
  }

  async rawAnchor(): Promise<Buffer> {
    const [anchorPresent, anchorStart] = await this.anchorStart();
    if (anchorPresent) {
      const handle = await promises.open(this.filename, "r");
      const anchorBuffer = await read(handle.fd, Buffer.allocUnsafe(32), 0, 32, anchorStart + 1).then((r) => r.buffer);
      await handle.close();
      return anchorBuffer;
    }
    return Buffer.allocUnsafe(0);
  }

  async anchor(): Promise<Base64URLString> {
    return base64url.encode(await this.rawAnchor());
  }

  async rawTags(): Promise<Buffer> {
    const handle = await promises.open(this.filename, "r");
    const tagsStart = await this.getTagsStart();
    const numberOfTagsBuffer = await read(handle.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart).then((r) => r.buffer);
    const numberOfTags = byteArrayToLong(numberOfTagsBuffer);
    if (numberOfTags === 0) {
      await handle.close();
      return Buffer.allocUnsafe(0);
    }
    const numberOfTagsBytesBuffer = await read(handle.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart + 8).then((r) => r.buffer);
    const numberOfTagsBytes = byteArrayToLong(numberOfTagsBytesBuffer);
    if (numberOfTagsBytes > MAX_TAG_BYTES) {
      await handle.close();
      throw new Error("Tags too large");
    }
    const tagsBytes = await read(handle.fd, Buffer.allocUnsafe(numberOfTagsBytes), 0, numberOfTagsBytes, tagsStart + 16).then((r) => r.buffer);
    await handle.close();
    return tagsBytes;
  }

  async tags(): Promise<{ name: string; value: string }[]> {
    const tagsBytes = await this.rawTags();
    if (tagsBytes.byteLength === 0) return [];
    return deserializeTags(tagsBytes);
  }

  async rawData(): Promise<Buffer> {
    const dataStart = await this.dataStart();
    const size = await this.size();
    const dataSize = size - dataStart;
    if (dataSize === 0) {
      return Buffer.allocUnsafe(0);
    }
    const handle = await promises.open(this.filename, "r");

    const dataBuffer = await read(handle.fd, Buffer.allocUnsafe(dataSize), 0, dataSize, dataStart).then((r) => r.buffer);
    await handle.close();
    return dataBuffer;
  }

  async data(): Promise<string> {
    return base64url.encode(await this.rawData());
  }

  async sign(signer: Signer): Promise<Buffer> {
    const dataStart = await this.dataStart();

    const signatureData = await deepHash([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      stringToBuffer((await this.signatureType()).toString()),
      await this.rawOwner(),
      await this.rawTarget(),
      await this.rawAnchor(),
      await this.rawTags(),
      createReadStream(this.filename, { start: dataStart }),
    ]);

    const signatureBytes = await signer.sign(signatureData);
    const idBytes = await getCryptoDriver().hash(signatureBytes);
    const handle = await promises.open(this.filename, "r+");
    await write(handle.fd, signatureBytes, 0, await this.signatureLength(), 2);

    this.rawId = Buffer.from(idBytes);

    await handle.close();
    return Buffer.from(idBytes);
  }

  /**
   * @deprecated Since version 0.3.0. Will be deleted in version 0.4.0. Use @bundlr-network/client package instead to interact with Bundlr
   */
  public async sendToBundler(bundler: string): Promise<AxiosResponse> {
    const headers = {
      "Content-Type": "application/octet-stream",
    };

    if (!this.isSigned()) throw new Error("You must sign before sending to bundler");
    const response = await axios.post(`${bundler}/tx`, createReadStream(this.filename), {
      headers,
      timeout: 100000,
      maxBodyLength: Infinity,
      validateStatus: (status) => (status > 200 && status < 300) || status !== 402,
    });

    if (response.status === 402) throw new Error("Not enough funds to send data");

    return response;
  }

  public async getTagsStart(): Promise<number> {
    const [anchorPresent, anchorStart] = await this.anchorStart();
    let tagsStart = anchorStart;
    tagsStart += anchorPresent ? 33 : 1;
    return tagsStart;
  }

  public async dataStart(): Promise<number> {
    const handle = await promises.open(this.filename, "r");
    const tagsStart = await this.getTagsStart();
    const numberOfTagsBytesBuffer = await read(handle.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart + 8).then((r) => r.buffer);
    const numberOfTagsBytes = byteArrayToLong(numberOfTagsBytesBuffer);
    await handle.close();
    return tagsStart + 16 + numberOfTagsBytes;
  }

  private async anchorStart(): Promise<[boolean, number]> {
    const targetStart = await this.getTargetStart();
    const handle = await promises.open(this.filename, "r");
    const targetPresentBuffer = await read(handle.fd, Buffer.allocUnsafe(1), 0, 1, targetStart).then((r) => r.buffer);
    const targetPresent = targetPresentBuffer[0] === 1;
    const anchorStart = targetStart + (targetPresent ? 33 : 1);
    const anchorPresentBuffer = await read(handle.fd, Buffer.allocUnsafe(1), 0, 1, anchorStart).then((r) => r.buffer);
    const anchorPresent = anchorPresentBuffer[0] === 1;
    await handle.close();
    return [anchorPresent, anchorStart];
  }
}
export default FileDataItem;
