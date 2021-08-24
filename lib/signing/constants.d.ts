/// <reference types="node" />
import { Signer } from './Signer';
interface IndexToType {
    [key: number]: {
        new (...args: any[]): Signer;
        verify(pk: string | Buffer, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
    };
}
export declare const indexToType: IndexToType;
export {};
