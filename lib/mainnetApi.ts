// API client for the network-aware (mainnet) endpoints. Reuses the auth token +
// base URL from lib/api. Kept separate from the large lib/api.ts for clarity.
import { authApi } from './api'
import type { NetworkId } from './networks'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api'

async function call<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = authApi.getToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}
  if (!res.ok || json.success === false) throw new Error(json.error || json.message || `Request failed (${res.status})`)
  return json as T
}

export interface NetWalletInfo {
  publicKey: string
  balance: number
  funded: boolean
  network: NetworkId
  mainnetSigningMode?: 'connected' | 'custodial'
}

export const networkApi = {
  // --- wallet ---
  wallet: (network: NetworkId) => call<NetWalletInfo>(`/wallet/me?network=${network}`),
  // Pass `address` to read a specific account (e.g. the connected wallet that
  // signs mainnet); omit it for the user's own custodial wallet.
  balance: (network: NetworkId, address?: string) =>
    call<NetWalletInfo>(`/wallet/balance?network=${network}${address ? `&address=${encodeURIComponent(address)}` : ''}`),
  fund: (network: NetworkId) => call(`/wallet/fund`, { method: 'POST', body: JSON.stringify({ network }) }),
  getSigningMode: () => call<{ mainnetSigningMode: 'connected' | 'custodial' }>(`/wallet/signing-mode`),
  setSigningMode: (mode: 'connected' | 'custodial', acknowledged = false) =>
    call<{ mainnetSigningMode: 'connected' | 'custodial' }>(`/wallet/signing-mode`, {
      method: 'PUT',
      body: JSON.stringify({ mode, acknowledged }),
    }),
  exportKey: (confirm: string, password?: string) =>
    call<{ publicKey: string; secret: string }>(`/wallet/export`, {
      method: 'POST',
      body: JSON.stringify({ confirm, password }),
    }),

  // --- non-custodial deploy (browser-signed XDR) ---
  deployPrepare: (body: {
    projectId?: string
    wasmBase64: string
    sourcePk: string
    network: NetworkId
    step: 'upload' | 'create'
    wasmHashHex?: string
  }) => call<{ xdr: string; feeXlm: string; feeStroops: string; wasmHashHex?: string; passphrase: string; filled?: string[]; skipped?: string[] }>(
    `/deploy/prepare`, { method: 'POST', body: JSON.stringify(body) },
  ),
  deploySubmit: (body: {
    projectId?: string
    signedXdr: string
    network: NetworkId
    step: 'upload' | 'create'
    sourcePk?: string
    wasmBase64?: string
    deployTarget?: string | null
  }) => call<{ txHash: string; wasmHashHex?: string; contractAddress?: string; explorer?: string }>(
    `/deploy/submit`, { method: 'POST', body: JSON.stringify(body) },
  ),

  // --- custodial mainnet deploy (opt-in, confirm-gated) ---
  // Enqueues a custodial deploy job (the worker signs + submits, no blocking
  // request). Returns a jobId to poll via deployApi.pollDeployJobResult.
  deployCustodial: (body: { projectId: string; wasmBase64: string; network: NetworkId; confirm: boolean }) =>
    call<{ jobId?: string; network: NetworkId; logs?: any[]; message?: string; error?: string }>(
      `/deploy/custodial`, { method: 'POST', body: JSON.stringify(body) },
    ),

  // --- invoke ---
  invoke: (
    contractId: string,
    body: { functionName: string; args?: Record<string, any>; execute?: boolean; network: NetworkId; sourcePk?: string; clientRef?: string },
  ) => call<any>(`/contracts/${contractId}/invoke`, { method: 'POST', body: JSON.stringify(body) }),
  invokeSubmit: (
    contractId: string,
    body: { functionName: string; args?: Record<string, any>; signedXdr: string; network: NetworkId; clientRef?: string },
  ) => call<any>(`/contracts/${contractId}/invoke/submit`, { method: 'POST', body: JSON.stringify(body) }),
}

export default networkApi
