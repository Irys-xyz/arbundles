/// <reference types="node" />
import { Buffer } from "buffer";
import { JWKPublicInterface } from "./interface-jwk";
import Arweave from "arweave";
import Transaction from 'arweave/node/lib/transaction';
export default class DataItem {
    private readonly binary;
    private id;
    constructor(binary: Buffer);
    static isDataItem(obj: any): boolean;
    isValid(): boolean;
    getRawId(): Buffer;
    getId(): string;
    getRawOwner(): Buffer;
    getOwner(): string;
    getAddress(): Promise<string>;
    getRawTarget(): Buffer;
    getTarget(): string;
    getRawAnchor(): Buffer;
    getAnchor(): string;
    getRawTags(): Buffer;
    getTags(): {
        name: string;
        value: string;
    }[];
    getData(): Buffer;
    /**
     * UNSAFE!!
     * DO NOT MUTATE THE BINARY ARRAY. THIS WILL CAUSE UNDEFINED BEHAVIOUR.
     */
    getRaw(): Uint8Array;
    sign(jwk: JWKPublicInterface): Promise<Buffer>;
    isSigned(): boolean;
    toTransaction(arweave: Arweave): Promise<Transaction>;
    /**
     * Verifies a `Buffer` and checks it fits the format of a DataItem
     *
     * A binary is valid iff:
     * - the tags are encoded correctly
     */
    static verify(_: Buffer, __?: {
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
