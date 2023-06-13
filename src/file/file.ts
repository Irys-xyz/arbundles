import { createReadStream, promises, read as FSRead } from "fs";
import { promisify } from "util";
import { byteArrayToLong } from "../utils";
import base64url from "base64url";
import type { FileHandle } from "fs/promises";
import type { Signer } from "../signing/index";
import type { DataItemCreateOptions } from "../index";
import { streamSigner } from "../stream/index";
import type { Readable } from "stream";
import type { Tag } from "../tags";
import { deserializeTags } from "../tags";

type File = string | FileHandle;
const read = promisify(FSRead);

interface Transaction {
  id: string;
  owner: string;
  tags: { name: string; value: string }[];
  target: string;
  data_size: number;
  fee: number;
  signature: string;
}

const fileToFd = async (f: File): Promise<FileHandle> => (typeof f === "string" ? await promises.open(f, "r") : f);

export async function fileToJson(filename: string): Promise<Transaction> {
  const handle = await promises.open(filename, "r");
  const fd = handle.fd;

  let tagsStart = 512 + 512 + 2;

  const targetPresent = await read(fd, Buffer.alloc(1), 1024, 64, null).then((value) => value.buffer[0] == 1);
  tagsStart += targetPresent ? 32 : 0;
  const anchorPresentByte = targetPresent ? 1057 : 1025;
  const anchorPresent = await read(fd, Buffer.alloc(1), anchorPresentByte, 64, null).then((value) => value.buffer[0] == 1);
  tagsStart += anchorPresent ? 32 : 0;

  const numberOfTags = byteArrayToLong(await read(fd, Buffer.alloc(8), tagsStart, 8, 0).then((value) => value.buffer));

  let tags: Tag[] = [];
  if (numberOfTags > 0) {
    const numberOfTagBytesArray = await read(fd, Buffer.alloc(8), tagsStart + 8, 8, 0).then((value) => value.buffer);
    const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

    const tagBytes = await read(fd, Buffer.alloc(8), tagsStart + 16, numberOfTagBytes, 0).then((value) => value.buffer);
    tags = deserializeTags(tagBytes);
  }

  const id = filename;
  const owner = "";
  const target = "";
  const data_size = 0;
  const fee = 0;
  const signature = "";

  await handle.close();
  return {
    id,
    owner,
    tags,
    target,
    data_size,
    fee,
    signature,
  };
}

export async function numberOfItems(file: File): Promise<number> {
  const fd = await fileToFd(file);

  const headerBuffer = await read(fd.fd, Buffer.allocUnsafe(32), 0, 32, 0).then((v) => v.buffer);
  await fd.close();
  return byteArrayToLong(headerBuffer);
}

interface DataItemHeader {
  offset: number;
  id: string;
}

export async function getHeaderAt(file: File, index: number): Promise<DataItemHeader> {
  const fd = await fileToFd(file);

  const headerBuffer = await read(fd.fd, Buffer.alloc(64), 0, 64, 32 + 64 * index).then((v) => v.buffer);
  await fd.close();
  return {
    offset: byteArrayToLong(headerBuffer.subarray(0, 32)),
    id: base64url.encode(headerBuffer.subarray(32, 64)),
  };
}

export async function* getHeaders(file: string): AsyncGenerator<DataItemHeader> {
  const count = await numberOfItems(file);
  for (let i = 0; i < count; i++) {
    yield getHeaderAt(file, i);
  }
}

export async function getId(file: File, options?: { offset: number }): Promise<Buffer> {
  const fd = await fileToFd(file);
  const offset = options?.offset ?? 0;

  const buffer = await read(fd.fd, Buffer.allocUnsafe(512), offset, 512, null).then((r) => r.buffer);
  await fd.close();
  return buffer;
}

export async function getSignature(file: File, options?: { offset: number }): Promise<Buffer> {
  const fd = await fileToFd(file);
  const offset = options?.offset ?? 0;

  const buffer = await read(fd.fd, Buffer.allocUnsafe(512), offset, 512, null).then((r) => r.buffer);
  await fd.close();
  return buffer;
}

export async function getOwner(file: File, options?: { offset: number }): Promise<string> {
  const fd = await fileToFd(file);
  const offset = options?.offset ?? 0;

  const buffer = await read(fd.fd, Buffer.allocUnsafe(512), offset + 512, 512, null).then((r) => r.buffer);
  await fd.close();

  return base64url.encode(buffer);
}

export async function getTarget(file: File, options?: { offset: number }): Promise<string | undefined> {
  const fd = await fileToFd(file);
  const offset = options?.offset ?? 0;

  const targetStart = offset + 1024;
  const targetPresent = await read(fd.fd, Buffer.allocUnsafe(1), targetStart, 1, null).then((value) => value.buffer[0] == 1);
  if (!targetPresent) {
    await fd.close();
    return undefined;
  }

  const buffer = await read(fd.fd, Buffer.allocUnsafe(32), targetStart + 1, 32, null).then((r) => r.buffer);
  await fd.close();

  return base64url.encode(buffer);
}

export async function getAnchor(file: File, options?: { offset: number }): Promise<string | undefined> {
  const fd = await fileToFd(file);
  const offset = options?.offset ?? 0;

  const targetPresent = await read(fd.fd, Buffer.allocUnsafe(1), 1024, 1, null).then((value) => value.buffer[0] == 1);

  let anchorStart = offset + 1025;
  if (targetPresent) {
    anchorStart += 32;
  }

  const anchorPresent = await read(fd.fd, Buffer.allocUnsafe(1), anchorStart, 1, null).then((value) => value.buffer[0] == 1);
  if (!anchorPresent) {
    await fd.close();
    return undefined;
  }

  const buffer = await read(fd.fd, Buffer.allocUnsafe(32), anchorStart + 1, 32, null).then((r) => r.buffer);
  await fd.close();

  return base64url.encode(buffer);
}

export async function getTags(file: File, options?: { offset: number }): Promise<{ name: string; value: string }[]> {
  const fd = await fileToFd(file);

  const offset = options?.offset ?? 0;
  let tagsStart = 512 + 512 + 2 + (options?.offset ?? 0);

  const targetPresent = await read(fd.fd, Buffer.allocUnsafe(1), 0, 1, offset + 1024).then((value) => value.buffer[0] == 1);
  tagsStart += targetPresent ? 32 : 0;
  const anchorPresentByte = offset + (targetPresent ? 1057 : 1025);
  const anchorPresent = await read(fd.fd, Buffer.allocUnsafe(1), 0, 1, anchorPresentByte).then((value) => value.buffer[0] == 1);
  tagsStart += anchorPresent ? 32 : 0;

  const numberOfTags = byteArrayToLong(await read(fd.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart).then((value) => value.buffer));

  if (numberOfTags == 0) {
    await fd.close();
    return [];
  }

  const numberOfTagBytesArray = await read(fd.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart + 8).then((value) => value.buffer);
  const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

  const tagBytes = await read(fd.fd, Buffer.allocUnsafe(numberOfTagBytes), 0, numberOfTagBytes, tagsStart + 16).then((value) => value.buffer);
  await fd.close();

  return deserializeTags(tagBytes);
}

export async function signedFileStream(path: string, signer: Signer, opts?: DataItemCreateOptions): Promise<Readable> {
  return streamSigner(createReadStream(path), createReadStream(path), signer, opts);
}

export const fileExportForTesting = {
  fileToFd,
};
