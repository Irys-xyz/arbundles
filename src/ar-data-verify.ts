import Bundle from "./Bundle";
import DataItem, { MIN_BINARY_SIZE } from './DataItem';
import { promisify } from 'util';
import * as fs from 'fs';
import { byteArrayToLong } from './utils';
import { tagsParser } from './parser';
import { Buffer } from 'buffer';

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

export async function verifyFile(filename: string): Promise<boolean> {
  const status = await fs.promises.stat(filename);
  if (status.size < MIN_BINARY_SIZE) {
    return false;
  }
  if (status.size < MAX_SINGLE_FILE_SIZE) {
    return DataItem.verify(await fs.promises.readFile(filename));
  }

  const fd = await fs.promises.open(filename, 'r').then(handle => handle.fd);

  let tagsStart = 512 + 512 + 2;

  const targetPresent = await read(fd, Buffer.alloc(1), 1024, 64, null).then(value => value.buffer[0] == 1);
  tagsStart += targetPresent ? 32: 0;
  const anchorPresentByte = (targetPresent ? 1057 : 1025);
  const anchorPresent = await read(fd, Buffer.alloc(1), anchorPresentByte, 64, null).then(value => value.buffer[0] == 1);
  tagsStart += anchorPresent ? 32: 0;

  const numberOfTags = byteArrayToLong(await read(fd, Buffer.alloc(8), tagsStart, 8, 0).then(value => value.buffer));

  if (numberOfTags == 0) {
    return true;
  }
  const numberOfTagBytesArray = await read(fd, Buffer.alloc(8), tagsStart + 8, 8, 0).then(value => value.buffer);
  const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

  try {
    const tagBytes = await read(fd, Buffer.alloc(8), tagsStart + 16, numberOfTagBytes, 0).then(value => value.buffer);
    const tags: { name: string, value:string }[] = tagsParser.fromBuffer(tagBytes);

    if (tags.length !== numberOfTags) {
      return false
    }
  } catch (e) {
    return false;
  }

  return true;
}
