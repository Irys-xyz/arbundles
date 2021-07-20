/// <reference types="node" />
import { Buffer } from "buffer";
import DataItem from "./DataItem";
import Transaction from "arweave/node/lib/transaction";
import Arweave from "arweave";
export default class Bundle {
    readonly binary: Buffer;
    constructor(binary: Buffer, verify?: boolean);
    get length(): number;
    getRaw(): Buffer;
    /**
     * Get a DataItem by index (`number`) or by txId (`string`)
     * @param index
     */
    get(index: number | string): DataItem;
    getIds(): string[];
    getIdBy(index: number): string;
    getAll(): DataItem[];
    toTransaction(arweave: Arweave): Promise<Transaction>;
    verify(): boolean;
    private static _verify;
    private getOffset;
    /**
     * UNSAFE! Assumes index < length
     * @param index
     * @private
     */
    private getByIndex;
    private getById;
    private getDataItemCount;
    private getBundleStart;
}
