/// <reference types="node" />
import { Buffer } from 'buffer';
import { JWKPublicInterface } from './interface-jwk';
export declare const MIN_BINARY_SIZE = 1042;
export default class DataItem {
    private readonly binary;
    private _id;
    constructor(binary: Buffer);
    static isDataItem(obj: any): boolean;
    isValid(): boolean;
    get id(): string;
    set id(id: string);
    get rawId(): Buffer;
    set rawId(id: Buffer);
    get rawSignature(): Buffer;
    get signature(): string;
    get rawOwner(): Buffer;
    get owner(): string;
    getAddress(): Promise<string>;
    get rawTarget(): Buffer;
    get target(): string;
    get rawAnchor(): Buffer;
    get anchor(): string;
    get rawTags(): Buffer;
    get tags(): {
        name: string;
        value: string;
    }[];
    getStartOfData(): number;
    get rawData(): Buffer;
    get data(): string;
    /**
     * UNSAFE!!
     * DO NOT MUTATE THE BINARY ARRAY. THIS WILL CAUSE UNDEFINED BEHAVIOUR.
     */
    getRaw(): Buffer;
    sign(jwk: JWKPublicInterface): Promise<Buffer>;
    isSigned(): boolean;
    /**
     * Returns a JSON representation of a DataItem
     */
    toJSON(): {
        owner: string;
        data: string;
        signature: string;
        target: string;
        tags: {
            name: string;
            value: string;
        }[];
    };
    /**
     * Verifies a `Buffer` and checks it fits the format of a DataItem
     *
     * A binary is valid iff:
     * - the tags are encoded correctly
     */
    static verify(buffer: Buffer, extras?: {
        id: Uint8Array;
        jwk: JWKPublicInterface;
    }): boolean;
    /**
     * Returns the start byte of the tags section (number of tags)
     *
     * @private
     */
    private getTagsStart;
    /**
     * Returns the start byte of the tags section (number of tags)
     *
     * @private
     */
    private getTargetStart;
    /**
     * Returns the start byte of the tags section (number of tags)
     *
     * @private
     */
    private getAnchorStart;
}
