"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_BINARY_SIZE = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const parser_1 = require("./parser");
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const buffer_1 = require("buffer");
const ar_data_bundle_1 = require("./ar-data-bundle");
const index_1 = require("./signing/index");
const ar_data_base_1 = require("./ar-data-base");
const axios_1 = tslib_1.__importDefault(require("axios"));
const constants_1 = require("./constants");
exports.MIN_BINARY_SIZE = 1044;
class DataItem {
    binary;
    _id;
    constructor(binary) {
        this.binary = binary;
    }
    static isDataItem(obj) {
        return obj.binary !== undefined;
    }
    get signatureType() {
        return utils_1.byteArrayToLong(this.binary.subarray(0, 2));
    }
    async isValid() {
        return DataItem.verify(this.binary);
    }
    get id() {
        return base64url_1.default.encode(this.rawId);
    }
    set id(id) {
        this._id = base64url_1.default.toBuffer(id);
    }
    get rawId() {
        if (!this._id) {
            throw new Error("To get the data item id you must sign the item first");
        }
        return this._id;
    }
    set rawId(id) {
        this._id = id;
    }
    get rawSignature() {
        return this.binary.subarray(2, 2 + this.signatureLength);
    }
    get signature() {
        return base64url_1.default.encode(this.rawSignature);
    }
    get signatureLength() {
        const length = constants_1.SIG_CONFIG[this.signatureType].sigLength;
        if (!length)
            throw new Error("Signature type not supported");
        return length;
    }
    get rawOwner() {
        return this.binary.subarray(2 + this.signatureLength, 2 + this.signatureLength + this.ownerLength);
    }
    get owner() {
        return base64url_1.default.encode(this.rawOwner);
    }
    get ownerLength() {
        const length = constants_1.SIG_CONFIG[this.signatureType].pubLength;
        if (!length)
            throw new Error("Signature type not supported");
        return length;
    }
    get rawTarget() {
        const targetStart = this.getTargetStart();
        const isPresent = this.binary[targetStart] == 1;
        return isPresent
            ? this.binary.subarray(targetStart + 1, targetStart + 33)
            : buffer_1.Buffer.alloc(0);
    }
    get target() {
        return base64url_1.default.encode(this.rawTarget);
    }
    get rawAnchor() {
        const anchorStart = this.getAnchorStart();
        const isPresent = this.binary[anchorStart] == 1;
        return isPresent
            ? this.binary.subarray(anchorStart + 1, anchorStart + 33)
            : buffer_1.Buffer.alloc(0);
    }
    get anchor() {
        return this.rawAnchor.toString();
    }
    get rawTags() {
        const tagsStart = this.getTagsStart();
        const tagsSize = utils_1.byteArrayToLong(this.binary.subarray(tagsStart + 8, tagsStart + 16));
        return this.binary.subarray(tagsStart + 16, tagsStart + 16 + tagsSize);
    }
    get tags() {
        const tagsStart = this.getTagsStart();
        const tagsCount = utils_1.byteArrayToLong(this.binary.subarray(tagsStart, tagsStart + 8));
        if (tagsCount == 0) {
            return [];
        }
        const tagsSize = utils_1.byteArrayToLong(this.binary.subarray(tagsStart + 8, tagsStart + 16));
        return parser_1.tagsParser.fromBuffer(buffer_1.Buffer.from(this.binary.subarray(tagsStart + 16, tagsStart + 16 + tagsSize)));
    }
    get tagsB64Url() {
        const _tags = this.tags;
        return _tags.map((t) => ({
            name: base64url_1.default.encode(t.name),
            value: base64url_1.default.encode(t.value),
        }));
    }
    getStartOfData() {
        const tagsStart = this.getTagsStart();
        const numberOfTagBytesArray = this.binary.subarray(tagsStart + 8, tagsStart + 16);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        return tagsStart + 16 + numberOfTagBytes;
    }
    get rawData() {
        const tagsStart = this.getTagsStart();
        const numberOfTagBytesArray = this.binary.subarray(tagsStart + 8, tagsStart + 16);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        const dataStart = tagsStart + 16 + numberOfTagBytes;
        return this.binary.subarray(dataStart, this.binary.length);
    }
    get data() {
        return base64url_1.default.encode(this.rawData);
    }
    getRaw() {
        return this.binary;
    }
    async sign(signer) {
        this._id = await ar_data_bundle_1.sign(this, signer);
        return this.rawId;
    }
    isSigned() {
        return (this._id?.length ?? 0) > 0;
    }
    toJSON() {
        return {
            signature: this.signature,
            owner: this.owner,
            target: this.target,
            tags: this.tags.map((t) => ({
                name: base64url_1.default.encode(t.name),
                value: base64url_1.default.encode(t.value),
            })),
            data: this.data,
        };
    }
    async sendToBundler(bundler) {
        const headers = {
            "Content-Type": "application/octet-stream",
        };
        if (!this.isSigned())
            throw new Error("You must sign before sending to bundler");
        const response = await axios_1.default.post(`${bundler ?? constants_1.BUNDLER}/tx`, this.getRaw(), {
            headers,
            timeout: 100000,
            maxBodyLength: Infinity,
            validateStatus: (status) => (status > 200 && status < 300) || status !== 402
        });
        if (response.status === 402)
            throw new Error("Not enough funds to send data");
        return response;
    }
    static async verify(buffer) {
        if (buffer.length < exports.MIN_BINARY_SIZE) {
            return false;
        }
        const item = new DataItem(buffer);
        const sigType = item.signatureType;
        const tagsStart = item.getTagsStart();
        const numberOfTags = utils_1.byteArrayToLong(buffer.subarray(tagsStart, tagsStart + 8));
        const numberOfTagBytesArray = buffer.subarray(tagsStart + 8, tagsStart + 16);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        if (numberOfTagBytes > 2048)
            return false;
        if (numberOfTags > 0) {
            try {
                const tags = parser_1.tagsParser.fromBuffer(buffer_1.Buffer.from(buffer.subarray(tagsStart + 16, tagsStart + 16 + numberOfTagBytes)));
                if (tags.length !== numberOfTags) {
                    return false;
                }
            }
            catch (e) {
                return false;
            }
        }
        const Signer = index_1.indexToType[sigType];
        const signatureData = await ar_data_base_1.getSignatureData(item);
        return await Signer.verify(item.rawOwner, signatureData, buffer.subarray(2, 2 + item.signatureLength));
    }
    getTagsStart() {
        const targetStart = this.getTargetStart();
        const targetPresent = this.binary[targetStart] == 1;
        let tagsStart = targetStart + (targetPresent ? 33 : 1);
        const anchorPresent = this.binary[tagsStart] == 1;
        tagsStart += anchorPresent ? 33 : 1;
        return tagsStart;
    }
    getTargetStart() {
        return 2 + this.signatureLength + this.ownerLength;
    }
    getAnchorStart() {
        let anchorStart = this.getTargetStart() + 1;
        const targetPresent = this.binary[this.getTargetStart()] == 1;
        anchorStart += targetPresent ? 32 : 0;
        return anchorStart;
    }
}
exports.default = DataItem;
//# sourceMappingURL=DataItem.js.map