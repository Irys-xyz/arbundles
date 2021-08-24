"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_BINARY_SIZE = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const parser_1 = require("./parser");
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const buffer_1 = require("buffer");
const ar_data_bundle_1 = require("./ar-data-bundle");
const signing_1 = require("./signing");
const ar_data_base_1 = require("./ar-data-base");
exports.MIN_BINARY_SIZE = 1044;
class DataItem {
    binary;
    _id;
    constructor(binary) {
        this.binary = binary;
    }
    ;
    static isDataItem(obj) {
        return obj.binary !== undefined;
    }
    get signatureType() {
        return utils_1.byteArrayToLong(this.binary.slice(0, 2));
    }
    async isValid() {
        return DataItem.verify(this.binary);
    }
    get id() {
        return base64url_1.default.encode(this._id);
    }
    set id(id) {
        this._id = base64url_1.default.toBuffer(id);
    }
    get rawId() {
        return this._id;
    }
    set rawId(id) {
        this._id = id;
    }
    get rawSignature() {
        return this.binary.slice(0, 512);
    }
    get signature() {
        return base64url_1.default.encode(this.rawSignature);
    }
    get rawOwner() {
        return this.binary.slice(514, 514 + 512);
    }
    get owner() {
        return base64url_1.default.encode(this.rawOwner);
    }
    get rawTarget() {
        const targetStart = this.getTargetStart();
        const isPresent = this.binary[targetStart] == 1;
        return isPresent ? this.binary.slice(targetStart + 1, targetStart + 33) : buffer_1.Buffer.alloc(0);
    }
    get target() {
        return base64url_1.default.encode(this.rawTarget);
    }
    get rawAnchor() {
        const anchorStart = this.getAnchorStart();
        const isPresent = this.binary[anchorStart] == 1;
        return isPresent ? this.binary.slice(anchorStart + 1, anchorStart + 33) : buffer_1.Buffer.alloc(0);
    }
    get anchor() {
        return this.rawAnchor.toString();
    }
    get rawTags() {
        const tagsStart = this.getTagsStart();
        const tagsSize = utils_1.byteArrayToLong(this.binary.slice(tagsStart + 8, tagsStart + 16));
        return this.binary.slice(tagsStart + 16, tagsStart + 16 + tagsSize);
    }
    get tags() {
        const tagsStart = this.getTagsStart();
        const tagsCount = utils_1.byteArrayToLong(this.binary.slice(tagsStart, tagsStart + 8));
        if (tagsCount == 0) {
            return [];
        }
        const tagsSize = utils_1.byteArrayToLong(this.binary.slice(tagsStart + 8, tagsStart + 16));
        return parser_1.tagsParser.fromBuffer(buffer_1.Buffer.from(this.binary.slice(tagsStart + 16, tagsStart + 16 + tagsSize)));
    }
    get tagsB64Url() {
        const _tags = this.tags;
        return _tags.map(t => ({ name: base64url_1.default.encode(t.name), value: base64url_1.default.encode(t.value) }));
    }
    getStartOfData() {
        const tagsStart = this.getTagsStart();
        const numberOfTagBytesArray = this.binary.slice(tagsStart + 8, tagsStart + 16);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        return tagsStart + 16 + numberOfTagBytes;
    }
    get rawData() {
        const tagsStart = this.getTagsStart();
        const numberOfTagBytesArray = this.binary.slice(tagsStart + 8, tagsStart + 16);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        const dataStart = tagsStart + 16 + numberOfTagBytes;
        return this.binary.slice(dataStart, this.binary.length);
    }
    get data() {
        return base64url_1.default.encode(this.rawData);
    }
    /**
     * UNSAFE!!
     * DO NOT MUTATE THE BINARY ARRAY. THIS WILL CAUSE UNDEFINED BEHAVIOUR.
     */
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
    /**
     * Returns a JSON representation of a DataItem
     */
    toJSON() {
        return {
            signature: this.signature,
            owner: this.owner,
            target: this.target,
            tags: this.tags.map(t => ({ name: base64url_1.default.encode(t.name), value: base64url_1.default.encode(t.value) })),
            data: this.data
        };
    }
    /**
     * Verifies a `Buffer` and checks it fits the format of a DataItem
     *
     * A binary is valid iff:
     * - the tags are encoded correctly
     */
    static async verify(buffer, extras) {
        if (buffer.length < exports.MIN_BINARY_SIZE) {
            return false;
        }
        const sigType = utils_1.byteArrayToLong(buffer.slice(0, 2));
        let tagsStart = 2 + 512 + 512 + 2;
        const targetPresent = (buffer[1026] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = (targetPresent ? 1059 : 1027);
        const anchorPresent = (buffer[anchorPresentByte] == 1);
        tagsStart += anchorPresent ? 32 : 0;
        const numberOfTags = utils_1.byteArrayToLong(buffer.slice(tagsStart, tagsStart + 8));
        const numberOfTagBytesArray = buffer.slice(tagsStart + 8, tagsStart + 16);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        if (numberOfTags > 0) {
            try {
                const tags = parser_1.tagsParser.fromBuffer(buffer_1.Buffer.from(buffer.slice(tagsStart + 16, tagsStart + 16 + numberOfTagBytes)));
                if (tags.length !== numberOfTags) {
                    return false;
                }
            }
            catch (e) {
                return false;
            }
        }
        if (extras) {
            const Signer = signing_1.indexToType[sigType];
            const signatureData = await ar_data_base_1.getSignatureData(new DataItem(buffer));
            if (!await Signer.verify(extras.pk, signatureData, buffer.slice(2, 514)))
                return false;
        }
        return true;
    }
    /**
     * Returns the start byte of the tags section (number of tags)
     *
     * @private
     */
    getTagsStart() {
        let tagsStart = 2 + 512 + 512 + 2;
        const targetPresent = (this.binary[1026] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = (targetPresent ? 1059 : 1027);
        const anchorPresent = (this.binary[anchorPresentByte] == 1);
        tagsStart += anchorPresent ? 32 : 0;
        return tagsStart;
    }
    /**
     * Returns the start byte of the tags section (number of tags)
     *
     * @private
     */
    getTargetStart() {
        return 1026;
    }
    /**
     * Returns the start byte of the tags section (number of tags)
     *
     * @private
     */
    getAnchorStart() {
        let anchorStart = this.getTargetStart() + 1;
        const targetPresent = (this.binary[this.getTargetStart()] == 1);
        anchorStart += (targetPresent ? 32 : 0);
        return anchorStart;
    }
}
exports.default = DataItem;
//# sourceMappingURL=DataItem.js.map