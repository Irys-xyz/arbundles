/// <reference types="node" />
import { DataItemCreateOptions } from "./ar-data-base";
import { JWKPublicInterface } from "./interface-jwk";
import DataItem from "./DataItem";
/**
 * This will create a single DataItem in binary format (Uint8Array)
 *
 * @param opts - Options involved in creating data items
 * @param jwk - User's jwk
 * @param encoding - encoding for raw data
 */
export declare function createData(opts: DataItemCreateOptions, jwk: JWKPublicInterface, encoding?: BufferEncoding): Promise<DataItem>;
