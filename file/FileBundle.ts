import { BundleInterface } from "../src/BundleInterface";
import FileDataItem from "./FileDataItem";
import { PathLike } from "fs";
import * as fs from "fs";
import { byteArrayToLong } from "../src/utils";
import Arweave from "arweave";
import Transaction from "arweave/node/lib/transaction";
import MultiStream from "multistream";
// import { pipeline } from 'stream/promises';
// import { createTransactionAsync } from 'arweave-stream';
import { JWKInterface } from "../src/interface-jwk";

import base64url from "base64url";
import { pipeline } from "stream/promises";

import {
  createTransactionAsync,
  uploadTransactionAsync,
} from "arweave-stream-tx";
import { CreateTransactionInterface } from "arweave/node/common";
// import { Readable } from 'stream';
// import { createTransactionAsync } from 'arweave-stream';
// import { pipeline } from 'stream/promises';

import { read } from "./file";

export default class FileBundle implements BundleInterface {
  public readonly headerFile: PathLike;
  public readonly txs: PathLike[];

  constructor(headerFile: PathLike, txs: PathLike[]) {
    this.headerFile = headerFile;
    this.txs = txs;
  }

  static async fromDir(dir: string): Promise<FileBundle> {
    const txs = await fs.promises
      .readdir(dir)
      .then((r) =>
        r.filter(
          async (f) =>
            !(await fs.promises.stat(f).then((s) => s.isDirectory())),
        ),
      );
    return new FileBundle(dir + "/header", txs);
  }

  async length(): Promise<number> {
    const handle = await fs.promises.open(this.headerFile, "r");
    const lengthBuffer = await read(
      handle.fd,
      Buffer.allocUnsafe(32),
      0,
      32,
      0,
    ).then((r) => r.buffer);
    await handle.close();
    return byteArrayToLong(lengthBuffer);
  }

  get items(): AsyncGenerator<FileDataItem> {
    return this.itemsGenerator();
  }

  async get(index: number | string): Promise<FileDataItem> {
    if (typeof index === "number") {
      if (index > (await this.length())) {
        throw new RangeError("Index out of range");
      }

      return this.getByIndex(index);
    } else {
      return this.getById(index);
    }
  }

  async getIds(): Promise<string[]> {
    const ids = new Array(await this.length());
    let count = 0;
    for await (const { id } of this.getHeaders()) {
      ids[count] = id;
      count++;
    }
    return ids;
  }

  async getRaw(): Promise<Buffer> {
    const streams = [
      fs.createReadStream(this.headerFile),
      ...this.txs.map((t) => fs.createReadStream(t)),
    ];

    const stream = MultiStream.obj(streams);

    let buff = Buffer.allocUnsafe(0);

    for await (const chunk of stream) {
      buff = Buffer.concat([buff, Buffer.from(chunk)]);
    }

    return buff;
  }

  async toTransaction(
    attributes: Partial<Omit<CreateTransactionInterface, "data">>,
    arweave: Arweave,
    jwk: JWKInterface,
  ): Promise<Transaction> {
    const streams = [
      fs.createReadStream(this.headerFile),
      ...this.txs.map((t) => fs.createReadStream(t)),
    ];

    const stream = MultiStream.obj(streams);

    const tx = await pipeline(
      stream,
      createTransactionAsync(attributes, arweave, jwk),
    );
    tx.addTag("Bundle-Format", "binary");
    tx.addTag("Bundle-Version", "2.0.0");

    return tx;
  }

  async signAndSubmit(
    arweave: Arweave,
    jwk: JWKInterface,
    tags: { name: string; value: string }[] = [],
  ): Promise<Transaction> {
    const tx = await this.toTransaction({}, arweave, jwk);
    tx.addTag("Bundle-Format", "binary");
    tx.addTag("Bundle-Version", "2.0.0");
    for (const { name, value } of tags) {
      tx.addTag(name, value);
    }

    await arweave.transactions.sign(tx, jwk);

    const streams2 = [
      fs.createReadStream(this.headerFile),
      ...this.txs.map((t) => fs.createReadStream(t)),
    ];

    const stream2 = MultiStream.obj(streams2);

    await pipeline(stream2, uploadTransactionAsync(tx, arweave, true));

    return tx;
  }

  public async *getHeaders(): AsyncGenerator<{ offset: number; id: string }> {
    const handle = await fs.promises.open(this.headerFile, "r");
    for (let i = 32; i < 32 + 64 * (await this.length()); i += 64) {
      yield {
        offset: byteArrayToLong(
          await read(handle.fd, Buffer.allocUnsafe(32), 0, 32, i).then(
            (r) => r.buffer,
          ),
        ),
        id: await read(handle.fd, Buffer.allocUnsafe(32), 0, 32, i + 32).then(
          (r) => base64url.encode(r.buffer),
        ),
      };
    }
    await handle.close();
  }

  private async *itemsGenerator(): AsyncGenerator<FileDataItem> {
    let counter = 0;
    for await (const { id } of this.getHeaders()) {
      yield new FileDataItem(this.txs[counter], base64url.toBuffer(id));
      counter++;
    }
  }

  private async getById(txId: string): Promise<FileDataItem> {
    let counter = 0;
    for await (const { id } of this.getHeaders()) {
      if (id === txId)
        return new FileDataItem(this.txs[counter], base64url.toBuffer(id));
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
    throw new Error("Can't find by index");
  }
}
