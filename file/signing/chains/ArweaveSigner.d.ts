/// <reference types="node" />
import Rsa4096Pss from "../keys/Rsa4096Pss";
import { JWKInterface } from "../../interface-jwk";
export default class ArweaveSigner extends Rsa4096Pss {
    get publicKey(): Buffer;
    constructor(jwk: JWKInterface);
}
