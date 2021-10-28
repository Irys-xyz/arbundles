import { DataItemCreateOptions } from "./ar-data-base";
import DataItem from "./DataItem";
import { Signer } from './signing';
export declare function createData(data: string | Uint8Array, signer: Signer, opts?: DataItemCreateOptions): DataItem;
