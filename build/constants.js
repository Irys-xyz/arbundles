"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIG_CONFIG = exports.SignatureConfig = void 0;
var SignatureConfig;
(function (SignatureConfig) {
  SignatureConfig[(SignatureConfig["ARWEAVE"] = 1)] = "ARWEAVE";
  SignatureConfig[(SignatureConfig["SOLANA"] = 2)] = "SOLANA";
  SignatureConfig[(SignatureConfig["ETHERIUM"] = 3)] = "ETHERIUM";
})(
  (SignatureConfig = exports.SignatureConfig || (exports.SignatureConfig = {})),
);
exports.SIG_CONFIG = {
  // Arweave
  [SignatureConfig.ARWEAVE]: {
    sigLength: 512,
    pubLength: 512,
  },
  // ed25519 - Solana
  [SignatureConfig.SOLANA]: {
    sigLength: 64,
    pubLength: 32,
  },
  // Ethereum
  [SignatureConfig.ETHERIUM]: {
    sigLength: 64,
    pubLength: 65,
  },
};
//# sourceMappingURL=constants.js.map
