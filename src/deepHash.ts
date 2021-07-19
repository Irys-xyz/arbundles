// In TypeScript 3.7, could be written as a single type:
// `type DeepHashChunk = Uint8Array | DeepHashChunk[];`
import Arweave from 'arweave';
import * as crypto from 'crypto';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

type DeepHashChunk = Uint8Array | AsyncIterable<Buffer> | DeepHashChunks;
type DeepHashChunks = DeepHashChunk[];

export default async function deepHash(
  data: DeepHashChunk,
): Promise<Uint8Array> {
  if (typeof data[Symbol.asyncIterator as keyof AsyncIterable<Buffer>] === 'function') {
    const _data = data as AsyncIterable<Buffer>;

    const context = crypto.createHash('sha384');

    let length = 0;

    await pipeline(
      Transform.from(_data),
      async function(chunkedSource: AsyncIterable<Buffer>) {
        for await (const chunk of chunkedSource) {
          length += chunk.byteLength;
          context.update(chunk);
        }
      });

    const tag = Arweave.utils.concatBuffers([
      Arweave.utils.stringToBuffer('blob'),
      Arweave.utils.stringToBuffer(length.toString()),
    ]);

    console.log(await hashStream(_data));

    const taggedHash = Arweave.utils.concatBuffers([
      await Arweave.crypto.hash(tag, 'SHA-384'),
      context.digest(),
    ]);

    return await Arweave.crypto.hash(taggedHash, 'SHA-384');
  } else if (Array.isArray(data)) {
    const tag = Arweave.utils.concatBuffers([
      Arweave.utils.stringToBuffer('list'),
      Arweave.utils.stringToBuffer(data.length.toString()),
    ]);

    return await deepHashChunks(
      data,
      await Arweave.crypto.hash(tag, 'SHA-384'),
    );
  }

  const _data = data as Uint8Array;

  const tag = Arweave.utils.concatBuffers([
    Arweave.utils.stringToBuffer('blob'),
    Arweave.utils.stringToBuffer(_data.byteLength.toString()),
  ]);

  console.log(await Arweave.crypto.hash(_data, 'SHA-384'));

  const taggedHash = Arweave.utils.concatBuffers([
    await Arweave.crypto.hash(tag, 'SHA-384'),
    await Arweave.crypto.hash(_data, 'SHA-384'),
  ]);

  return await Arweave.crypto.hash(taggedHash, 'SHA-384');
}

async function deepHashChunks(
  chunks: DeepHashChunks,
  acc: Uint8Array,
): Promise<Uint8Array> {
  if (chunks.length < 1) {
    return acc;
  }

  const hashPair = Arweave.utils.concatBuffers([
    acc,
    await deepHash(chunks[0]),
  ]);
  const newAcc = await Arweave.crypto.hash(hashPair, 'SHA-384');
  return await deepHashChunks(chunks.slice(1), newAcc);
}

export async function hashStream(stream: AsyncIterable<Buffer>): Promise<Buffer> {
  const context = crypto.createHash('sha384');

  await pipeline(
    Transform.from(stream),
    async function(chunkedSource: AsyncIterable<Buffer>) {
      for await (const chunk of chunkedSource) {
        console.log(chunk);
        context.update(chunk);
      }
    });

  return context.digest();
}
