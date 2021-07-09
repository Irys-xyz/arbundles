"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignatureData = void 0;
const tslib_1 = require("tslib");
const node = tslib_1.__importStar(require("arweave/node/lib/deepHash"));
const web = tslib_1.__importStar(require("arweave/web/lib/deepHash"));
const utils_1 = require("arweave/web/lib/utils");
const utils_2 = require("./utils");
function getSignatureData(item) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (utils_2.isBrowser) {
            return web.default([
                utils_1.stringToBuffer("dataitem"),
                utils_1.stringToBuffer("1"),
                item.getRawOwner(),
                item.getRawTarget(),
                item.getRawAnchor(),
                item.getRawTags(),
                item.getData()
            ]);
        }
        else {
            return node.default([
                utils_1.stringToBuffer("dataitem"),
                utils_1.stringToBuffer("1"),
                item.getRawOwner(),
                item.getRawTarget(),
                item.getRawAnchor(),
                item.getRawTags(),
                item.getData()
            ]);
        }
    });
}
exports.getSignatureData = getSignatureData;
//# sourceMappingURL=ar-data-base.js.map