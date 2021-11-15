"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = exports.getSignatureAndId = exports.bundleAndSignData = exports.unbundleData = void 0;
const tslib_1 = require("tslib");
const ar_data_base_1 = require("./ar-data-base");
const utils_1 = require("./utils");
const arweave_1 = tslib_1.__importDefault(require("arweave"));
const Bundle_1 = tslib_1.__importDefault(require("./Bundle"));
const buffer_1 = require("buffer");
function unbundleData(txData) {
    return new Bundle_1.default(txData);
}
exports.unbundleData = unbundleData;
async function bundleAndSignData(dataItems, signer) {
    const headers = new Uint8Array(64 * dataItems.length);
    const binaries = await Promise.all(dataItems.map(async (d, index) => {
        const id = d.isSigned() ? d.rawId : await sign(d, signer);
        const header = new Uint8Array(64);
        header.set(utils_1.longTo32ByteArray(d.getRaw().byteLength), 0);
        header.set(id, 32);
        headers.set(header, 64 * index);
        return d.getRaw();
    })).then((a) => {
        return a.reduce((previousValue, currentValue) => {
            return buffer_1.Buffer.concat([previousValue, currentValue]);
        }, buffer_1.Buffer.allocUnsafe(0));
    });
    const buffer = buffer_1.Buffer.from([
        ...utils_1.longTo32ByteArray(dataItems.length),
        ...headers,
        ...binaries,
    ]);
    return new Bundle_1.default(buffer);
}
exports.bundleAndSignData = bundleAndSignData;
async function getSignatureAndId(item, signer) {
    const signatureData = await ar_data_base_1.getSignatureData(item);
    const signatureBytes = await signer.sign(signatureData);
    const idBytes = await arweave_1.default.crypto.hash(signatureBytes);
    return { signature: buffer_1.Buffer.from(signatureBytes), id: buffer_1.Buffer.from(idBytes) };
}
exports.getSignatureAndId = getSignatureAndId;
async function sign(item, signer) {
    const { signature, id } = await getSignatureAndId(item, signer);
    item.getRaw().set(signature, 2);
    return id;
}
exports.sign = sign;
//# sourceMappingURL=ar-data-bundle.js.map