"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTags = exports.verifyBundle = exports.verifyData = exports.unbundleData = exports.bundleAndSignData = exports.createData = exports.DataItem = exports.Bundle = void 0;
const tslib_1 = require("tslib");
const ar_data_create_1 = require("./ar-data-create");
Object.defineProperty(exports, "createData", { enumerable: true, get: function () { return ar_data_create_1.createData; } });
const ar_data_bundle_1 = require("./ar-data-bundle");
Object.defineProperty(exports, "bundleAndSignData", { enumerable: true, get: function () { return ar_data_bundle_1.bundleAndSignData; } });
Object.defineProperty(exports, "unbundleData", { enumerable: true, get: function () { return ar_data_bundle_1.unbundleData; } });
const ar_data_verify_1 = require("./ar-data-verify");
Object.defineProperty(exports, "verifyData", { enumerable: true, get: function () { return ar_data_verify_1.verifyData; } });
Object.defineProperty(exports, "verifyBundle", { enumerable: true, get: function () { return ar_data_verify_1.verifyBundle; } });
const Bundle_1 = tslib_1.__importDefault(require("./Bundle"));
exports.Bundle = Bundle_1.default;
const DataItem_1 = tslib_1.__importDefault(require("./DataItem"));
exports.DataItem = DataItem_1.default;
const parser_1 = require("./parser");
// interface ExportInterface {
//   createData(opts: DataItemCreateOptions, jwk: JWKPublicInterface): Promise<DataItem>;
//
//   sign(d: Uint8Array, jwk: JWKInterface): Promise<void>;
//
//   addTag(d: Uint8Array, name: string, value: string): Promise<boolean>;
//
//   verifyData(d: Uint8Array): Promise<boolean>;
//
//   verifyBundle(d: Uint8Array): Promise<boolean>;
//
//   bundleAndSignData(d: DataItemCreateOptions[]): Promise<Bundle>;
//
//   unbundleData(d: Uint8Array): Promise<DataItem[]>
// }
const checkTags = parser_1.tagsParser.isValid;
exports.checkTags = checkTags;
//# sourceMappingURL=index.js.map