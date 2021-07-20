"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBundle = void 0;
// import DataItem from "./DataItem";
// import { promisify } from 'util';
// import * as fs from 'fs';
// import { byteArrayToLong } from './utils';
/**
 * Verifies a bundle and all of its DataItems
 *
 * @param bundle
 */
function verifyBundle(bundle) {
    return bundle.verify();
}
exports.verifyBundle = verifyBundle;
// const read = promisify(fs.read);
// const readFile = promisify(fs.readFile);
// const open = promisify(fs.open);
// const stat = promisify(fs.stat);
//
// const MAX_SINGLE_FILE_SIZE = 100 * 1028 * 1028;
// export async function verifyFile(filename: string): Promise<boolean> {
//   const status = await stat(filename);
//   if (status.size < MAX_SINGLE_FILE_SIZE) {
//     return DataItem.verify(await readFile(filename));
//   }
//
//   const fd = await open(filename, 'r');
//
//   let tagsStart = 512 + 512 + 2;
//   // const targetPresent = (buffer[1024] == 1);
//   // tagsStart += targetPresent ? 32: 0;
//   // const anchorPresentByte = (targetPresent ? 1057 : 1025);
//   // const anchorPresent = (buffer[anchorPresentByte] == 1);
//   // tagsStart += anchorPresent ? 32: 0;
//   //
//   // const numberOfTags = byteArrayToLong(buffer.slice(tagsStart, tagsStart + 8));
//   // const numberOfTagBytesArray = buffer.slice(tagsStart + 8, tagsStart + 16);
//   // const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);
//
//
//
//   const targetPresent = await read(fd, Buffer.allocUnsafe(1), 0, 64, null).then(value => value.buffer[0] == 1);
//   tagsStart += targetPresent ? 32: 0;
//   const anchorPresentByte = (targetPresent ? 1057 : 1025);
//   const anchorPresent = (buffer[anchorPresentByte] == 1);
//   tagsStart += anchorPresent ? 32: 0;
//
//   return true;
// }
//# sourceMappingURL=ar-data-verify.js.map