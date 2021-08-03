import Bundle from './Bundle';
/**
 * Verifies a bundle and all of its DataItems
 *
 * @param bundle
 */
export declare function verifyBundle(bundle: Bundle): boolean;
export declare function verifyDataItemInFile(filename: string, signatureVerification?: {
    n: string;
    signature: Uint8Array;
}): Promise<boolean>;
