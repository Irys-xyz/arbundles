import Sr25519 from "../keys/sr25519";
export default class PolkadotSigner extends Sr25519 {

    constructor(privateKey:string){
        super(privateKey)
    }

}