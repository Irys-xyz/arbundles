declare module "ans104/file" {
  type File = string | number;
  export function getTags(filename: string): Promise<{
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
  export function fileToJson(filename: string): Promise<Transaction>;
  export function numberOfItems(file: File): Promise<number>;
  interface DataItemHeader {
    offset: number;
    id: string;
  }
  export function getHeaderAt(file: File | number, index: number): Promise<DataItemHeader>;
  export function getHeaders(file: File): AsyncGenerator<DataItemHeader>;
  export {};

}

declare module 'ans104/file' {
  export * from 'ans104/file';
}
