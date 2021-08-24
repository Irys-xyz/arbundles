/// <reference types="node" />
import { Signer } from './signing/Signer';
export interface BundleItem {
    readonly signatureType: number;
    readonly rawSignature: Buffer;
    readonly signature: string;
    readonly rawOwner: Buffer;
    readonly owner: string;
    readonly rawTarget: Buffer;
    readonly target: string;
    readonly rawAnchor: Buffer;
    readonly anchor: string;
    readonly rawTags: Buffer;
    readonly tags: {
        name: string;
        value: string;
    }[];
    readonly rawData: Buffer;
    readonly data: string;
    sign(signer: Signer): Promise<Buffer>;
}
