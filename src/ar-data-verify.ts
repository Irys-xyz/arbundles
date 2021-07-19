import Bundle from "./Bundle";
import DataItem from "./DataItem";
import { promisify } from 'util';
import * as fs from 'fs';

/**
 * Verifies a bundle and all of its DataItems
 *
 * @param bundle
 */
export function verifyBundle(bundle: Bundle): boolean {
  return bundle.verify();
}

const read = promisify(fs.read);
const readFile = promisify(fs.readFile);
const open = promisify(fs.open);
const stat = promisify(fs.stat);

const MAX_SINGLE_FILE_SIZE = 100 * 1028 * 1028;

export async function verifyFile(filename: string): Promise<boolean> {
  const status = await stat(filename);
  if (status.size < MAX_SINGLE_FILE_SIZE) {
    return DataItem.verify(await readFile(filename));
  }

  const fd = await open(filename, 'r');
  const first = await read(fd, Buffer.alloc(64), 0, 64, null);
  first.buffer;

  return true;
}
