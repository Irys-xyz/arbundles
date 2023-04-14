// import type { Hash } from "crypto";
import type { JWKInterface } from "./interface-jwk.js";
export type { default as Transaction } from "arweave/web/lib/transaction.js";
export type { CreateTransactionInterface } from "arweave/web/common.js";
// import { sha384 as SHA384 } from "sha.js";
import webDriver from "arweave/web/lib/crypto/webcrypto-driver.js";
export { stringToBuffer, concatBuffers } from "arweave/web/lib/utils.js";
export { deepHash } from "./deepHash.js";
// export { default as Arweave } from "arweave/web";

// export const sha384 = (): Hash => SHA384("sha384");

// @ts-expect-error hack to use .default in CJS environments
const driver: typeof webDriver = typeof __importDefault === "undefined" ? webDriver.default : webDriver;

export class CryptoDriver extends driver {
  protected declare hasSubtle: boolean;

  public getPublicKey(_jwk: JWKInterface): string {
    throw new Error("Unimplemented");
  }
}

let d: CryptoDriver;
export function getCryptoDriver(): CryptoDriver {
  return (d ??= new CryptoDriver());
}
