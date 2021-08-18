declare type File = string | number;
export declare function getTags(filename: string): Promise<{
    name: string;
    value: string;
}[]>;
interface Transaction {
    id: string;
    owner: string;
    tags: {
        name: string;
        value: string;
    }[];
    target: string;
    data_size: number;
    fee: number;
    signature: string;
}
export declare function fileToJson(filename: string): Promise<Transaction>;
export declare function numberOfItems(file: File): Promise<number>;
interface DataItemHeader {
    offset: number;
    id: string;
}
export declare function getHeaderAt(file: File | number, index: number): Promise<DataItemHeader>;
export declare function getHeaders(file: File): AsyncGenerator<DataItemHeader>;
export {};
