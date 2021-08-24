import { DataItemCreateOptions } from '../ar-data-base';
import { file } from 'tmp-promise';
import * as fs from 'fs';
import { createData } from './createData';
import { longTo32ByteArray } from '../utils';
import { Signer } from '../signing';
import FileBundle from './FileBundle';

export async function bundleAndSignData(
  dataItems: DataItemCreateOptions[],
  signer: Signer,
): Promise<FileBundle> {
  const headerFile = await file();
  const headerStream = fs.createWriteStream(headerFile.path);
  const files = new Array(dataItems.length);

  headerStream.write(longTo32ByteArray(dataItems.length));
  for (const [index, item] of dataItems.entries()) {
    const dataItem = await createData(item, signer);
    const id = await dataItem.sign(signer);
    files[index] = dataItem.filename;
    headerStream.write(Buffer.concat([longTo32ByteArray(dataItem.size), id]))
  }

  await new Promise(resolve => headerStream.end(resolve));

  return new FileBundle(headerFile.path, files);
}
