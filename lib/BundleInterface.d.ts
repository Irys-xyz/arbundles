import { BundleItem } from './BundleItem';
import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import { JWKInterface } from './interface-jwk';
export interface BundleInterface {
    readonly length: number | Promise<number>;
    readonly items: BundleItem[] | AsyncGenerator<BundleItem>;
    get(index: number | string): BundleItem | Promise<BundleItem>;
    getIds(): string[] | Promise<string[]>;
    toTransaction(arweave: Arweave, jwk: JWKInterface): Promise<Transaction>;
}
