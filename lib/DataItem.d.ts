/// <reference types="node" />
import { Buffer } from 'buffer';
import { BundleItem } from './BundleItem';
import { Signer } from './signing';
export declare const MIN_BINARY_SIZE = 1044;
export default class DataItem implements BundleItem {
    private readonly binary;
    private _id;
    constructor(binary: Buffer);
    static isDataItem(obj: any): boolean;
    get signatureType(): number;
    isValid(): Promise<boolean>;
    get id(): string;
    set id(id: string);
    get rawId(): Buffer;
    set rawId(id: Buffer);
    get rawSignature(): Buffer;
    get signature(): string;
    get rawOwner(): Buffer;
    get owner(): string;
    get rawTarget(): Buffer;
    get target(): string;
    get rawAnchor(): Buffer;
    get anchor(): string;
    get rawTags(): Buffer;
    get tags(): {
        name: string;
        value: string;
    }[];
    get tagsB64Url(): {
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
    sign(signer: Signer): Promise<Buffer>;
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
        pk: string | Buffer;
    }): Promise<boolean>;
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
