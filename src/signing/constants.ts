import { Signer } from "./Signer";
import Curve25519 from "./keys/curve25519";
import EthereumSigner from "./chains/ethereumSigner";
import { ArweaveSigner, HexInjectedSolanaSigner } from "./chains";

interface IndexToType {
  [key: number]: {
    new (...args): Signer;
    readonly signatureLength: number;
    readonly ownerLength: number;
    verify(
      pk: string | Uint8Array,
      message: Uint8Array,
      signature: Uint8Array,
    ): Promise<boolean>;
  };
}

export const indexToType: IndexToType = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  1: ArweaveSigner,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  2: Curve25519,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  3: EthereumSigner,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  4: HexInjectedSolanaSigner,
};
