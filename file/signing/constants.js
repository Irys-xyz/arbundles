"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexToType = void 0;
const tslib_1 = require("tslib");
const curve25519_1 = tslib_1.__importDefault(require("./keys/curve25519"));
const ethereum_1 = tslib_1.__importDefault(require("./chains/ethereum"));
const chains_1 = tslib_1.__importDefault(require("./chains"));
exports.indexToType = {
    1: chains_1.default,
    2: curve25519_1.default,
    3: ethereum_1.default
};
//# sourceMappingURL=constants.js.map