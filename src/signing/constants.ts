import { Signer } from "./Signer";
import Curve25519 from "./keys/curve25519";

import {
  ArweaveSigner,
  EthereumSigner,
  HexInjectedSolanaSigner,
  InjectedAptosSigner,
  MultiSignatureAptosSigner,
  TypedEthereumSigner,
} from "./chains";

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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  5: InjectedAptosSigner,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  6: MultiSignatureAptosSigner,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  7: TypedEthereumSigner,
};

console.log(indexToType);

export enum SignatureConfig {
  ARWEAVE = 1,
  ED25519,
  ETHEREUM,
  SOLANA,
  INJECTEDAPTOS = 5,
  MULTIAPTOS = 6,
  TYPEDETHEREUM = 7,
}

interface SignatureMeta {
  sigLength: number;
  pubLength: number;
  sigName: string;
}

export const SIG_CONFIG: Record<SignatureConfig, SignatureMeta> = {
  [SignatureConfig.ARWEAVE]: {
    sigLength: 512,
    pubLength: 512,
    sigName: "arweave",
  },
  [SignatureConfig.ED25519]: {
    sigLength: 64,
    pubLength: 32,
    sigName: "ed25519",
  },
  [SignatureConfig.ETHEREUM]: {
    sigLength: 65,
    pubLength: 65,
    sigName: "ethereum",
  },
  [SignatureConfig.SOLANA]: {
    sigLength: 64,
    pubLength: 32,
    sigName: "solana",
  },
  [SignatureConfig.INJECTEDAPTOS]: {
    sigLength: 64,
    pubLength: 32,
    sigName: "injectedAptos",
  },
  [SignatureConfig.MULTIAPTOS]: {
    sigLength: 64 * 32 + 4, // max 32 64 byte signatures, +4 for 32-bit bitmap
    pubLength: 32 * 32 + 1, // max 64 32 byte keys, +1 for 8-bit threshold value
    sigName: "multiAptos",
  },
  [SignatureConfig.TYPEDETHEREUM]: {
    sigLength: 0,
    pubLength: 0,
    sigName: "typedEthereum",
  },
};
