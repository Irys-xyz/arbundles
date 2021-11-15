/// <reference types="node" />
import Ethereum from "./ethereum";
export default class PolygonSigner extends Ethereum {
    get publicKey(): Buffer;
    constructor(key: string);
}
