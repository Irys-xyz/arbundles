"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexToType = void 0;
const curve25519_1 = __importDefault(require("./keys/curve25519"));
const ethereum_1 = __importDefault(require("./chains/ethereum"));
const chains_1 = require("./chains");
exports.indexToType = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  1: chains_1.ArweaveSigner,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  2: curve25519_1.default,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  3: ethereum_1.default,
};
//# sourceMappingURL=constants.js.map
