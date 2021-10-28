/// <reference types="node" />
import DataItem from './DataItem';
import Bundle from './Bundle';
import { Buffer } from 'buffer';
import { Signer } from './signing/Signer';
export declare function unbundleData(txData: Buffer): Bundle;
export declare function bundleAndSignData(dataItems: DataItem[], signer: Signer): Promise<Bundle>;
export declare function getSignatureAndId(item: DataItem, signer: Signer): Promise<{
    signature: Buffer;
    id: Buffer;
}>;
export declare function sign(item: DataItem, signer: Signer): Promise<Buffer>;
