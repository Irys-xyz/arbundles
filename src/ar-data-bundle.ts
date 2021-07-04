import { DataItemCreateOptions, getSignatureData } from "./ar-data-base";
import { createData } from "./ar-data-create";
import { JWKPublicInterface } from "./interface-jwk";
import { longTo32ByteArray } from "./utils";
import DataItem from "./DataItem";
import Arweave from "arweave";
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
export async function unbundleData(
  txData: Uint8Array
): Promise<DataItem[]> {
  return new Bundle(txData).getAll();
}

/**
 * Verifies all data items and returns a json object with an items array.
 * Throws if any of the data items fail verification.
 *
 * @param dataItems
 * @param jwk
 */
export async function bundleAndSignData(dataItems: (DataItemCreateOptions | DataItem)[], jwk: JWKPublicInterface): Promise<Bundle> {
  let headers = new Uint8Array(64 * dataItems.length);

  const binaries = await Promise.all(dataItems.map(async(di, index) => {
    // Create DataItem
    const d = DataItem.isDataItem(di) ? di as DataItem : await createData(di as DataItemCreateOptions, jwk);
    // Sign DataItem
    const id = await sign(d, jwk);
    // Create header array
    const header = new Uint8Array(64);
    // Set offset
    header.set(longTo32ByteArray(d.getRaw().byteLength), 0);
    // Set id
    header.set(id, 32)
    // Add header to array of headers
    headers.set(header, 64 * index);
    // Convert to array for flattening
    return Array.from(d.getRaw());
  })).then(a => Uint8Array.from(a.flat()));

  return new Bundle(Uint8Array.from([...longTo32ByteArray(dataItems.length), ...headers, ...binaries]));
}

/**
 * Signs a single
 * @param item
 * @param jwk
 * @returns signings - signature and id in byte-arrays
 */
export async function getSignatureAndId(item: DataItem, jwk: JWKPublicInterface): Promise<{ signature: Uint8Array, id: Uint8Array }> {
  const signatureData = await getSignatureData(item);
  const signatureBytes = await Arweave.crypto.sign(jwk, signatureData);
  const idBytes = await Arweave.crypto.hash(signatureBytes);

  return { signature: signatureBytes, id: idBytes };
}

/**
 * Signs and returns item id
 * @param item
 * @param jwk
 */
export async function sign(item: DataItem, jwk: JWKPublicInterface): Promise<Uint8Array> {
  const { signature, id } = await getSignatureAndId(item, jwk);
  item.getRaw().set(signature, 0);
  return id;
}
