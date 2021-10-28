"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexToType = void 0;
const tslib_1 = require("tslib");
const Rsa4096Pss_1 = tslib_1.__importDefault(require("./keys/Rsa4096Pss"));
const curve25519_1 = tslib_1.__importDefault(require("./keys/curve25519"));
const secp256k1_1 = tslib_1.__importDefault(require("./keys/secp256k1"));
exports.indexToType = {
    1: Rsa4096Pss_1.default,
    2: curve25519_1.default,
    3: secp256k1_1.default
};
//# sourceMappingURL=constants.js.map