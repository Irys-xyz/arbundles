import DataItem from './DataItem';
export interface DataItemCreateOptions {
    data?: never;
    target?: string;
    anchor?: string;
    tags?: {
        name: string;
        value: string;
    }[];
}
export declare function getSignatureData(item: DataItem): Promise<Uint8Array>;
