/// <reference types="node" />
import Secp256k1 from '../keys/secp256k1';
export default class PolygonSigner extends Secp256k1 {
    get publicKey(): Buffer;
    constructor(key: string);
}
