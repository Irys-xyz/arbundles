"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleItem = void 0;
class BundleItem {
    signatureType;
    rawSignature;
    signature;
    signatureLength;
    rawOwner;
    owner;
    ownerLength;
    rawTarget;
    target;
    rawAnchor;
    anchor;
    rawTags;
    tags;
    rawData;
    data;
    static async verify(..._) {
        throw new Error("You must implement `verify`");
    }
}
exports.BundleItem = BundleItem;
//# sourceMappingURL=BundleItem.js.map