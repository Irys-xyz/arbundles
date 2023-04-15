import type { JWKInterface } from "./interface-jwk.js";
export type { default as Transaction } from "arweave/web/lib/transaction.js";
export type { CreateTransactionInterface } from "arweave/web/common.js";
import webDriver from "arweave/web/lib/crypto/webcrypto-driver.js";
export { stringToBuffer, concatBuffers } from "arweave/web/lib/utils.js";
export { deepHash } from "./deepHash.js";
// import { sha384 as SHA384 } from "sha.js";
// export { default as Arweave } from "arweave/web";
// import type { Hash } from "crypto";
// export const sha384 = (): Hash => SHA384("sha384");

// hack as ESM won't unpack .default CJS imports, so we do so dynamically
// eslint-disable-next-line @typescript-eslint/dot-notation
const driver: typeof webDriver = webDriver["default"] ? webDriver["default"] : webDriver;
export class CryptoDriver extends driver {
  public getPublicKey(_jwk: JWKInterface): string {
    throw new Error("Unimplemented");
  }
}

let driverInstance: CryptoDriver;
export function getCryptoDriver(): CryptoDriver {
  return (driverInstance ??= new CryptoDriver());
}
