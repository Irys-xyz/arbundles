"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const parser_1 = require("./parser");
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const buffer_1 = require("buffer");
const ar_data_bundle_1 = require("./ar-data-bundle");
const arweave_1 = tslib_1.__importDefault(require("arweave"));
class DataItem {
    constructor(binary) {
        this.binary = binary;
    }
    ;
    static isDataItem(obj) {
        return obj.binary !== undefined;
    }
    isValid() {
        return DataItem.verify(this.binary);
    }
    getRawId() {
        return this.id;
    }
    getId() {
        return base64url_1.default.encode(this.id, "hex");
    }
    getRawSignature() {
        return this.binary.slice(0, 512);
    }
    getSignature() {
        return base64url_1.default.encode(this.getRawSignature());
    }
    getRawOwner() {
        return this.binary.slice(512, 512 + 512);
    }
    getOwner() {
        return base64url_1.default.encode(buffer_1.Buffer.from(this.getRawOwner()), "hex");
    }
    getAddress() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return base64url_1.default.encode(buffer_1.Buffer.from(yield arweave_1.default.crypto.hash(this.getRawOwner(), "SHA-256")), "hex");
        });
    }
    getRawTarget() {
        const targetStart = this.getTargetStart();
        const isPresent = this.binary[targetStart] == 1;
        return isPresent ? this.binary.slice(targetStart + 1, targetStart + 33) : buffer_1.Buffer.alloc(0);
    }
    getTarget() {
        const target = this.getRawTarget();
        return base64url_1.default.encode(target, "hex");
    }
    getRawAnchor() {
        const anchorStart = this.getAnchorStart();
        const isPresent = this.binary[anchorStart] == 1;
        return isPresent ? this.binary.slice(anchorStart + 1, anchorStart + 33) : buffer_1.Buffer.alloc(0);
    }
    getAnchor() {
        return this.getRawAnchor().toString();
    }
    getRawTags() {
        const tagsStart = this.getTagsStart();
        const tagsSize = utils_1.byteArrayToLong(this.binary.slice(tagsStart + 8, tagsStart + 16));
        return this.binary.slice(tagsStart + 16, tagsStart + 16 + tagsSize);
    }
    getTags() {
        const tagsStart = this.getTagsStart();
        const tagsCount = utils_1.byteArrayToLong(this.binary.slice(tagsStart, tagsStart + 8));
        if (tagsCount == 0) {
            return [];
        }
        const tagsSize = utils_1.byteArrayToLong(this.binary.slice(tagsStart + 8, tagsStart + 16));
        return parser_1.tagsParser.fromBuffer(buffer_1.Buffer.from(this.binary.slice(tagsStart + 16, tagsStart + 16 + tagsSize)));
    }
    getData() {
        const tagsStart = this.getTagsStart();
        const numberOfTagBytesArray = this.binary.slice(tagsStart + 8, tagsStart + 16);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        const dataStart = tagsStart + 16 + numberOfTagBytes;
        return this.binary.slice(dataStart, this.binary.length);
    }
    /**
     * UNSAFE!!
     * DO NOT MUTATE THE BINARY ARRAY. THIS WILL CAUSE UNDEFINED BEHAVIOUR.
     */
    getRaw() {
        return this.binary;
    }
    sign(jwk) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.id = yield ar_data_bundle_1.sign(this, jwk);
            return this.getRawId();
        });
    }
    isSigned() {
        var _a, _b;
        return ((_b = (_a = this.id) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
    }
    /**
     * Returns a JSON representation of a DataItem
     */
    toJSON() {
        return {
            signature: this.getSignature(),
            owner: this.getOwner(),
            target: this.getTarget(),
            tags: this.getTags().map(t => ({ name: base64url_1.default.encode(t.name), value: base64url_1.default.encode(t.value) })),
            data: base64url_1.default.encode(this.getData())
        };
    }
    /**
     * Verifies a `Buffer` and checks it fits the format of a DataItem
     *
     * A binary is valid iff:
     * - the tags are encoded correctly
     */
    static verify(buffer, extras) {
        let tagsStart = 512 + 512 + 2;
        const targetPresent = (buffer[1024] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = (targetPresent ? 1057 : 1025);
        const anchorPresent = (buffer[anchorPresentByte] == 1);
        tagsStart += anchorPresent ? 32 : 0;
        const numberOfTags = utils_1.byteArrayToLong(buffer.slice(tagsStart, tagsStart + 8));
        if (numberOfTags == 0) {
            return true;
        }
        const numberOfTagBytesArray = buffer.slice(tagsStart + 8, tagsStart + 16);
        const numberOfTagBytes = utils_1.byteArrayToLong(numberOfTagBytesArray);
        if (extras) {
            // TODO: Check if id matches
        }
        try {
            const tags = parser_1.tagsParser.fromBuffer(buffer_1.Buffer.from(buffer.slice(tagsStart + 16, tagsStart + 16 + numberOfTagBytes)));
            if (tags.length !== numberOfTags) {
                return false;
            }
        }
        catch (e) {
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
        let tagsStart = 512 + 512 + 2;
        const targetPresent = (this.binary[1024] == 1);
        tagsStart += targetPresent ? 32 : 0;
        const anchorPresentByte = (targetPresent ? 1057 : 1025);
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
        return 1024;
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