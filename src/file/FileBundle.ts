import { BundleInterface } from '../BundleInterface';
import FileDataItem from './FileDataItem';
import { PathLike } from 'fs';
import * as fs from 'fs';
import { byteArrayToLong } from '../utils';
import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import MultiStream from 'multistream';
// import { pipeline } from 'stream/promises';
// import { createTransactionAsync } from 'arweave-stream';
import { JWKInterface } from '../interface-jwk';
import { promisify } from 'util';
import base64url from 'base64url';
import { pipeline } from 'stream/promises';

import { createTransactionAsync, uploadTransactionAsync } from 'arweave-stream';
// import { Readable } from 'stream';
// import { createTransactionAsync } from 'arweave-stream';
// import { pipeline } from 'stream/promises';
const read = promisify(fs.read);

export default class FileBundle implements BundleInterface {
  public readonly headerFile: PathLike;
  public readonly txs: PathLike[];

  constructor(headerFile: PathLike, txs: PathLike[]) {
    this.headerFile = headerFile;
    this.txs = txs;
  }

  static async fromDir(dir: string): Promise<FileBundle> {
    const txs = await fs.promises.readdir(dir).then(r => r.filter(async (f) => !await fs.promises.stat(f).then(s => s.isDirectory())));
    return new FileBundle(dir + "/header", txs);
  }

  get length(): number {
    const fd = fs.openSync(this.headerFile, "r");
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
    const streams = [
      fs.createReadStream(this.headerFile),
      ...this.txs.map(t => fs.createReadStream(t))
    ];

    const stream = MultiStream.obj(streams);

    const tx = await pipeline(
      stream,
      createTransactionAsync({}, arweave, jwk)
    );
    tx.addTag("Bundle-Format", "binary");
    tx.addTag("Bundle-Version", "2.0.0");

    await arweave.transactions.sign(tx, jwk);
    return tx;
  }

  async signAndSubmit(arweave: Arweave, jwk: JWKInterface): Promise<Transaction> {
    const streams = [
      fs.createReadStream(this.headerFile),
      ...this.txs.map(t => fs.createReadStream(t))
    ];

    const stream = MultiStream.obj(streams);

    const tx = await pipeline(
      stream,
      createTransactionAsync({}, arweave, jwk)
    );
    tx.addTag("Bundle-Format", "binary");
    tx.addTag("Bundle-Version", "2.0.0");

    await arweave.transactions.sign(tx, jwk);

    const streams2 = [
      fs.createReadStream(this.headerFile),
      ...this.txs.map(t => fs.createReadStream(t))
    ];

    const stream2 = MultiStream.obj(streams2);

    const uploadOp = await pipeline(stream2, uploadTransactionAsync(tx, arweave, true));

    console.log(uploadOp);
    return tx;
  }

  public async* getHeaders(): AsyncGenerator<{ offset: number, id: string }> {
    const fd = await fs.promises.open(this.headerFile, "r");
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
      yield new FileDataItem(this.txs[counter], base64url.toBuffer(id));
      counter++;
    }
  }

  private async getById(txId: string): Promise<FileDataItem> {
    let counter = 0;
    for await (const { id } of this.getHeaders()) {
      if (id === txId) return new FileDataItem(this.txs[counter], base64url.toBuffer(id));
      counter++;
    }
    throw new Error("Can't find by id");
  }

  private async getByIndex(index: number): Promise<FileDataItem> {
    let count = 0;

    for await (const { id } of this.getHeaders()) {
      if (count === index) {
        return new FileDataItem(this.txs[count], base64url.toBuffer(id));
      }
      count++;
    }
    throw new Error("Can't find by index")
  }
}
