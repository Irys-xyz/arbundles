/// <reference types="node" />
declare type DeepHashChunk = Uint8Array | AsyncIterable<Buffer> | DeepHashChunks;
declare type DeepHashChunks = DeepHashChunk[];
export default function deepHash(data: DeepHashChunk): Promise<Uint8Array>;
export declare function hashStream(stream: AsyncIterable<Buffer>): Promise<Buffer>;
export {};
