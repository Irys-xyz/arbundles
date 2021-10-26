import base64url from "base64url";
import * as fs from "fs";
import { PathLike } from "fs";
import { byteArrayToLong } from "../utils";
import { tagsParser } from "../parser";
import { BundleItem } from "../BundleItem";
import { deepHash } from "../index";
import { stringToBuffer } from "arweave/web/lib/utils";
import Arweave from "arweave";
import { promisify } from "util";
import { indexToType, Signer } from "../signing";
import axios, { AxiosResponse } from 'axios';
import { BUNDLER } from '../constants';

const write = promisify(fs.write);
const read = promisify(fs.read);
export default class FileDataItem implements BundleItem {
  public readonly filename: PathLike;

  constructor(filename: PathLike, id?: Buffer) {
    this.filename = filename;
    this._id = id;
  }

  private _id?: Buffer;

  get id(): string {
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
    return obj.filename && typeof obj.filename === "string";
  }

  static async verify(filename: PathLike): Promise<boolean> {
    const handle = await fs.promises.open(filename, "r");
    const sigType = await read(
      handle.fd,
      Buffer.allocUnsafe(2),
      0,
      2,
      0
    ).then((r) => byteArrayToLong(r.buffer));
    let anchorStart = 1027;
    const targetPresentBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(1),
      0,
      1,
      1026
    ).then((r) => r.buffer);
    const targetPresent = targetPresentBuffer[0] === 1;
    if (targetPresent) {
      anchorStart += 32;
    }
    const anchorPresentBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(1),
      0,
      1,
      anchorStart
    ).then((r) => r.buffer);
    const anchorPresent = anchorPresentBuffer[0] === 1;
    let tagsStart = anchorStart;
    if (anchorPresent) {
      tagsStart += 32;
    }
    tagsStart++;

    const numberOfTags = await read(
      handle.fd,
      Buffer.allocUnsafe(8),
      0,
      8,
      tagsStart
    ).then((r) => byteArrayToLong(r.buffer));
    const numberOfTagsBytes = await read(
      handle.fd,
      Buffer.allocUnsafe(8),
      0,
      8,
      tagsStart + 8
    ).then((r) => byteArrayToLong(r.buffer));
    if (numberOfTagsBytes > 2048) return false;

    const tagsBytes = await read(
      handle.fd,
      Buffer.allocUnsafe(numberOfTagsBytes),
      0,
      numberOfTagsBytes,
      tagsStart + 16
    ).then((r) => r.buffer);
    if (numberOfTags > 0) {
      try {
        tagsParser.fromBuffer(tagsBytes);
      } catch (e) {
        await handle.close();
        return false;
      }
    }
    const Signer = indexToType[sigType];

    const owner = await read(
      handle.fd,
      Buffer.allocUnsafe(512),
      0,
      512,
      514
    ).then((r) => r.buffer);
    const target = targetPresent
      ? await read(handle.fd, Buffer.allocUnsafe(32), 0, 32, 1027).then(
          (r) => r.buffer
        )
      : Buffer.allocUnsafe(0);
    const anchor = anchorPresent
      ? await read(
          handle.fd,
          Buffer.allocUnsafe(32),
          0,
          32,
          anchorStart + 1
        ).then((r) => r.buffer)
      : Buffer.allocUnsafe(0);

    const signatureData = await deepHash([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      stringToBuffer(sigType.toString()),
      owner,
      target,
      anchor,
      tagsBytes,
      fs.createReadStream(filename, {
        start: tagsStart + 16 + numberOfTagsBytes,
      }),
    ]);

    const signature = await read(
      handle.fd,
      Buffer.allocUnsafe(512),
      0,
      512,
      2
    ).then((r) => r.buffer);

    await handle.close();
    if (!(await Signer.verify(owner, signatureData, signature))) return false;

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
    return await fs.promises.stat(this.filename).then((r) => r.size);
  }

  async signatureType(): Promise<number> {
    const handle = await fs.promises.open(this.filename, "r");
    const buffer = await read(handle.fd, Buffer.allocUnsafe(2), 0, 2, 0).then(
      (r) => r.buffer
    );
    await handle.close();
    return byteArrayToLong(buffer);
  }

  async rawSignature(): Promise<Buffer> {
    const handle = await fs.promises.open(this.filename, "r");
    const buffer = await read(
      handle.fd,
      Buffer.allocUnsafe(512),
      0,
      512,
      2
    ).then((r) => r.buffer);
    await handle.close();
    return buffer;
  }

  async signature(): Promise<string> {
    return base64url.encode(await this.rawSignature());
  }

  async rawOwner(): Promise<Buffer> {
    const handle = await fs.promises.open(this.filename, "r");
    const buffer = await read(
      handle.fd,
      Buffer.allocUnsafe(512),
      0,
      512,
      514
    ).then((r) => r.buffer);
    await handle.close();
    return buffer;
  }

  async owner(): Promise<string> {
    return base64url.encode(await this.rawOwner());
  }

  async rawTarget(): Promise<Buffer> {
    const handle = await fs.promises.open(this.filename, "r");
    const targetPresentBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(1),
      0,
      1,
      1026
    ).then((r) => r.buffer);
    const targetPresent = targetPresentBuffer[0] === 1;
    if (targetPresent) {
      const targetBuffer = await read(
        handle.fd,
        Buffer.allocUnsafe(32),
        0,
        32,
        1027
      ).then((r) => r.buffer);
      await handle.close();
      return targetBuffer;
    }
    await handle.close();
    return Buffer.allocUnsafe(0);
  }

  async target(): Promise<string> {
    return base64url.encode(await this.rawTarget());
  }

  async rawAnchor(): Promise<Buffer> {
    const [anchorPresent, anchorStart] = await this.anchorStart();
    if (anchorPresent) {
      const handle = await fs.promises.open(this.filename, "r");
      const anchorBuffer = await read(
        handle.fd,
        Buffer.allocUnsafe(32),
        0,
        32,
        anchorStart + 1
      ).then((r) => r.buffer);
      await handle.close();
      return anchorBuffer;
    }
    return Buffer.allocUnsafe(0);
  }

  async anchor(): Promise<string> {
    return base64url.encode(await this.rawAnchor());
  }

  async rawTags(): Promise<Buffer> {
    const handle = await fs.promises.open(this.filename, "r");
    const tagsStart = await this.tagsStart();
    const numberOfTagsBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(8),
      0,
      8,
      tagsStart
    ).then((r) => r.buffer);
    const numberOfTags = byteArrayToLong(numberOfTagsBuffer);
    if (numberOfTags === 0) return Buffer.allocUnsafe(0);
    const numberOfTagsBytesBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(8),
      0,
      8,
      tagsStart + 8
    ).then((r) => r.buffer);
    const numberOfTagsBytes = byteArrayToLong(numberOfTagsBytesBuffer);
    const tagsBytes = await read(
      handle.fd,
      Buffer.allocUnsafe(numberOfTagsBytes),
      0,
      numberOfTagsBytes,
      tagsStart + 16
    ).then((r) => r.buffer);
    await handle.close();
    return tagsBytes;
  }

  async tags(): Promise<{ name: string; value: string }[]> {
    const tagsBytes = await this.rawTags();
    if (tagsBytes.byteLength === 0) return [];
    return tagsParser.fromBuffer(tagsBytes);
  }

  async rawData(): Promise<Buffer> {
    const dataStart = await this.dataStart();
    const size = await this.size();
    const dataSize = size - dataStart;
    if (dataSize === 0) {
      return Buffer.allocUnsafe(0);
    }
    const handle = await fs.promises.open(this.filename, "r");

    const dataBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(dataSize),
      0,
      dataSize,
      dataStart
    ).then((r) => r.buffer);
    await handle.close();
    return dataBuffer;
  }

  async data(): Promise<string> {
    return base64url.encode(await this.rawData());
  }

  async sign(signer: Signer): Promise<Buffer> {
    const dataStart = await this.dataStart();
    const end = await this.size();

    const signatureData = await deepHash([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      stringToBuffer(await this.signatureType().then((n) => n.toString())),
      await this.rawOwner(),
      await this.rawTarget(),
      await this.rawAnchor(),
      await this.rawTags(),
      fs.createReadStream(this.filename, { start: dataStart, end }),
    ]);

    const signatureBytes = await signer.sign(signatureData);
    const idBytes = await Arweave.crypto.hash(signatureBytes);
    const handle = await fs.promises.open(this.filename, "r+");
    await write(handle.fd, signatureBytes, 0, 512, 2);

    this.rawId = Buffer.from(idBytes);

    await handle.close();
    return Buffer.from(idBytes);
  }

  public async sendToBundler(bundler: string): Promise<AxiosResponse> {
    const headers = {
      "Content-Type": "application/octet-stream",
    };

    if (!this.isSigned())
      throw new Error("You must sign before sending to bundler");
    const response = await axios.post(`${bundler ?? BUNDLER}/tx`, fs.createReadStream(this.filename), {
      headers,
      timeout: 100000,
      maxBodyLength: Infinity,
      validateStatus: (status) => (status > 200 && status < 300) || status !== 402
    });

    if (response.status === 402) throw new Error("Not enough funds to send data");

    return response;
  }

  private async anchorStart(): Promise<[boolean, number]> {
    let anchorStart = 1027;
    const handle = await fs.promises.open(this.filename, "r");
    const targetPresentBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(1),
      0,
      1,
      1026
    ).then((r) => r.buffer);
    const targetPresent = targetPresentBuffer[0] === 1;
    if (targetPresent) {
      anchorStart += 32;
    }
    const anchorPresentBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(1),
      0,
      1,
      anchorStart
    ).then((r) => r.buffer);
    const anchorPresent = anchorPresentBuffer[0] === 1;
    await handle.close();
    return [anchorPresent, anchorStart];
  }

  public async tagsStart(): Promise<number> {
    const [anchorPresent, anchorStart] = await this.anchorStart();
    let tagsStart = anchorStart;
    tagsStart += anchorPresent ? 33 : 1;
    return tagsStart;
  }

  public async dataStart(): Promise<number> {
    const handle = await fs.promises.open(this.filename, "r");
    const tagsStart = await this.tagsStart();
    const numberOfTagsBytesBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(8),
      0,
      8,
      tagsStart + 8
    ).then((r) => r.buffer);
    const numberOfTagsBytes = byteArrayToLong(numberOfTagsBytesBuffer);
    await handle.close();
    return tagsStart + 16 + numberOfTagsBytes;
  }
}
