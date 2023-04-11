// import type { Hash } from "crypto";
import type { JWKInterface } from "./interface-jwk";
export type { default as Transaction } from "arweave/web/lib/transaction";
export type { CreateTransactionInterface } from "arweave/web/common";
// import { sha384 as SHA384 } from "sha.js";
import webDriver from "arweave/web/lib/crypto/webcrypto-driver";
export { stringToBuffer, concatBuffers } from "arweave/web/lib/utils";
export { deepHash } from "./deepHash";
// export { default as Arweave } from "arweave/web";

// export const sha384 = (): Hash => SHA384("sha384");
export class CryptoDriver extends webDriver {
  protected declare hasSubtle: boolean;

  public getPublicKey(_jwk: JWKInterface): string {
    throw new Error("Unimplemented");
  }
}

let d: CryptoDriver;
export function getCryptoDriver(): CryptoDriver {
  return (d ??= new CryptoDriver());
}
