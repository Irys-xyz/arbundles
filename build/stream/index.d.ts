/// <reference types="node" />
import { Readable } from "stream";
export declare function verifyAndIndexStream(
  stream: Readable,
): AsyncGenerator<Record<string, any>>;
