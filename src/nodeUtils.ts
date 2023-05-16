import { createPublicKey } from "crypto";
import { default as nodeDriver } from "arweave/node/lib/crypto/node-driver";
import type { JWKInterface } from "./interface-jwk";
// import CryptoInterface from "arweave/node/lib/crypto/crypto-interface";
export { stringToBuffer, concatBuffers } from "arweave/node/lib/utils";
export { default as Transaction } from "arweave/node/lib/transaction";
export { deepHash } from "./deepHash";
// import type { Hash } from "crypto";
// export { default as Arweave } from "arweave/node";
// export const sha384 = (): Hash => createHash("sha384");
export type { CreateTransactionInterface } from "arweave/node/common";

// hack as ESM won't unpack .default CJS imports, so we do so dynamically
// eslint-disable-next-line @typescript-eslint/dot-notation
const driver: typeof nodeDriver = nodeDriver["default"] ? nodeDriver["default"] : nodeDriver;
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

let driverInstance: CryptoDriver;
export function getCryptoDriver(): CryptoDriver {
  return (driverInstance ??= new CryptoDriver());
}
