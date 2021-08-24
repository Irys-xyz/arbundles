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
import { Signer } from '../signing';

const write = promisify(fs.write);

export default class FileDataItem implements BundleItem {
  public readonly filename: PathLike;
  private readonly _id?: Buffer;

  constructor(filename: PathLike, id?: Buffer) {
    this.filename = filename;
    this._id = id;
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
    const dataSize = this.size - dataStart;
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
    const handle = await fs.promises.open(this.filename, "a");
    await write(handle.fd, signatureBytes, 0, 512, 2);

    await handle.close();
    return Buffer.from(idBytes);
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
