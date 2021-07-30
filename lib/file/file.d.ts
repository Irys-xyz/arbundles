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
export {};
