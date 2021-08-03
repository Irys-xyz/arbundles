import Bundle from './Bundle';
import DataItem, { MIN_BINARY_SIZE } from './DataItem';
import { promisify } from 'util';
import * as fs from 'fs';
import { byteArrayToLong } from './utils';
import { tagsParser } from './parser';
import { Buffer } from 'buffer';
import Arweave from 'arweave';
import deepHash from './deepHash';
import { stringToBuffer } from 'arweave/web/lib/utils';

/**
 * Verifies a bundle and all of its DataItems
 *
 * @param bundle
 */
export function verifyBundle(bundle: Bundle): boolean {
  return bundle.verify();
}

const MAX_SINGLE_FILE_SIZE = 100 * 1028 * 1028;

const read = promisify(fs.read);

export async function verifyDataItemInFile(filename: string, signatureVerification?: { n: string, signature: Uint8Array }): Promise<boolean> {
  const status = await fs.promises.stat(filename);
  if (status.size < MIN_BINARY_SIZE) {
    return false;
  }
  if (status.size < MAX_SINGLE_FILE_SIZE) {
    return DataItem.verify(await fs.promises.readFile(filename));
  }

  const fd = await fs.promises.open(filename, 'r').then(handle => handle.fd);

  let tagsStart = 512 + 512 + 2;

  const targetPresent = await read(fd, Buffer.alloc(1), 1024, 1, null).then(value => value.buffer[0] == 1);
  tagsStart += targetPresent ? 32 : 0;
  const anchorPresentByte = (targetPresent ? 1057 : 1025);
  const anchorPresent = await read(fd, Buffer.alloc(1), anchorPresentByte, 1, null).then(value => value.buffer[0] == 1);
  tagsStart += anchorPresent ? 32 : 0;

  const numberOfTags = byteArrayToLong(await read(fd, Buffer.alloc(8), tagsStart, 8, null).then(value => value.buffer));

  if (numberOfTags == 0) {
    return true;
  }
  const numberOfTagBytesArray = await read(fd, Buffer.alloc(8), tagsStart + 8, 8, null).then(value => value.buffer);
  const numberOfTagsBytes = byteArrayToLong(numberOfTagBytesArray);
  const tagBytes = await read(fd, Buffer.alloc(8), tagsStart + 16, numberOfTagsBytes, null).then(value => value.buffer);
  try {

    const tags: { name: string, value: string }[] = tagsParser.fromBuffer(tagBytes);

    if (tags.length !== numberOfTags) {
      return false;
    }
  } catch (e) {
    return false;
  }

  const owner = await read(fd, Buffer.alloc(512), 512, 1024, null).then(value => Uint8Array.from(value.buffer));
  const target = targetPresent ? await read(fd, Buffer.alloc(32), 1025, 1025 + 32, null).then(value => Uint8Array.from(value.buffer)) : Buffer.alloc(0);
  const anchor = anchorPresent ? await read(fd, Buffer.alloc(32), anchorPresentByte + 1, anchorPresentByte + 33, null).then(value => Uint8Array.from(value.buffer)) : Buffer.alloc(0);
  const tags = tagBytes;
  const data = await read(fd, Buffer.alloc(512), tagsStart + 16 + numberOfTagsBytes, status.size - tagsStart + 16 + numberOfTagsBytes, null).then(value => Uint8Array.from(value.buffer));

  console.log(data.length);

  if (signatureVerification) {
    const { n, signature } = signatureVerification;
    const signatureData = await deepHash([
      stringToBuffer('dataitem'),
      stringToBuffer('1'),
      owner,
      target,
      anchor,
      tags,
      data,
    ]);
    return await Arweave.crypto.verify(n, signatureData, signature);
  }


  return true;
}
