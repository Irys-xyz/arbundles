/// <reference types="node" />
import DataItem from "./DataItem";
import Transaction from "arweave/node/lib/transaction";
import Arweave from "arweave";
import { BundleInterface } from './BundleInterface';
import { JWKInterface } from './interface-jwk';
export default class Bundle implements BundleInterface {
    readonly binary: Buffer;
    constructor(binary: Buffer);
    get length(): number;
    get items(): DataItem[];
    getRaw(): Buffer;
    get(index: number | string): DataItem;
    getSizes(): number[];
    getIds(): string[];
    getIdBy(index: number): string;
    toTransaction(arweave: Arweave, jwk: JWKInterface): Promise<Transaction>;
    verify(): Promise<boolean>;
    private getOffset;
    private getByIndex;
    private getById;
    private getDataItemCount;
    private getBundleStart;
    private getItems;
}
