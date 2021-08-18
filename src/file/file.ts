import * as fs from 'fs';
import { promisify } from 'util';
import { byteArrayToLong } from '../utils';
import { tagsParser } from '../parser';
import base64url from 'base64url';

type File = string | number;
const read = promisify(fs.read);

interface Transaction {
  id: string,
  owner: string,
  tags: { name: string, value: string }[],
  target: string,
  data_size: number,
  fee: number,
  signature: string
}

const fileToFd = async (f: File) => typeof f === "number"
  ? f
  : await fs.promises.open(f, 'r').then(handle => handle.fd);

export async function fileToJson(filename: string): Promise<Transaction> {
  const fd = await fs.promises.open(filename, 'r').then(handle => handle.fd);

  let tagsStart = 512 + 512 + 2;

  const targetPresent = await read(fd, Buffer.alloc(1), 1024, 64, null).then(value => value.buffer[0] == 1);
  tagsStart += targetPresent ? 32 : 0;
  const anchorPresentByte = (targetPresent ? 1057 : 1025);
  const anchorPresent = await read(fd, Buffer.alloc(1), anchorPresentByte, 64, null).then(value => value.buffer[0] == 1);
  tagsStart += anchorPresent ? 32 : 0;

  const numberOfTags = byteArrayToLong(await read(fd, Buffer.alloc(8), tagsStart, 8, 0).then(value => value.buffer));

  let tags = [];
  if (numberOfTags > 0) {
    const numberOfTagBytesArray = await read(fd, Buffer.alloc(8), tagsStart + 8, 8, 0).then(value => value.buffer);
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

    const tagBytes = await read(fd, Buffer.alloc(8), tagsStart + 16, numberOfTagBytes, 0).then(value => value.buffer);
    tags = tagsParser.fromBuffer(tagBytes);
  }

  const id = filename;
  const owner = "";
  const target = "";
  const data_size = 0;
  const fee = 0;
  const signature = "";

  return {
    id,
    owner,
    tags,
    target,
    data_size,
    fee,
    signature
  };
}

export async function numberOfItems(file: File): Promise<number> {
  const fd = await fileToFd(file);

  const headerBuffer = await read(fd, Buffer.allocUnsafe(64), 0, 32, null).then(v => v.buffer);
  return byteArrayToLong(headerBuffer);
}

interface DataItemHeader {
  offset: number;
  id: string;
}

export async function getHeaderAt(file: File | number, index: number): Promise<DataItemHeader> {
  const fd = await fileToFd(file);

  const headerBuffer = await read(fd, Buffer.allocUnsafe(64), 32 + (64 * index), 64, null).then(v => v.buffer);
  return {
    offset: byteArrayToLong(headerBuffer.slice(0, 32)),
    id: base64url.encode(headerBuffer.slice(32, 64))
  }
}

export async function* getHeaders(file: File): AsyncGenerator<DataItemHeader> {
  const fd = await fileToFd(file);

  const count =  await numberOfItems(fd);
  for (let i = 0; i<count; i++) {
    yield getHeaderAt(fd, i);
  }
}

export async function getSignature(file: File, options?: { offset: number }): Promise<Buffer> {
  const fd = await fileToFd(file);
  const offset = options.offset ?? 0;

  return await read(fd, Buffer.allocUnsafe(512), offset, 512, null).then(r => r.buffer);
}

export async function getOwner(file: File, options?: { offset: number }): Promise<string> {
  const fd = await fileToFd(file);
  const offset = options.offset ?? 0;

  const buffer = await read(fd, Buffer.allocUnsafe(512), offset + 512, 512, null).then(r => r.buffer);

  return base64url.encode(buffer, "hex");
}

export async function getTarget(file: File, options?: { offset: number }): Promise<string | undefined> {
  const fd = await fileToFd(file);
  const offset = options.offset ?? 0;

  const targetStart = offset + 1024;
  const targetPresent = await read(fd, Buffer.allocUnsafe(1), targetStart, 1, null).then(value => value.buffer[0] == 1);
  if (!targetPresent) {
    return undefined;
  }

  const buffer = await read(fd, Buffer.allocUnsafe(32), targetStart + 1, 32, null).then(r => r.buffer);

  return base64url.encode(buffer, "hex");
}

export async function getAnchor(file: File, options?: { offset: number }): Promise<string | undefined> {
  const fd = await fileToFd(file);
  const offset = options.offset ?? 0;

  const targetPresent = await read(fd, Buffer.allocUnsafe(1), 1024, 1, null).then(value => value.buffer[0] == 1);

  let anchorStart = offset + 1025;
  if (targetPresent) {
    anchorStart += 32;
  }

  const anchorPresent = await read(fd, Buffer.allocUnsafe(1), anchorStart, 1, null).then(value => value.buffer[0] == 1);
  if (!anchorPresent) {
    return undefined;
  }

  const buffer = await read(fd, Buffer.allocUnsafe(32), anchorStart + 1, 32, null).then(r => r.buffer);

  return base64url.encode(buffer, "hex");
}

export async function getTags(filename: string): Promise<{ name: string, value: string }[]> {
  const fd = await fs.promises.open(filename, 'r').then(handle => handle.fd);

  let tagsStart = 512 + 512 + 2;

  const targetPresent = await read(fd, Buffer.alloc(1), 1024, 64, null).then(value => value.buffer[0] == 1);
  tagsStart += targetPresent ? 32 : 0;
  const anchorPresentByte = (targetPresent ? 1057 : 1025);
  const anchorPresent = await read(fd, Buffer.alloc(1), anchorPresentByte, 64, null).then(value => value.buffer[0] == 1);
  tagsStart += anchorPresent ? 32 : 0;

  const numberOfTags = byteArrayToLong(await read(fd, Buffer.alloc(8), tagsStart, 8, 0).then(value => value.buffer));

  if (numberOfTags == 0) {
    return [];
  }

  const numberOfTagBytesArray = await read(fd, Buffer.alloc(8), tagsStart + 8, 8, 0).then(value => value.buffer);
  const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

  const tagBytes = await read(fd, Buffer.alloc(8), tagsStart + 16, numberOfTagBytes, 0).then(value => value.buffer);
  return tagsParser.fromBuffer(tagBytes);
}
