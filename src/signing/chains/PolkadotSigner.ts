import { cryptoWaitReady } from "@polkadot/util-crypto";
import Sr25519 from "../keys/sr25519";
export default class PolkadotSigner extends Sr25519 {
  constructor(privateKey: string) {
    super(privateKey);
  }
  public async ready(): Promise<void> {
    await cryptoWaitReady();
  }
}
