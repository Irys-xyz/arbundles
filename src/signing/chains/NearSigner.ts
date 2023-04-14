import SolanaSigner from "./SolanaSigner.js";

export default class NearSigner extends SolanaSigner {
  constructor(_key: string) {
    super(_key.replace("ed25519:", ""));
  }
}
