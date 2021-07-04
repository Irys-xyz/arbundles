import DataItem from "./DataItem";
import Transaction from "arweave/node/lib/transaction";
import Arweave from "arweave";
export default class Bundle {
    readonly binary: Uint8Array;
    constructor(binary: Uint8Array);
    get length(): number;
    /**
     * Get a DataItem by index (`number`) or by txId (`string`)
     * @param index
     */
    get(index: number | string): DataItem;
    getAll(): DataItem[];
    toTransaction(arweave: Arweave): Promise<Transaction>;
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
