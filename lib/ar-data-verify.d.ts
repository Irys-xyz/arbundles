/// <reference types="node" />
import Bundle from "./Bundle";
import DataItem from "./DataItem";
/**
 * Verifies a bundle and all of its DataItems
 *
 * @param bundle
 */
export declare function verifyBundle(bundle: Bundle): boolean;
export declare function verifyData(item: DataItem): Promise<boolean>;
export declare function verifyDataStream(stream: NodeJS.ReadableStream): Promise<boolean>;
