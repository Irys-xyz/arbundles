"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = exports.getSignatureAndId = exports.bundleAndSignData = exports.unbundleData = void 0;
const tslib_1 = require("tslib");
const ar_data_base_1 = require("./ar-data-base");
const ar_data_create_1 = require("./ar-data-create");
const utils_1 = require("./utils");
const DataItem_1 = tslib_1.__importDefault(require("./DataItem"));
const arweave_1 = tslib_1.__importDefault(require("arweave"));
const Bundle_1 = tslib_1.__importDefault(require("./Bundle"));
const buffer_1 = require("buffer");
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
function unbundleData(txData) {
    return new Bundle_1.default(txData);
}
exports.unbundleData = unbundleData;
/**
 * Verifies all data items and returns a json object with an items array.
 * Throws if any of the data items fail verification.
 *
 * @param dataItems
 * @param jwk
 */
async function bundleAndSignData(dataItems, signer) {
    const headers = new Uint8Array(64 * dataItems.length);
    const binaries = await Promise.all(dataItems.map(async (di, index) => {
        // Create DataItem
        const d = DataItem_1.default.isDataItem(di) ? di : await ar_data_create_1.createData(di, signer);
        // Sign DataItem
        const id = d.isSigned() ? d.rawId : await sign(d, signer);
        // Create header array
        const header = new Uint8Array(64);
        // Set offset
        header.set(utils_1.longTo32ByteArray(d.getRaw().byteLength), 0);
        // Set id
        header.set(id, 32);
        // Add header to array of headers
        headers.set(header, 64 * index);
        // Convert to array for flattening
        const raw = d.getRaw();
        return Array.from(raw);
    })).then(a => {
        return a.flat();
    });
    const buffer = buffer_1.Buffer.from([...utils_1.longTo32ByteArray(dataItems.length), ...headers, ...binaries]);
    return new Bundle_1.default(buffer);
}
exports.bundleAndSignData = bundleAndSignData;
/**
 * Signs a single
 *
 * @param item
 * @param signer
 * @returns signings - signature and id in byte-arrays
 */
async function getSignatureAndId(item, signer) {
    const signatureData = await ar_data_base_1.getSignatureData(item);
    const signatureBytes = await signer.sign(signatureData);
    const idBytes = await arweave_1.default.crypto.hash(signatureBytes);
    return { signature: buffer_1.Buffer.from(signatureBytes), id: buffer_1.Buffer.from(idBytes) };
}
exports.getSignatureAndId = getSignatureAndId;
/**
 * Signs and returns item id
 *
 * @param item
 * @param jwk
 */
async function sign(item, signer) {
    const { signature, id } = await getSignatureAndId(item, signer);
    item.getRaw().set(signature, 2);
    return id;
}
exports.sign = sign;
//# sourceMappingURL=ar-data-bundle.js.map