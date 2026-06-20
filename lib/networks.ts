// Frontend mirror of the backend network config. The client never holds an RPC
// secret; it needs the passphrase (for wallet signing), the explorer base (for
// links), and per-network visual treatment so MAINNET is unmistakable.

export type NetworkId = 'testnet' | 'mainnet'

export interface FrontendNetwork {
  id: NetworkId
  label: string
  passphrase: string
  explorerBase: string
  /** mainnet has no faucet */
  faucet: boolean
  isMainnet: boolean
  /** tailwind classes — testnet green, mainnet amber, so they never look alike */
  badgeClass: string
  dotClass: string
  textClass: string
}

export const TESTNET: FrontendNetwork = {
  id: 'testnet',
  label: 'Testnet',
  passphrase: 'Test SDF Network ; September 2015',
  explorerBase: 'https://stellar.expert/explorer/testnet',
  faucet: true,
  isMainnet: false,
  badgeClass: 'border-success/30 bg-success/10 text-success',
  dotClass: 'bg-success',
  textClass: 'text-success',
}

export const MAINNET: FrontendNetwork = {
  id: 'mainnet',
  label: 'Mainnet',
  passphrase: 'Public Global Stellar Network ; September 2015',
  explorerBase: 'https://stellar.expert/explorer/public',
  faucet: false,
  isMainnet: true,
  badgeClass: 'border-warning/40 bg-warning/10 text-warning',
  dotClass: 'bg-warning',
  textClass: 'text-warning',
}

const NETWORKS: Record<NetworkId, FrontendNetwork> = { testnet: TESTNET, mainnet: MAINNET }

export function getNetwork(id: NetworkId): FrontendNetwork {
  return NETWORKS[id] || TESTNET
}

export const explorerTx = (id: NetworkId, hash: string) => `${getNetwork(id).explorerBase}/tx/${hash}`
export const explorerContract = (id: NetworkId, c: string) => `${getNetwork(id).explorerBase}/contract/${c}`
export const explorerAccount = (id: NetworkId, a: string) => `${getNetwork(id).explorerBase}/account/${a}`
