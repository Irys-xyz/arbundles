import { DataItemCreateOptions } from "./ar-data-base";
import DataItem from "./DataItem";
import { Signer } from './signing/Signer';
/**
 * This will create a single DataItem in binary format (Uint8Array)
 *
 * @param opts - Options involved in creating data items
 * @param signer
 */
export declare function createData(opts: DataItemCreateOptions, signer: Signer): Promise<DataItem>;
