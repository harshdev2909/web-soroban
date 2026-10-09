import { authApi } from '@/lib/api'

export const PAY_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api'

export interface PayEndpoint {
  id: string
  projectId?: string | null
  name: string
  slug: string
  method: 'GET'
  price: string
  asset: 'USDC'
  network: 'stellar:testnet'
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
  guidance: string
}

export interface PayErrorInfo {
  code: string
  message: string
  cause: string
  fix: string
}

export interface PayWebhook {
  id: string
  endpointId?: string | null
  url: string
  events: string[]
  secretPrefix: string
  active: boolean
  createdAt: string
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

export interface PayOverview {
  success: true
  mode: 'testnet'
  facilitator: { name: string; managed: boolean }
  metrics: {
    endpoints: number
    requests: number
    settled: number
    failed: number
    revenueUsdc: string
  }
  endpoints: PayEndpoint[]
  events: PayEvent[]
  wallets: PayWallet[]
  errors: PayErrorInfo[]
  webhooks: PayWebhook[]
  agentWallets: PayAgentWallet[]
}

export interface CreatedPayEndpoint {
  success: true
  endpoint: PayEndpoint
  apiKey: string
  warning: string
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
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || data.message || 'WebSoroban Pay request failed.')
  return data as T
}

export const payApi = {
  getOverview() {
    return authenticatedRequest<PayOverview>('/pay/overview')
  },

  createEndpoint(input: {
    name: string
    slug: string
    price: string
    payTo: string
    responseMessage: string
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

  createWebhook(input: { url: string; events: string[]; endpointId?: string }) {
    return authenticatedRequest<{ success: true; secret: string; warning: string; webhook: PayWebhook }>('/pay/webhooks', {
      method: 'POST',
      body: JSON.stringify(input),
    })
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
