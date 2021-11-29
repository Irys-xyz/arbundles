export enum SignatureConfig {
  ARWEAVE = 1,
  ED25519,
  ETHERIUM,
}

interface SignatureMeta {
  sigLength: number;
  pubLength: number;
}

export const SIG_CONFIG: Record<SignatureConfig, SignatureMeta> = {
  // Arweave
  [SignatureConfig.ARWEAVE]: {
    sigLength: 512,
    pubLength: 512,
  },
  // ed25519 - Solana
  [SignatureConfig.ED25519]: {
    sigLength: 64,
    pubLength: 32,
  },
  // Ethereum
  [SignatureConfig.ETHERIUM]: {
    sigLength: 65,
    pubLength: 65,
  },
};
