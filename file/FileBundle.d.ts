/// <reference types="node" />
import { BundleInterface } from "../build/BundleInterface";
import FileDataItem from "./FileDataItem";
import { PathLike } from "fs";
import Arweave from "arweave";
import Transaction from "arweave/node/lib/transaction";
import { JWKInterface } from "../build/interface-jwk";
export default class FileBundle implements BundleInterface {
    readonly headerFile: PathLike;
    readonly txs: PathLike[];
    constructor(headerFile: PathLike, txs: PathLike[]);
    static fromDir(dir: string): Promise<FileBundle>;
    length(): Promise<number>;
    get items(): AsyncGenerator<FileDataItem>;
    get(index: number | string): Promise<FileDataItem>;
    getIds(): Promise<string[]>;
    getRaw(): Promise<Buffer>;
    toTransaction(arweave: Arweave, jwk: JWKInterface): Promise<Transaction>;
    signAndSubmit(arweave: Arweave, jwk: JWKInterface, tags?: {
        name: string;
        value: string;
    }[]): Promise<Transaction>;
    getHeaders(): AsyncGenerator<{
        offset: number;
        id: string;
    }>;
    private itemsGenerator;
    private getById;
    private getByIndex;
}
