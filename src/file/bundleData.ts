import { DataItemCreateOptions } from '../ar-data-base';
import { file } from 'tmp-promise';
import * as fs from 'fs';
import { createData } from './createData';
import { longTo32ByteArray } from '../utils';
import { Signer } from '../signing';
import FileBundle from './FileBundle';
import { performance } from 'perf_hooks';

export async function bundleAndSignData(
  dataItems: DataItemCreateOptions[],
  signer: Signer,
): Promise<FileBundle> {
  const headerFile = await file();
  const headerStream = fs.createWriteStream(headerFile.path);
  const files = new Array(dataItems.length);

  let now = performance.now();
  let count = 1;
  headerStream.write(longTo32ByteArray(dataItems.length));
  for (const [index, item] of dataItems.entries()) {
    if (count % 1000 === 0) {
      const now2 = performance.now();
      console.log(`${count} - ${now2 - now}ms`);
      now = now2;
    }
    const dataItem = await createData(item, signer);
    const id = await dataItem.sign(signer);
    files[index] = dataItem.filename;
    headerStream.write(Buffer.concat([longTo32ByteArray(dataItem.size), id]));
    count++;
  }

  await new Promise(resolve => headerStream.end(resolve));

  return new FileBundle(headerFile.path, files);
}
