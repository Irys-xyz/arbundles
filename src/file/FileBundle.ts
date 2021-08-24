import { BundleInterface } from '../BundleInterface';
import FileDataItem from './FileDataItem';
import { PathLike } from 'fs';
import * as fs from 'fs';
import { byteArrayToLong } from '../utils';
import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import { pipeline } from 'stream/promises';
import multistreams from 'multistream';
import { createTransactionAsync } from 'arweave-stream';
import { JWKInterface } from '../interface-jwk';
import { promisify } from 'util';
import base64url from 'base64url';

const read = promisify(fs.read);

export default class FileBundle implements BundleInterface {
  private readonly _headerFile: PathLike;
  private readonly _txs: PathLike[];

  constructor(headerFile: PathLike, txs: PathLike[]) {
    this._headerFile = headerFile;
    this._txs = txs;
  }


  get length(): number {
    const fd = fs.openSync(this._headerFile, "r");
    const lengthBuffer = Buffer.allocUnsafe(32);
    fs.readSync(fd, lengthBuffer, 0, 32, 0);
    return byteArrayToLong(lengthBuffer);
  }

  get items(): AsyncGenerator<FileDataItem> {
    return this.itemsGenerator();
  }

  get(index: number | string): Promise<FileDataItem> {
    if (typeof index === "number") {
      if (index > this.length) {
        throw new RangeError("Index out of range");
      }

      return this.getByIndex(index);
    } else {
      return this.getById(index);
    }
  }

  async getIds(): Promise<string[]> {
    const ids = new Array(this.length);
    for await (const { id } of this.getHeaders()) {
      ids.push(id);
    }
    return ids;
  }

  async toTransaction(arweave: Arweave, jwk: JWKInterface): Promise<Transaction> {
    const tx = await pipeline(
      multistreams.obj([
        fs.createReadStream(this._headerFile),
        ...this._txs.map(tx => fs.createReadStream(tx))
      ]),
      createTransactionAsync({}, arweave, jwk));
    tx.addTag("Bundle-Format", "binary");
    tx.addTag("Bundle-Version", "2.0.0");
    return tx;
  }

  public async* getHeaders(): AsyncGenerator<{ offset: number, id: string }> {
    const fd = await fs.promises.open(this._headerFile, "r");
    for (let i = 32; i<(32 + 64*this.length); i+=64) {
      yield {
        offset: byteArrayToLong(await read(fd.fd, Buffer.allocUnsafe(32), 0, 32, i).then(r => r.buffer)),
        id: await read(fd.fd, Buffer.allocUnsafe(32), 0, 32, i).then(r => base64url.encode(r.buffer))
      };
    }
    await fd.close();
  }

  private async* itemsGenerator(): AsyncGenerator<FileDataItem> {
    let counter = 0;
    for await (const { id } of this.getHeaders()) {
      yield new FileDataItem(this._txs[counter], base64url.toBuffer(id));
      counter++;
    }
  }

  private async getById(txId: string): Promise<FileDataItem> {
    let counter = 0;
    for await (const { id } of this.getHeaders()) {
      if (id === txId) return new FileDataItem(this._txs[counter], base64url.toBuffer(id));
      counter++;
    }
    throw new Error("Can't find by id");
  }

  private async getByIndex(index: number): Promise<FileDataItem> {
    let count = 0;

    for await (const { id } of this.getHeaders()) {
      if (count === index) {
        return new FileDataItem(this._txs[count], base64url.toBuffer(id));
      }
      count++;
    }
    throw new Error("Can't find by index")
  }
}
