import { DataItemCreateOptions } from "./ar-data-base";
import { JWKPublicInterface } from "./interface-jwk";
import DataItem from "./DataItem";
import Bundle from "./Bundle";
/**
 * Unbundles a transaction into an Array of DataItems.
 *
 * Takes either a json string or object. Will throw if given an invalid json
 * string but otherwise, it will return an empty array if
 *
 * a) the json object is the wrong format
 * b) the object contains no valid DataItems.
 *
 * It will verify all DataItems and discard ones that don't pass verification.
 *
 * @param txData
 */
export declare function unbundleData(txData: Uint8Array): Promise<Bundle>;
/**
 * Verifies all data items and returns a json object with an items array.
 * Throws if any of the data items fail verification.
 *
 * @param dataItems
 * @param jwk
 */
export declare function bundleAndSignData(dataItems: (DataItemCreateOptions | DataItem)[], jwk: JWKPublicInterface): Promise<Bundle>;
/**
 * Signs a single
 * @param item
 * @param jwk
 * @returns signings - signature and id in byte-arrays
 */
export declare function getSignatureAndId(item: DataItem, jwk: JWKPublicInterface): Promise<{
    signature: Uint8Array;
    id: Uint8Array;
}>;
/**
 * Signs and returns item id
 * @param item
 * @param jwk
 */
export declare function sign(item: DataItem, jwk: JWKPublicInterface): Promise<Uint8Array>;
