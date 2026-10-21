import { authApi } from '@/lib/api'
import { MAINNET, TESTNET, type FrontendNetwork } from '@/lib/networks'

export const PAY_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api'

export type PayNetwork = 'stellar:testnet' | 'stellar:pubnet'

/** Frontend network config (passphrase, explorer, badge colors) for an x402 network. */
export function payNetwork(network: string | null | undefined): FrontendNetwork {
  return network === 'stellar:pubnet' ? MAINNET : TESTNET
}

export function isPayNetwork(value: unknown): value is PayNetwork {
  return value === 'stellar:testnet' || value === 'stellar:pubnet'
}

/** Soroban RPC used by the browser x402 client to build the payment. */
export function payRpcUrl(network: PayNetwork): string {
  return network === 'stellar:pubnet'
    ? process.env.NEXT_PUBLIC_MAINNET_SOROBAN_RPC_URL || 'https://mainnet.sorobanrpc.com'
    : 'https://soroban-testnet.stellar.org'
}

export interface PayEndpoint {
  id: string
  projectId?: string | null
  name: string
  slug: string
  method: 'GET'
  price: string
  asset: 'USDC'
  network: PayNetwork
  payTo: string
  responseBody: { message?: string; [key: string]: unknown }
  apiKeyPrefix: string
  active: boolean
  resourceUrl: string
  createdAt: string
  updatedAt: string
}

export interface PayEvent {
  id: string
  endpointId: string
  endpointName: string
  endpointSlug: string
  network: PayNetwork
  type: 'request' | 'verification' | 'settlement'
  status: 'payment_required' | 'payment_submitted' | 'verified' | 'settled' | 'failed'
  transaction?: string | null
  payer?: string | null
  amount?: string | null
  errorCode?: string | null
  errorMessage?: string | null
  errorCause?: string | null
  errorFix?: string | null
  latencyMs?: number | null
  createdAt: string
}

export interface PayWallet {
  id: string
  name: string
  platform: string
  authEntry: boolean
  checkout: boolean
  guidance: string
}

export interface PayErrorInfo {
  code: string
  message: string
  cause: string
  fix: string
}

export interface PayFailureReason extends PayErrorInfo {
  count: number
}

export interface PayWebhookDelivery {
  id: string
  eventType: string
  status: 'pending' | 'delivered' | 'failed' | 'cancelled'
  attempts: number
  lastStatusCode?: number | null
  lastError?: string | null
  createdAt: string
}

export interface PayWebhook {
  id: string
  endpointId?: string | null
  url: string
  events: string[]
  secretPrefix: string
  active: boolean
  createdAt: string
  lastDelivery: PayWebhookDelivery | null
}

export interface PayAgentWallet {
  id: string
  endpointId?: string | null
  name: string
  publicKey: string
  spendLimitUsdc: string
  spentUsdc: string
  periodSeconds: number
  periodLedgers: number
  asset: string
  active: boolean
  createdAt: string
}

export interface PayNetworkStatus {
  network: PayNetwork
  label: string
  enabled: boolean
  facilitator: { name: string; managed: boolean } | null
}

export interface SettlementWindow {
  label: '24h' | '7d' | '30d'
  attempts: number
  settled: number
  failed: number
  successRate: number | null
}

export interface PayOverview {
  success: true
  networks: PayNetworkStatus[]
  facilitator: { name: string; managed: boolean } | null
  metrics: {
    endpoints: number
    requests: number
    settled: number
    failed: number
    revenueUsdc: string
    settlement: SettlementWindow[]
  }
  failureReasons: PayFailureReason[]
  endpoints: PayEndpoint[]
  events: PayEvent[]
  wallets: PayWallet[]
  errors: PayErrorInfo[]
  webhooks: PayWebhook[]
  agentWallets: PayAgentWallet[]
}

export type TrustlineStatus =
  | 'ready'
  | 'missing_account'
  | 'missing_trustline'
  | 'not_authorized'
  | 'not_applicable'
  | 'unknown'

export interface TrustlineReport {
  address: string
  network: PayNetwork
  status: TrustlineStatus
  ready: boolean
  balance: string | null
  message: string
  fix: string | null
}

export interface CreatedPayEndpoint {
  success: true
  endpoint: PayEndpoint
  apiKey: string
  warning: string
  trustline?: TrustlineReport
}

/** Error carrying the API's machine code and its suggested fix, when present. */
export class PayApiError extends Error {
  constructor(message: string, readonly code?: string, readonly fix?: string | null) {
    super(message)
    this.name = 'PayApiError'
  }
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data.message || data.error || 'WebSoroban Pay request failed.'
    throw new PayApiError(message, typeof data.error === 'string' ? data.error : undefined, data.fix)
  }
  return data
}

async function authenticatedRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PAY_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${authApi.getToken()}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  return readJson(response) as Promise<T>
}

export const payApi = {
  getOverview() {
    return authenticatedRequest<PayOverview>('/pay/overview')
  },

  async getWallets(): Promise<PayWallet[]> {
    const data = await readJson(await fetch(`${PAY_API_BASE_URL}/pay/wallets`))
    return Array.isArray(data.wallets) ? data.wallets : []
  },

  async checkTrustline(address: string, network: PayNetwork, signal?: AbortSignal): Promise<TrustlineReport> {
    const params = new URLSearchParams({ address, network })
    const data = await readJson(await fetch(`${PAY_API_BASE_URL}/pay/trustline?${params}`, { signal }))
    return data.trustline as TrustlineReport
  },

  createEndpoint(input: {
    name: string
    slug: string
    price: string
    payTo: string
    responseMessage: string
    network: PayNetwork
    projectId?: string
  }) {
    return authenticatedRequest<CreatedPayEndpoint>('/pay/endpoints', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  setEndpointActive(id: string, active: boolean) {
    return authenticatedRequest<{ success: true; endpoint: PayEndpoint }>(`/pay/endpoints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    })
  },

  rotateEndpointKey(id: string) {
    return authenticatedRequest<CreatedPayEndpoint>(`/pay/endpoints/${id}/rotate-key`, { method: 'POST' })
  },

  createWebhook(input: { url: string; events: string[]; endpointId?: string }) {
    return authenticatedRequest<{ success: true; secret: string; warning: string; webhook: PayWebhook }>('/pay/webhooks', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  setWebhookActive(id: string, active: boolean) {
    return authenticatedRequest<{ success: true; webhook: { id: string; active: boolean } }>(`/pay/webhooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    })
  },

  testWebhook(id: string) {
    return authenticatedRequest<{ success: true; delivery: PayWebhookDelivery | null }>(`/pay/webhooks/${id}/test`, { method: 'POST' })
  },

  deleteWebhook(id: string) {
    return authenticatedRequest<{ success: true }>(`/pay/webhooks/${id}`, { method: 'DELETE' })
  },

  createAgentWallet(input: { name: string; publicKey: string; spendLimit: string; endpointId?: string }) {
    return authenticatedRequest<{ success: true; wallet: { id: string; policy: { spendingLimitStroops: string; periodLedgers: number } } }>('/pay/agent-wallets', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  setAgentWalletActive(id: string, active: boolean) {
    return authenticatedRequest<{ success: true; wallet: { id: string; active: boolean } }>(`/pay/agent-wallets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    })
  },

  async requestChallenge(resourceUrl: string): Promise<{
    status: number
    paymentRequired: string | null
    body: Record<string, unknown>
  }> {
    const response = await fetch(resourceUrl, { headers: { Accept: 'application/json' } })
    const body = await response.json().catch(() => ({}))
    if (response.status !== 402) {
      throw new Error(body?.message || body?.error || `Expected HTTP 402, received ${response.status}.`)
    }
    return {
      status: response.status,
      paymentRequired: response.headers.get('PAYMENT-REQUIRED'),
      body,
    }
  },
}
