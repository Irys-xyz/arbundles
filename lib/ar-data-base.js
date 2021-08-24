"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignatureData = void 0;
const tslib_1 = require("tslib");
const web = tslib_1.__importStar(require("arweave/web/lib/deepHash"));
const utils_1 = require("arweave/web/lib/utils");
const utils_2 = require("./utils");
const deepHash_1 = tslib_1.__importDefault(require("./deepHash"));
async function getSignatureData(item) {
    if (utils_2.isBrowser) {
        return web.default([
            utils_1.stringToBuffer("dataitem"),
            utils_1.stringToBuffer("1"),
            item.rawOwner,
            item.rawTarget,
            item.rawAnchor,
            item.rawTags,
            item.rawData
        ]);
    }
    else {
        return deepHash_1.default([
            utils_1.stringToBuffer("dataitem"),
            utils_1.stringToBuffer("1"),
            utils_1.stringToBuffer(item.signatureType.toString()),
            item.rawOwner,
            item.rawTarget,
            item.rawAnchor,
            item.rawTags,
            item.rawData
        ]);
    }
}
exports.getSignatureData = getSignatureData;
//# sourceMappingURL=ar-data-base.js.map