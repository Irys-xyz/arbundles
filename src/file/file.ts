import * as fs from 'fs';
import { promisify } from 'util';
import { Buffer } from 'buffer';
import { byteArrayToLong } from '../utils';
import { tagsParser } from '../parser';

const read = promisify(fs.read);

export async function getTags(filename: string): Promise<{ name: string, value: string }[]> {
  const fd = await fs.promises.open(filename, 'r').then(handle => handle.fd);

  let tagsStart = 512 + 512 + 2;

  const targetPresent = await read(fd, Buffer.alloc(1), 1024, 64, null).then(value => value.buffer[0] == 1);
  tagsStart += targetPresent ? 32: 0;
  const anchorPresentByte = (targetPresent ? 1057 : 1025);
  const anchorPresent = await read(fd, Buffer.alloc(1), anchorPresentByte, 64, null).then(value => value.buffer[0] == 1);
  tagsStart += anchorPresent ? 32: 0;

  const numberOfTags = byteArrayToLong(await read(fd, Buffer.alloc(8), tagsStart, 8, 0).then(value => value.buffer));

  if (numberOfTags == 0) {
    return [];
  }

  const numberOfTagBytesArray = await read(fd, Buffer.alloc(8), tagsStart + 8, 8, 0).then(value => value.buffer);
  const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);

  const tagBytes = await read(fd, Buffer.alloc(8), tagsStart + 16, numberOfTagBytes, 0).then(value => value.buffer);
  return tagsParser.fromBuffer(tagBytes);
}
