/// <reference types="node" />
import Rsa4096Pss from "../keys/Rsa4096Pss";
import { JWKInterface } from "../../interface-jwk";
export default class ArweaveSigner extends Rsa4096Pss {
    private jwk;
    get publicKey(): Buffer;
    constructor(jwk: JWKInterface);
    sign(message: Uint8Array): Uint8Array;
    static verify(pk: string, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
}
