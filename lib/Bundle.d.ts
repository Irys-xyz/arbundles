/// <reference types="node" />
import DataItem from "./DataItem";
import Transaction from "arweave/node/lib/transaction";
import Arweave from "arweave";
import { BundleInterface } from './BundleInterface';
import { JWKInterface } from './interface-jwk';
export default class Bundle implements BundleInterface {
    readonly binary: Buffer;
    constructor(binary: Buffer, verify?: boolean);
    get length(): number;
    get items(): DataItem[];
    getRaw(): Buffer;
    /**
     * Get a DataItem by index (`number`) or by txId (`string`)
     * @param index
     */
    get(index: number | string): DataItem;
    getIds(): string[];
    getIdBy(index: number): string;
    toTransaction(arweave: Arweave, jwk: JWKInterface): Promise<Transaction>;
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
