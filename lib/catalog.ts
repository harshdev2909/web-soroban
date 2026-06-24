// Helpers for the project catalog (/projects). Pure client-side concerns the
// backend doesn't model: favorites/pins and template-origin labels are persisted
// to localStorage (scoped per user); relative time + sorting + metadata are
// derived from the Project the projects API already returns.

import { formatDistanceToNowStrict } from 'date-fns'
import type { Project } from '@/lib/api'
import { getNetwork, type NetworkId } from '@/lib/networks'

// --- relative time ---------------------------------------------------------

/** "5 days ago", "just now". Falls back to the raw string on a bad date. */
export function relativeTime(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const secs = (Date.now() - d.getTime()) / 1000
  if (secs < 45) return 'just now'
  return `${formatDistanceToNowStrict(d)} ago`
}

// --- favorites (per-user, localStorage) ------------------------------------

const favKey = (userId: string) => `ws.favorites.${userId}`

export function getFavorites(userId?: string | null): Set<string> {
  if (!userId || typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(favKey(userId))
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function setFavorites(userId: string, ids: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(favKey(userId), JSON.stringify([...ids]))
  } catch {
    /* quota / disabled storage — favorites are best-effort */
  }
}

export function toggleFavorite(userId: string, projectId: string): Set<string> {
  const next = getFavorites(userId)
  if (next.has(projectId)) next.delete(projectId)
  else next.add(projectId)
  setFavorites(userId, next)
  return next
}

// --- template origin (per-project, localStorage) ---------------------------
// The backend doesn't store which template a project was scaffolded from, so we
// remember the label at creation time to show "from <Template>" on the card.

const ORIGIN_KEY = 'ws.projectOrigin'

function readOrigins(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(ORIGIN_KEY) || '{}') as Record<string, string>
  } catch {
    return {}
  }
}

export function getOrigin(projectId: string): string | undefined {
  return readOrigins()[projectId]
}

export function rememberOrigin(projectId: string, label: string): void {
  if (typeof window === 'undefined') return
  try {
    const all = readOrigins()
    all[projectId] = label
    window.localStorage.setItem(ORIGIN_KEY, JSON.stringify(all))
  } catch {
    /* best-effort */
  }
}

export function forgetOrigin(projectId: string): void {
  if (typeof window === 'undefined') return
  try {
    const all = readOrigins()
    if (projectId in all) {
      delete all[projectId]
      window.localStorage.setItem(ORIGIN_KEY, JSON.stringify(all))
    }
  } catch {
    /* best-effort */
  }
}

// --- derived card metadata -------------------------------------------------

export interface ProjectMeta {
  fileCount: number
  deployCount: number
  network: NetworkId
  networkCfg: ReturnType<typeof getNetwork>
  updated: string
  origin?: string
}

export function projectMeta(p: Project): ProjectMeta {
  const network = (p.network === 'mainnet' ? 'mainnet' : 'testnet') as NetworkId
  const successfulDeploys = p.deploymentHistory?.filter((d) => d.status === 'success').length
  return {
    fileCount: p.files?.length ?? 0,
    deployCount: successfulDeploys ?? (p.lastDeployed ? 1 : 0),
    network,
    networkCfg: getNetwork(network),
    updated: relativeTime(p.updatedAt),
    origin: getOrigin(p._id),
  }
}

// --- sorting ---------------------------------------------------------------

export type SortKey = 'updated' | 'name' | 'created'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'updated', label: 'Last modified' },
  { value: 'name', label: 'Name' },
  { value: 'created', label: 'Created' },
]

const ts = (s?: string) => {
  const t = s ? new Date(s).getTime() : 0
  return Number.isNaN(t) ? 0 : t
}

export function sortProjects(list: Project[], key: SortKey): Project[] {
  const next = [...list]
  switch (key) {
    case 'name':
      return next.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    case 'created':
      return next.sort((a, b) => ts(b.createdAt) - ts(a.createdAt))
    case 'updated':
    default:
      return next.sort((a, b) => ts(b.updatedAt) - ts(a.updatedAt))
  }
}

export type NetworkFilter = 'all' | NetworkId

/** name + template-origin search, optional network + favorites filters. */
export function filterProjects(
  list: Project[],
  opts: { query: string; network: NetworkFilter; favoritesOnly: boolean; favorites: Set<string> },
): Project[] {
  const q = opts.query.trim().toLowerCase()
  return list.filter((p) => {
    if (opts.favoritesOnly && !opts.favorites.has(p._id)) return false
    if (opts.network !== 'all') {
      const net = p.network === 'mainnet' ? 'mainnet' : 'testnet'
      if (net !== opts.network) return false
    }
    if (!q) return true
    const origin = getOrigin(p._id) || ''
    return p.name.toLowerCase().includes(q) || origin.toLowerCase().includes(q)
  })
}
