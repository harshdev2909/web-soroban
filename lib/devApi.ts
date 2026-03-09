/**
 * Developer infrastructure API client (Phase 1).
 * Uses JWT for apikeys/webhooks management; X-API-KEY for RPC and indexer.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api';
const API_KEY_STORAGE_KEY = 'websoroban_api_key';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || new URLSearchParams(window.location.search).get('token');
}

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function clearApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function getApiKeyHeaders(): Record<string, string> {
  const key = getApiKey();
  if (!key) return {};
  return { 'X-API-KEY': key };
}

// --- API Keys (JWT) ---
export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  rateLimit: number;
  usage?: { count: number; lastResetAt: string };
  lastUsedAt?: string | null;
  createdAt: string;
}

export const apikeysApi = {
  async list(): Promise<{ success: boolean; apiKeys: ApiKeyItem[] }> {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/apikeys`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to list API keys');
    return res.json();
  },
  async create(name: string, rateLimit = 100): Promise<{ success: boolean; apiKey: ApiKeyItem & { key: string; message: string } }> {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/apikeys`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rateLimit }),
    });
    if (!res.ok) throw new Error('Failed to create API key');
    return res.json();
  },
  async delete(id: string): Promise<{ success: boolean }> {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/apikeys/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete API key');
    return res.json();
  },
};

// --- Webhooks (JWT or X-API-KEY) ---
export interface WebhookItem {
  id: string;
  url: string;
  eventType: string;
  contract: string | null;
  active: boolean;
  lastTriggeredAt?: string | null;
  lastStatus?: number | null;
  createdAt: string;
}

export const webhooksApi = {
  async list(): Promise<{ success: boolean; webhooks: WebhookItem[] }> {
    const token = getAuthToken();
    const key = getApiKey();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    else if (key) headers['X-API-KEY'] = key;
    const res = await fetch(`${API_BASE_URL}/webhooks`, { headers });
    if (!res.ok) throw new Error('Failed to list webhooks');
    return res.json();
  },
  async create(eventType: string, url: string, contract?: string): Promise<{ success: boolean; webhook: WebhookItem }> {
    const token = getAuthToken();
    const key = getApiKey();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    else if (key) headers['X-API-KEY'] = key;
    const res = await fetch(`${API_BASE_URL}/webhooks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ eventType, url, contract: contract || undefined }),
    });
    if (!res.ok) throw new Error('Failed to create webhook');
    return res.json();
  },
  async delete(id: string): Promise<{ success: boolean }> {
    const token = getAuthToken();
    const key = getApiKey();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    else if (key) headers['X-API-KEY'] = key;
    const res = await fetch(`${API_BASE_URL}/webhooks/${id}`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error('Failed to delete webhook');
    return res.json();
  },
};

// --- RPC (X-API-KEY) ---
export const rpcApi = {
  async post(body: object | object[]): Promise<unknown> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getApiKeyHeaders() };
    const res = await fetch(`${API_BASE_URL}/rpc`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || res.statusText);
    }
    return res.json();
  },
};

// --- Indexer (X-API-KEY) ---
export interface IndexedTransaction {
  _id: string;
  hash: string;
  ledger: number;
  from?: string | null;
  contract?: string | null;
  function?: string | null;
  timestamp?: string | null;
  status: string;
  success?: boolean;
}

export interface IndexedContractEvent {
  _id?: string; // absent when event is from RPC fallback
  contract: string;
  eventType: string;
  data?: Record<string, unknown>;
  txHash: string;
  ledger: number;
  timestamp?: string | null;
}

export const indexerApi = {
  async getTransaction(hash: string): Promise<{ success: boolean; transaction: IndexedTransaction }> {
    const res = await fetch(`${API_BASE_URL}/transactions/${encodeURIComponent(hash)}`, {
      headers: getApiKeyHeaders(),
    });
    if (!res.ok) {
      if (res.status === 404) throw new Error('Transaction not found');
      throw new Error('Failed to fetch transaction');
    }
    return res.json();
  },
  async getAccountTransactions(address: string, limit = 20, cursor?: string): Promise<{ success: boolean; transactions: IndexedTransaction[]; nextCursor: string | null }> {
    const url = new URL(`${API_BASE_URL}/accounts/${encodeURIComponent(address)}/transactions`);
    url.searchParams.set('limit', String(limit));
    if (cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url.toString(), { headers: getApiKeyHeaders() });
    if (!res.ok) throw new Error('Failed to fetch account transactions');
    return res.json();
  },
  async getContractEvents(address: string, limit = 20, cursor?: string, eventType?: string): Promise<{ success: boolean; events: IndexedContractEvent[]; nextCursor: string | null }> {
    const url = new URL(`${API_BASE_URL}/contracts/${encodeURIComponent(address)}/events`);
    url.searchParams.set('limit', String(limit));
    if (cursor) url.searchParams.set('cursor', cursor);
    if (eventType) url.searchParams.set('eventType', eventType);
    const res = await fetch(url.toString(), { headers: getApiKeyHeaders() });
    if (!res.ok) {
      if (res.status === 401) throw new Error('API key required or invalid. Set it in Explorer or Dashboard → API Keys.');
      if (res.status === 429) throw new Error('Rate limit exceeded. Try again later.');
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body?.error ?? 'Failed to fetch contract events');
    }
    return res.json();
  },
};
