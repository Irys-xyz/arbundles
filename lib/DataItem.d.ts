import { JWKPublicInterface } from "./interface-jwk";
export default class DataItem {
    private readonly binary;
    private id;
    constructor(binary: Uint8Array);
    static isDataItem(obj: any): boolean;
    isValid(): boolean;
    getRawId(): Uint8Array;
    getId(): string;
    getRawOwner(): Uint8Array;
    getOwner(): string;
    getAddress(): Promise<string>;
    getRawTarget(): Uint8Array;
    getTarget(): Uint8Array;
    getRawAnchor(): Uint8Array;
    getAnchor(): Uint8Array;
    getRawTags(): Uint8Array;
    getTags(): {
        name: string;
        value: string;
    }[];
    getData(): Uint8Array;
    /**
     * UNSAFE!!
     * DO NOT MUTATE THE BINARY ARRAY. THIS WILL CAUSE UNDEFINED BEHAVIOUR.
     */
    getRaw(): Uint8Array;
    sign(jwk: JWKPublicInterface): Promise<string>;
    isSigned(): boolean;
    /**
     * Verifies a `Buffer` and checks it fits the format of a DataItem
     *
     * A binary is valid iff:
     * - the tags are encoded correctly
     */
    static verify(buffer: Uint8Array, extras?: {
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
