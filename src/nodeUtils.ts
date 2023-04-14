import { /* createHash, */ createPublicKey } from "crypto";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import nodeDriver from "arweave/node/lib/crypto/node-driver.js";
// import type { Hash } from "crypto";
import type { JWKInterface } from "./interface-jwk.js";
export { stringToBuffer, concatBuffers } from "arweave/node/lib/utils.js";
export { default as Transaction } from "arweave/node/lib/transaction.js";
export { deepHash } from "./deepHash.js";
// export { default as Arweave } from "arweave/node";
// export const sha384 = (): Hash => createHash("sha384");
export type { CreateTransactionInterface } from "arweave/node/common.js";

// @ts-expect-error hack to use .default in CJS environments
const driver: typeof nodeDriver = typeof __importDefault === "undefined" ? nodeDriver.default : nodeDriver;

export class CryptoDriver extends driver {
  public getPublicKey(jwk: JWKInterface): string {
    return createPublicKey({
      key: this.jwkToPem(jwk),
      type: "pkcs1",
      format: "pem",
    })
      .export({
        format: "pem",
        type: "pkcs1",
      })
      .toString();
  }
}

let d: CryptoDriver;
export function getCryptoDriver(): CryptoDriver {
  return (d ??= new CryptoDriver());
}
