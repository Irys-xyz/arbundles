/// <reference types="node" />
import Secp256k1 from "../keys/secp256k1";
export default class Ethereum extends Secp256k1 {
    sign(message: Uint8Array): Uint8Array;
    static verify(pk: string | Buffer, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
}
