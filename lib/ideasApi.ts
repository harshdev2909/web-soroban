import { authApi } from '@/lib/api'
import type { CommunityIdea, IdeaSubmission } from '@/lib/ideas'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production-003a.up.railway.app/api'

export type IdeaForm = {
  title: string
  goal: string
  description: string
  alignment: string
  author: string
  contact: string
  link: string
  /** Honeypot. Hidden from people, so only bots fill it. */
  website: string
}

export class IdeaApiError extends Error {
  field?: string
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'IdeaApiError'
    this.field = field
  }
}

async function ideasFetch<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = typeof window === 'undefined' ? null : authApi.getToken()
  const res = await fetch(`${API_BASE_URL}/ideas${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}
  if (!res.ok) throw new IdeaApiError(json.error || json.message || `Request failed (${res.status})`, json.field)
  return json as T
}

/** Accepted community ideas. Never throws: the Idea Bank renders without them. */
export async function getCommunityIdeas(): Promise<CommunityIdea[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/ideas`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.ideas) ? json.ideas : []
  } catch {
    return []
  }
}

export const ideasApi = {
  submit: (form: IdeaForm) =>
    ideasFetch<{ success: boolean; id?: string }>('/submissions', {
      method: 'POST',
      body: JSON.stringify(form),
    }),
  list: (status: IdeaSubmission['status'] | 'all') =>
    ideasFetch<{ submissions: IdeaSubmission[] }>(`/submissions?status=${status}`),
  review: (id: string, body: { status?: IdeaSubmission['status']; reviewNote?: string }) =>
    ideasFetch<{ submission: IdeaSubmission }>(`/submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
}
