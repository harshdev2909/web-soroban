/**
 * Billing API client (mirrors backend routes/billing.ts). Credit balance,
 * ledger/usage history, credit packs, and Dodo checkout. This is the fiat/credits
 * system — separate from the testnet-XLM plan flow.
 */
import { authApi } from './api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api'

export interface CreditPack {
  key: 'starter' | 'pro' | 'max'
  name: string
  priceCents: number
  currency: string
  credits: number
  priceLabel: string
  available: boolean
}

export interface LedgerEntry {
  id: string
  delta: number
  reason: 'signup_grant' | 'purchase' | 'usage' | 'refund' | 'admin'
  refId?: string | null
  balanceAfter: number
  createdAt: string
}

export interface UsageEntry {
  id: string
  runId: string
  model: string
  mode: string
  tokensIn: number
  tokensOut: number
  costUsd: number
  creditsCharged: number
  createdAt: string
}

/** Thrown when the API responds 402 OUT_OF_CREDITS (gates a Copilot run). */
export class OutOfCreditsError extends Error {
  balance: number
  plans: CreditPack[]
  constructor(message: string, balance: number, plans: CreditPack[]) {
    super(message)
    this.name = 'OutOfCreditsError'
    this.balance = balance
    this.plans = plans
  }
}

async function billingFetch<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = authApi.getToken()
  const res = await fetch(`${API_BASE_URL}/billing${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(json.error || json.message || `Request failed (${res.status})`)
  return json as T
}

export const billingApi = {
  getBalance: () => billingFetch<{ balance: number }>('/balance'),
  getPlans: () => billingFetch<{ plans: CreditPack[]; configured: boolean; crypto?: boolean }>('/plans'),
  getLedger: (limit = 50) => billingFetch<{ entries: LedgerEntry[] }>(`/ledger?limit=${limit}`),
  getUsage: (limit = 50) => billingFetch<{ usage: UsageEntry[] }>(`/usage?limit=${limit}`),
  checkout: (pack: CreditPack['key']) =>
    billingFetch<{ checkout_url: string; session_id: string }>('/checkout', {
      method: 'POST',
      body: JSON.stringify({ pack }),
    }),
  reconcile: (paymentId: string) =>
    billingFetch<{ ok: boolean; credits?: number; balance?: number }>('/reconcile', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    }),
}

export default billingApi
