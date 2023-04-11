import { /* createHash, */ createPublicKey } from "crypto";
import nodeDriver from "arweave/node/lib/crypto/node-driver";
// import type { Hash } from "crypto";
import type { JWKInterface } from "./interface-jwk";
export { stringToBuffer, concatBuffers } from "arweave/node/lib/utils";
export { default as Transaction } from "arweave/node/lib/transaction";
export { deepHash } from "./deepHash";
// export { default as Arweave } from "arweave/node";
// export const sha384 = (): Hash => createHash("sha384");
export type { CreateTransactionInterface } from "arweave/node/common";

export class CryptoDriver extends nodeDriver {
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
