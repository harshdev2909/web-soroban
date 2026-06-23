/**
 * AI Copilot API client (mirrors backend routes/ai.ts).
 *
 * Token handling + base URL follow lib/api.ts. Streaming itself happens over
 * Socket.IO (lib/socket subscribeToRun); these calls start runs and read state.
 */
import { authApi, type Project } from './api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api'

export type CopilotMode = 'ask' | 'agent' | 'plan' | 'debug' | 'multitask'

export interface RegistryModel {
  id: string
  label: string
  vendor: string
  effort: 'High' | 'Medium' | 'Fast'
  reasoning: boolean
  recommended?: boolean
  blurb?: string
  available: boolean
  contextLength?: number
  pricing?: { prompt?: string; completion?: string }
}

export interface ModelRegistry {
  models: RegistryModel[]
  catalog: { id: string; name: string; contextLength?: number }[]
  fetchedAt: number
}

export interface AiSettings {
  selectedModel: string
  mode: CopilotMode
  maxMode: boolean
  hasOwnKey: boolean
}

export interface ChatThread {
  _id: string
  id: string
  title: string
  mode: CopilotMode
  model: string
  maxMode: boolean
  projectId?: string | null
  createdAt: string
  updatedAt: string
}

export interface ProposedEdit {
  op: 'create' | 'modify' | 'delete'
  path: string
  content?: string
  previousContent?: string
  diff: string
}

export interface ToolCall {
  id: string
  callId?: string
  name: string
  args: any
  result?: { text?: string; data?: any } | null
  status: 'pending' | 'running' | 'success' | 'error'
  diff?: ProposedEdit | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  reasoning?: string | null
  meta?: any
  createdAt: string
  toolCalls?: ToolCall[]
}

export interface ChatThreadDetail extends ChatThread {
  messages: ChatMessage[]
}

export interface AgentRun {
  _id: string
  id: string
  mode: CopilotMode
  model: string
  maxMode: boolean
  status: 'queued' | 'running' | 'awaiting_confirm' | 'completed' | 'failed' | 'cancelled'
  prompt: string
  title: string
  parentRunId?: string | null
  diffs?: ProposedEdit[]
  result?: any
  error?: string | null
  tokensIn: number
  tokensOut: number
  iterations: number
  toolCalls?: ToolCall[]
  createdAt: string
}

export interface Plan {
  _id: string
  id: string
  title: string
  content: string
  status: 'draft' | 'ready' | 'building' | 'done'
  projectId?: string | null
  threadId?: string | null
  createdAt: string
  updatedAt: string
}

export type SkillScope = 'always' | 'auto' | 'manual'
export type SkillVisibility = 'private' | 'public'

export interface Skill {
  _id: string
  id: string
  name: string
  slug: string
  description: string
  whenToUse: string
  body: string
  scope: SkillScope
  visibility: SkillVisibility
  official: boolean
  owned: boolean
  editable: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface SkillInput {
  name: string
  description?: string
  whenToUse?: string
  body: string
  scope?: SkillScope
  visibility?: SkillVisibility
}

export interface SecurityFinding {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  rule: string
  title: string
  file?: string
  line?: number
  detail: string
  suggestedFix: string
}

async function aiFetch<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = authApi.getToken()
  const res = await fetch(`${API_BASE_URL}/ai${path}`, {
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

export const aiApi = {
  // Models + settings
  getModels: (refresh = false) => aiFetch<ModelRegistry>(`/models${refresh ? '?refresh=1' : ''}`),
  getSettings: () => aiFetch<AiSettings>('/settings'),
  saveSettings: (body: Partial<AiSettings> & { openRouterKey?: string }) =>
    aiFetch<AiSettings>('/settings', { method: 'PUT', body: JSON.stringify(body) }),

  // Threads
  listThreads: (projectId?: string) =>
    aiFetch<ChatThread[]>(`/threads${projectId ? `?projectId=${projectId}` : ''}`),
  createThread: (body: { projectId?: string; mode?: CopilotMode; model?: string; maxMode?: boolean; title?: string }) =>
    aiFetch<ChatThread>('/threads', { method: 'POST', body: JSON.stringify(body) }),
  getThread: (id: string) => aiFetch<ChatThreadDetail>(`/threads/${id}`),
  patchThread: (id: string, body: { model?: string; maxMode?: boolean; title?: string; mode?: CopilotMode }) =>
    aiFetch<ChatThread>(`/threads/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteThread: (id: string) => aiFetch(`/threads/${id}`, { method: 'DELETE' }),

  // Messages → run
  sendMessage: (
    threadId: string,
    body: { content: string; context?: string; attachments?: any[]; model?: string; maxMode?: boolean; mode?: CopilotMode }
  ) => aiFetch<{ runId: string; userMessageId: string; mode: CopilotMode; model: string }>(`/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  // Runs
  getRun: (id: string) => aiFetch<AgentRun>(`/runs/${id}`),
  listRuns: (q: { threadId?: string; parentRunId?: string }) => {
    const params = new URLSearchParams(q as any).toString()
    return aiFetch<AgentRun[]>(`/runs${params ? `?${params}` : ''}`)
  },
  cancelRun: (id: string) => aiFetch(`/runs/${id}/cancel`, { method: 'POST' }),
  applyRun: (id: string, accept: 'all' | Record<string, 'all' | 'reject' | number[]>) =>
    aiFetch<{ success: boolean; project: Project }>(`/runs/${id}/apply`, { method: 'POST', body: JSON.stringify({ accept }) }),
  undoRun: (id: string) => aiFetch<{ success: boolean; project: Project }>(`/runs/${id}/undo`, { method: 'POST' }),
  deployRun: (id: string) =>
    aiFetch<{ success: boolean; contractAddress?: string; logs?: any[] }>(`/runs/${id}/deploy`, {
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    }),

  // Plans
  listPlans: (q: { projectId?: string; threadId?: string } = {}) => {
    const params = new URLSearchParams(q as any).toString()
    return aiFetch<Plan[]>(`/plans${params ? `?${params}` : ''}`)
  },
  getPlan: (id: string) => aiFetch<Plan>(`/plans/${id}`),
  updatePlan: (id: string, body: { content?: string; title?: string; status?: string }) =>
    aiFetch<Plan>(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  buildPlan: (id: string, body: { model?: string; maxMode?: boolean } = {}) =>
    aiFetch<{ runId: string; threadId: string }>(`/plans/${id}/build`, { method: 'POST', body: JSON.stringify(body) }),
  deletePlan: (id: string) => aiFetch(`/plans/${id}`, { method: 'DELETE' }),

  // Multitask
  multitask: (body: { projectId: string; tasks: { prompt: string; mode?: CopilotMode; model?: string }[]; model?: string; maxMode?: boolean }) =>
    aiFetch<{ parentRunId: string; runIds: string[] }>('/multitask', { method: 'POST', body: JSON.stringify(body) }),

  // Skills (knowledge/instruction packs). Mounted at /api/ai/skills.
  listSkills: (library = false) => aiFetch<{ skills: Skill[] }>(`/skills${library ? '?library=1' : ''}`),
  getSkill: (id: string) => aiFetch<Skill>(`/skills/${id}`),
  createSkill: (body: SkillInput) => aiFetch<Skill>('/skills', { method: 'POST', body: JSON.stringify(body) }),
  updateSkill: (id: string, body: Partial<SkillInput>) =>
    aiFetch<Skill>(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSkill: (id: string) => aiFetch<{ success: boolean }>(`/skills/${id}`, { method: 'DELETE' }),
  toggleSkill: (id: string, enabled: boolean) =>
    aiFetch<Skill>(`/skills/${id}/toggle`, { method: 'POST', body: JSON.stringify({ enabled }) }),
  duplicateSkill: (id: string) => aiFetch<Skill>(`/skills/${id}/duplicate`, { method: 'POST' }),
}

export default aiApi
