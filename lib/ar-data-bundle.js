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
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Bundle_1.default(txData);
    });
}
exports.unbundleData = unbundleData;
/**
 * Verifies all data items and returns a json object with an items array.
 * Throws if any of the data items fail verification.
 *
 * @param dataItems
 * @param jwk
 */
function bundleAndSignData(dataItems, jwk) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const headers = new Uint8Array(64 * dataItems.length);
        const binaries = yield Promise.all(dataItems.map((di, index) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Create DataItem
            const d = DataItem_1.default.isDataItem(di) ? di : yield ar_data_create_1.createData(di, jwk);
            // Sign DataItem
            const id = d.isSigned() ? d.getRawId() : yield sign(d, jwk);
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
        }))).then(a => {
            return a.flat();
        });
        const buffer = buffer_1.Buffer.from([...utils_1.longTo32ByteArray(dataItems.length), ...headers, ...binaries]);
        return new Bundle_1.default(buffer);
    });
}
exports.bundleAndSignData = bundleAndSignData;
/**
 * Signs a single
 *
 * @param item
 * @param jwk
 * @returns signings - signature and id in byte-arrays
 */
function getSignatureAndId(item, jwk) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const signatureData = yield ar_data_base_1.getSignatureData(item);
        const signatureBytes = yield arweave_1.default.crypto.sign(jwk, signatureData);
        const idBytes = yield arweave_1.default.crypto.hash(signatureBytes);
        return { signature: buffer_1.Buffer.from(signatureBytes), id: buffer_1.Buffer.from(idBytes) };
    });
}
exports.getSignatureAndId = getSignatureAndId;
/**
 * Signs and returns item id
 *
 * @param item
 * @param jwk
 */
function sign(item, jwk) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { signature, id } = yield getSignatureAndId(item, jwk);
        item.getRaw().set(signature, 0);
        return id;
    });
}
exports.sign = sign;
//# sourceMappingURL=ar-data-bundle.js.map