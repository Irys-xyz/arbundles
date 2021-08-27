import base64url from 'base64url';
import * as fs from 'fs';
import { PathLike } from 'fs';
import { byteArrayToLong } from '../utils';
import { tagsParser } from '../parser';
import { BundleItem } from '../BundleItem';
import { deepHash } from '../index';
import { stringToBuffer } from 'arweave/web/lib/utils';
import Arweave from 'arweave';
import { promisify } from 'util';
import { indexToType, Signer } from '../signing/index';
import { Buffer } from 'buffer';

const write = promisify(fs.write);
const read = promisify(fs.read);
export default class FileDataItem implements BundleItem {
  public readonly filename: PathLike;
  private _id?: Buffer;

  constructor(filename: PathLike, id?: Buffer) {
    this.filename = filename;
    this._id = id;
  }

  static isDataItem(obj: any): boolean {
    return obj.filename && typeof obj.filename === "string";
  }

  isValid(): Promise<boolean> {
    return FileDataItem.verify(this.filename);
  }

  isSigned(): boolean {
    return this._id !== undefined;
  }

  get size(): number {
    return fs.statSync(this.filename).size;
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

  get id(): string {
    return base64url.encode(this._id);
  }

  get signatureType(): number {
    const fd = fs.openSync(this.filename, "r");
    const buffer = Buffer.allocUnsafe(2);
    fs.readSync(fd, buffer, 0, 2, 0);
    return byteArrayToLong(buffer);
  }

  get rawSignature(): Buffer {
    const fd = fs.openSync(this.filename, "r");
    const buffer = Buffer.allocUnsafe(512);
    fs.readSync(fd, buffer, 0, 512, 2);
    return buffer;
  }

  get signature(): string {
    return base64url.encode(this.rawSignature);
  }

  get rawOwner(): Buffer {
    const fd = fs.openSync(this.filename, "r");
    const buffer = Buffer.allocUnsafe(512);
    fs.readSync(fd, buffer, 0, 512, 514);
    return buffer;
  }

  get owner(): string {
    return base64url.encode(this.rawOwner);
  }

  get rawTarget(): Buffer {
    const fd = fs.openSync(this.filename, "r");
    const targetPresentBuffer = Buffer.allocUnsafe(1);
    fs.readSync(fd, targetPresentBuffer, 0, 1, 1026);
    const targetPresent = targetPresentBuffer[0] === 1;
    if (targetPresent) {
      const targetBuffer = Buffer.allocUnsafe(32);
      fs.readSync(fd, targetBuffer, 0, 32, 1027);
      return targetBuffer;
    }
    return Buffer.allocUnsafe(0);
  }

  get target(): string {
    return base64url.encode(this.rawTarget);
  }

  get rawAnchor(): Buffer {
    let anchorStart = 1027;
    const fd = fs.openSync(this.filename, "r");
    const targetPresentBuffer = Buffer.allocUnsafe(1);
    fs.readSync(fd, targetPresentBuffer, 0, 1, 1026);
    const targetPresent = targetPresentBuffer[0] === 1;
    if (targetPresent) {
      anchorStart += 32;
    }
    const anchorPresentBuffer = Buffer.allocUnsafe(1);
    fs.readSync(fd, anchorPresentBuffer, 0, 1, anchorStart);
    const anchorPresent = anchorPresentBuffer[0] === 1;
    if (anchorPresent) {
      const anchorBuffer = Buffer.allocUnsafe(32);
      fs.readSync(fd, anchorBuffer, 0, 32, anchorStart + 1);
      return anchorBuffer;
    }
    return Buffer.allocUnsafe(0);
  }

  get anchor(): string {
    return base64url.encode(this.rawAnchor);
  }

  get rawTags(): Buffer {
    const fd = fs.openSync(this.filename, "r");
    const tagsStart = this.tagsStart;
    const numberOfTagsBuffer = Buffer.allocUnsafe(8);
    fs.readSync(fd, numberOfTagsBuffer, 0, 8, tagsStart);
    const numberOfTags = byteArrayToLong(numberOfTagsBuffer);
    if (numberOfTags === 0) return Buffer.allocUnsafe(0);
    const numberOfTagsBytesBuffer = Buffer.allocUnsafe(8);
    fs.readSync(fd, numberOfTagsBytesBuffer, 0, 8, tagsStart + 8);
    const numberOfTagsBytes = byteArrayToLong(numberOfTagsBytesBuffer);
    const tagsBytes = Buffer.allocUnsafe(numberOfTagsBytes);
    fs.readSync(fd, tagsBytes, 0, numberOfTagsBytes, tagsStart + 16);
    return tagsBytes;
  }

  get tags(): { name: string, value: string }[] {
    const tagsBytes = this.rawTags;
    if (tagsBytes.byteLength === 0) return [];
    return tagsParser.fromBuffer(tagsBytes);
  }

  get rawData(): Buffer {
    const fd = fs.openSync(this.filename, "r");
    const tagsStart = this.tagsStart;
    const numberOfTagsBytesBuffer = Buffer.allocUnsafe(8);
    fs.readSync(fd, numberOfTagsBytesBuffer, 0, 8, tagsStart + 8);
    const numberOfTagsBytes = byteArrayToLong(numberOfTagsBytesBuffer);
    const dataStart = tagsStart + 16 + numberOfTagsBytes;
    const size = this.size;
    const dataSize = size - dataStart;
    if (dataSize === 0) {
      return Buffer.allocUnsafe(0);
    }
    const dataBuffer = Buffer.allocUnsafe(dataSize);
    fs.readSync(fd, dataBuffer, 0, dataSize, dataStart);
    return dataBuffer;
  }

  get data(): string {
    return base64url.encode(this.rawData);
  }

  async sign(signer: Signer): Promise<Buffer> {
    const dataStart = this.dataStart;
    const end = this.size;
    const signatureData = await deepHash([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      stringToBuffer(this.signatureType.toString()),
      this.rawOwner,
      this.rawTarget,
      this.rawAnchor,
      this.rawTags,
      fs.createReadStream(this.filename, { start: dataStart, end })
    ]);

    const signatureBytes = await signer.sign(signatureData);
    const idBytes = await Arweave.crypto.hash(signatureBytes);
    const handle = await fs.promises.open(this.filename, "r+");
    await write(handle.fd, signatureBytes, 0, 512, 2);

    this.rawId = Buffer.from(idBytes);

    await handle.close();
    return Buffer.from(idBytes);
  }

  static async verify(filename: PathLike, extras?: { pk: string | Buffer }): Promise<boolean> {
    const file = await fs.promises.open(filename, "r");
    const sigType = await read(file.fd, Buffer.allocUnsafe(2), 0, 2, 0)
      .then(r => byteArrayToLong(r.buffer));
    let anchorStart = 1027;
    const targetPresentBuffer = Buffer.allocUnsafe(1);
    fs.readSync(file.fd, targetPresentBuffer, 0, 1, 1026);
    const targetPresent = targetPresentBuffer[0] === 1;
    if (targetPresent) {
      anchorStart += 32;
    }
    const anchorPresentBuffer = Buffer.allocUnsafe(1);
    fs.readSync(file.fd, anchorPresentBuffer, 0, 1, anchorStart);
    const anchorPresent = anchorPresentBuffer[0] === 1;
    let tagsStart = anchorStart;
    tagsStart += anchorPresent ? 32 : 1;

    const numberOfTags = await read(file.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart)
      .then(r => byteArrayToLong(r.buffer));
    const numberOfTagsBytes = await read(file.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart + 8)
      .then(r => byteArrayToLong(r.buffer));
    const tagsBytes = await read(file.fd, Buffer.allocUnsafe(numberOfTagsBytes), 0, numberOfTagsBytes, tagsStart + 16)
      .then(r => r.buffer);
    if (numberOfTags > 0) {
      try {
        tagsParser.fromBuffer(tagsBytes);
      } catch (e) {
        return false;
      }
    }
    if (extras) {
      const Signer = indexToType[sigType];

      const owner = await read(file.fd, Buffer.allocUnsafe(512), 0, 512, 514)
        .then(r => r.buffer);
      const target = targetPresent ? await read(file.fd, Buffer.allocUnsafe(32), 0, 32, 1027)
        .then(r => r.buffer) : Buffer.allocUnsafe(0);
      const anchor = anchorPresent ? await read(file.fd, Buffer.allocUnsafe(32), 0, 32, anchorStart + 1)
        .then(r => r.buffer) : Buffer.allocUnsafe(0);

      const signatureData = await deepHash([
        stringToBuffer("dataitem"),
        stringToBuffer("1"),
        stringToBuffer(sigType.toString()),
        owner,
        target,
        anchor,
        tagsBytes,
        fs.createReadStream(filename, { start: tagsStart + 16 + numberOfTagsBytes })
      ]);

      const signature = await read(file.fd, Buffer.allocUnsafe(512), 0, 512, 2)
        .then(r => r.buffer);

      if (!await Signer.verify(extras.pk, signatureData, signature)) return false;
    }
    await file.close()

    return true;
  }

  private get anchorStart(): [boolean, number] {
    let anchorStart = 1027;
    const fd = fs.openSync(this.filename, "r");
    const targetPresentBuffer = Buffer.allocUnsafe(1);
    fs.readSync(fd, targetPresentBuffer, 0, 1, 1026);
    const targetPresent = targetPresentBuffer[0] === 1;
    if (targetPresent) {
      anchorStart += 32;
    }
    const anchorPresentBuffer = Buffer.allocUnsafe(1);
    fs.readSync(fd, anchorPresentBuffer, 0, 1, anchorStart);
    const anchorPresent = anchorPresentBuffer[0] === 1;
    return [anchorPresent, anchorStart];
  }

  private get tagsStart(): number {
    const [anchorPresent, anchorStart] = this.anchorStart;
    let tagsStart = anchorStart;
    tagsStart += anchorPresent ? 32 : 1;
    return tagsStart;
  }

  private get dataStart(): number {
    const fd = fs.openSync(this.filename, "r");
    const tagsStart = this.tagsStart;
    const numberOfTagsBytesBuffer = Buffer.allocUnsafe(8);
    fs.readSync(fd, numberOfTagsBytesBuffer, 0, 8, tagsStart + 8);
    const numberOfTagsBytes = byteArrayToLong(numberOfTagsBytesBuffer);
    return tagsStart + 16 + numberOfTagsBytes;
  }
}
