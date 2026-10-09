import { PAY_API_BASE_URL } from '@/lib/payApi'
import type { NetworkId } from '@/lib/networks'

export const USDC_DECIMALS = 7
const SCALE = BigInt(10_000_000) // 10^USDC_DECIMALS
export const USDC_ISSUER: Record<NetworkId, string> = {
  testnet: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  mainnet: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
}
export const RPC_URL: Record<NetworkId, string> = {
  testnet: 'https://soroban-testnet.stellar.org',
  mainnet: process.env.NEXT_PUBLIC_MAINNET_SOROBAN_RPC_URL || 'https://mainnet.sorobanrpc.com',
}
export const HORIZON_URL: Record<NetworkId, string> = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
}

export type PolicyStatus = 'active' | 'paused' | 'revoked' | 'completed'

export interface PayLoopConfig {
  enabled: boolean
  network: NetworkId
  contractId: string | null
  token: string
  tokenDecimals: number
  minIntervalSeconds: number
  explorerBase: string
  demoMerchant: string | null
}

export interface PayLoopPolicy {
  policyId: string
  subscriber: string
  merchant: string
  amount: string
  amountUsdc: string
  intervalSeconds: number
  cap: string
  capUsdc: string
  spent: string
  spentUsdc: string
  charges: number
  failedAttempts: number
  nextChargeAt: string
  createdAt: string
  status: PolicyStatus
  lastAttemptError: string | null
}

export interface PayLoopCharge {
  eventId: string
  txHash: string
  ledger: number
  at: string
  outcome: 'charged' | 'insufficient_balance' | 'insufficient_allowance' | string
  amountUsdc: string
  chargeNumber: number | null
  dueAt: string
  delaySeconds: number
}

const CONTRACT_ERRORS: Record<number, string> = {
  1: 'That policy does not exist.',
  2: 'The amount must be greater than zero.',
  3: 'The interval must be between one minute and one year.',
  4: 'The safety cap must cover at least one charge.',
  5: 'The merchant must be a different account from the subscriber.',
  6: 'This policy is not active.',
  7: 'This policy is not paused.',
  8: 'This policy has already ended.',
  9: 'The next charge is not due yet.',
  10: 'That amount is too large.',
  11: 'The allowance expiry is out of range. Retry in a moment.',
}

/** Turn RPC, contract, and wallet failures into one readable sentence. */
export function explainPayLoopError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const contract = message.match(/Error\(Contract, #(\d+)\)/)
  if (contract) return CONTRACT_ERRORS[Number(contract[1])] || `The contract rejected the call (#${contract[1]}).`
  if (/resulting balance is not within the allowed range|balance is not|insufficient/i.test(message)) {
    return 'The wallet does not hold enough USDC for the first charge.'
  }
  if (/trustline|Error\(Contract, #13\)|not authorized/i.test(message)) return 'Add a USDC trustline to this wallet first.'
  if (/reject|denied|declin|cancel/i.test(message)) return 'You cancelled the request in your wallet.'
  return message || 'The PayLoop request failed.'
}

export function toStroops(usdc: string): bigint {
  const raw = usdc.trim()
  if (!/^\d+(\.\d{1,7})?$/.test(raw)) throw new Error('Enter a USDC amount with up to 7 decimal places.')
  const [whole, fraction = ''] = raw.split('.')
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(USDC_DECIMALS, '0'))
}

export function formatInterval(seconds: number): string {
  const units: Array<[number, string]> = [[86_400 * 30, 'month'], [86_400 * 7, 'week'], [86_400, 'day'], [3_600, 'hour'], [60, 'minute']]
  for (const [size, label] of units) {
    if (seconds % size === 0) {
      const count = seconds / size
      return count === 1 ? label : `${count} ${label}s`
    }
  }
  return `${seconds} seconds`
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${PAY_API_BASE_URL}${path}`, { cache: 'no-store' })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || data.message || 'PayLoop request failed.')
  return data as T
}

export const payloopApi = {
  config: () => getJson<PayLoopConfig & { success: true }>('/payloop/config'),
  policies: (subscriber: string) =>
    getJson<{ success: true; policies: PayLoopPolicy[] }>(`/payloop/policies?subscriber=${encodeURIComponent(subscriber)}`),
  policy: (policyId: string) =>
    getJson<{ success: true; policy: PayLoopPolicy; charges: PayLoopCharge[] }>(`/payloop/policies/${policyId}`),
}

export interface WalletFunds {
  exists: boolean
  xlm: number
  usdc: number | null
}

export async function readFunds(network: NetworkId, address: string): Promise<WalletFunds> {
  const response = await fetch(`${HORIZON_URL[network]}/accounts/${address}`)
  if (response.status === 404) return { exists: false, xlm: 0, usdc: null }
  if (!response.ok) throw new Error('Could not read the wallet balance.')
  const account = await response.json()
  const balances: Array<Record<string, string>> = account.balances || []
  const native = balances.find((line) => line.asset_type === 'native')
  const usdc = balances.find((line) => line.asset_code === 'USDC' && line.asset_issuer === USDC_ISSUER[network])
  return { exists: true, xlm: Number(native?.balance || 0), usdc: usdc ? Number(usdc.balance) : null }
}

export interface WalletSigner {
  address: string
  signTransaction: (xdr: string, networkPassphrase?: string) => Promise<string>
}
