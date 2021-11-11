export const SIG_CONFIG = {
  // Arweave
  1: {
    sigLength: 512,
    pubLength: 512
  },
  // ed25519 - Solana
  2: {
    sigLength: 64,
    pubLength: 32
  },
  // Ethereum
  3: {
    sigLength: 64,
    pubLength: 65
  }
}
