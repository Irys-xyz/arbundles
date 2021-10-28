/// <reference types="node" />
import { Buffer } from "buffer";
import { BundleItem } from "./BundleItem";
import { Signer } from "./signing/index";
import { AxiosResponse } from "axios";
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
    get signatureLength(): number;
    get rawOwner(): Buffer;
    get owner(): string;
    get ownerLength(): number;
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
    getRaw(): Buffer;
    sign(signer: Signer): Promise<Buffer>;
    isSigned(): boolean;
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
    sendToBundler(bundler?: string): Promise<AxiosResponse>;
    static verify(buffer: Buffer): Promise<boolean>;
    private getTagsStart;
    private getTargetStart;
    private getAnchorStart;
}
