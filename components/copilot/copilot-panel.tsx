"use client"

/**
 * The docked AI Copilot — Cursor-style chat/agent panel.
 *
 * Streams tokens + reasoning + tool steps over Socket.IO, renders a tool-step
 * timeline and collapsible reasoning, and surfaces every edit as a reviewable
 * diff (per-hunk accept/reject + undo). Mode (Agent/Ask/Plan/Debug/Multitask)
 * is enforced server-side; switching mode starts a fresh thread (context window).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  AtSign, Bot, Brain, ChevronDown, ChevronRight, FileCode2, FolderClosed, Hammer,
  Loader2, Plus, Rocket, Search, ShieldCheck, Slash, Sparkles, SquareTerminal,
  StopCircle, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { pathOf } from '@/lib/paths'
import type { Project, ProjectFile } from '@/lib/api'
import {
  aiApi, type AgentRun, type ChatMessage, type ChatThreadDetail, type CopilotMode,
  type ModelRegistry, type ProposedEdit, type ToolCall,
} from '@/lib/aiApi'
import { socketService } from '@/lib/socket'
import { Markdown } from './markdown'
import { DiffView, type AcceptPayload } from './diff-view'
import { ModeSelector, nextMode } from './mode-selector'
import { ModelSwitcher } from './model-switcher'

// ------- slash commands ------------------------------------------------------
interface SlashCmd { id: string; label: string; hint: string; mode: CopilotMode; template: string; attach?: 'errors' | 'file' }
const SLASH: SlashCmd[] = [
  { id: 'generate', label: '/generate', hint: 'NL → new contract', mode: 'agent', template: 'Generate a new Soroban contract that ' },
  { id: 'fix', label: '/fix', hint: 'resolve current errors', mode: 'debug', template: 'Fix the current compile errors.', attach: 'errors' },
  { id: 'optimize', label: '/optimize', hint: 'size, storage, host calls', mode: 'agent', template: 'Optimize this contract for wasm size, storage/CPU, and fewer host calls.', attach: 'file' },
  { id: 'audit', label: '/audit', hint: 'security review', mode: 'debug', template: 'Run a full security audit of this contract and report findings with fixes.' },
  { id: 'test', label: '/test', hint: 'write unit + integration tests', mode: 'agent', template: 'Write unit and integration tests for this contract, then run them.', attach: 'file' },
  { id: 'explain', label: '/explain', hint: 'explain the code', mode: 'ask', template: 'Explain how this contract works.', attach: 'file' },
  { id: 'doc', label: '/doc', hint: 'add doc comments', mode: 'agent', template: 'Add doc comments to the public functions.', attach: 'file' },
  { id: 'refactor', label: '/refactor', hint: 'restructure cleanly', mode: 'agent', template: 'Refactor this contract for clarity and idiomatic soroban-sdk.', attach: 'file' },
  { id: 'spec', label: '/spec', hint: 'summarize the interface', mode: 'ask', template: 'Summarize this contract’s interface (functions, inputs, outputs).' },
  { id: 'plan', label: '/plan', hint: 'write a build plan', mode: 'plan', template: 'Plan how to ' },
  { id: 'deploy', label: '/deploy', hint: 'deploy to testnet (confirm)', mode: 'agent', template: '__deploy__' },
]

// ------- context chips -------------------------------------------------------
interface Chip { kind: 'file' | 'folder' | 'symbol' | 'errors' | 'selection' | 'docs'; label: string; value: string }

interface LiveTool { callId: string; name: string; args: any; status: 'running' | 'success' | 'error'; summary?: string; data?: any; edit?: ProposedEdit }
interface Live {
  runId: string
  content: string
  reasoning: string
  tools: LiveTool[]
  status: string
  done: boolean
  edits?: ProposedEdit[]
  planId?: string
  error?: string
}

const QUICK_ICON: Record<string, any> = {
  generate: Sparkles, fix: Hammer, audit: ShieldCheck, test: SquareTerminal, explain: Search,
}

const TOOL_ICON: Record<string, any> = {
  read_file: FileCode2, list_files: FolderClosed, search_codebase: Search, get_errors: SquareTerminal,
  get_contract_spec: FileCode2, fetch_docs: Search, create_file: FileCode2, propose_edit: FileCode2,
  delete_file: X, run_compile: Hammer, run_tests: SquareTerminal, run_clippy: ShieldCheck, run_security_audit: ShieldCheck,
}

function toolLabel(t: { name: string; args?: any }): string {
  const p = t.args?.path
  switch (t.name) {
    case 'read_file': return `Read ${p || 'file'}`
    case 'list_files': return 'Listed files'
    case 'search_codebase': return `Searched “${t.args?.query || ''}”`
    case 'get_errors': return 'Read diagnostics'
    case 'get_contract_spec': return 'Read contract spec'
    case 'fetch_docs': return `Fetched docs: ${t.args?.query || ''}`
    case 'create_file': return `Created ${p || 'file'}`
    case 'propose_edit': return `Edited ${p || 'file'}`
    case 'delete_file': return `Deleted ${p || 'file'}`
    case 'run_compile': return 'Ran compile'
    case 'run_tests': return 'Ran tests'
    case 'run_clippy': return 'Ran clippy'
    case 'run_security_audit': return 'Ran security audit'
    default: return t.name
  }
}

function ToolStep({ name, args, status, summary, data }: { name: string; args: any; status: string; summary?: string; data?: any }) {
  const [open, setOpen] = useState(false)
  const Icon = TOOL_ICON[name] || SquareTerminal
  const findings = data?.findings as any[] | undefined
  return (
    <div className="rounded-md border border-border/60 bg-card/40">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[12px] text-foreground/90">{toolLabel({ name, args })}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {status === 'running' ? (
            <Loader2 className="h-3 w-3 animate-spin text-brand" />
          ) : (
            <span className={`h-1.5 w-1.5 rounded-full ${status === 'error' ? 'bg-destructive' : 'bg-success'}`} />
          )}
          {(summary || findings) && <ChevronRight className={`h-3 w-3 text-muted-foreground transition ${open ? 'rotate-90' : ''}`} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-border/40 px-2.5 py-2">
          {findings && findings.length > 0 ? (
            <div className="space-y-1.5">
              {findings.map((f, i) => (
                <div key={i} className="text-[11px]">
                  <span className={`mr-1 rounded px-1 text-[9px] font-semibold uppercase ${
                    f.severity === 'critical' || f.severity === 'high' ? 'bg-destructive/20 text-destructive'
                      : f.severity === 'medium' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                  }`}>{f.severity}</span>
                  <span className="text-foreground">{f.title}</span>
                  {f.file && <span className="text-muted-foreground"> · {f.file}:{f.line ?? '?'}</span>}
                  <div className="text-muted-foreground">Fix: {f.suggestedFix}</div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">{summary}</pre>
          )}
        </div>
      )}
    </div>
  )
}

function Reasoning({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  if (!text) return null
  return (
    <div className="mb-1.5">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
        <Brain className="h-3 w-3" />
        {open ? 'Hide reasoning' : 'Show reasoning'}
        <ChevronDown className={`h-3 w-3 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-1 border-l-2 border-border pl-2 text-[11px] italic leading-relaxed text-muted-foreground">
          {text}
        </div>
      )}
    </div>
  )
}

export interface CopilotPanelProps {
  project: Project
  activeFile: ProjectFile | null
  diagnostics: any[]
  ensureProjectSaved: (p: Project) => Promise<Project>
  onApplied: (project: Project) => void
  onClose?: () => void
  onDeploy: () => void
  /** increment to focus the composer (⌘I) */
  focusSignal?: number
  /** rendered inside the shared right-dock (the dock owns the title + close) */
  embedded?: boolean
  /** this panel is the visible tab (gates focus to the active conversation) */
  active?: boolean
  /** start a brand-new conversation instead of restoring the latest thread */
  freshStart?: boolean
  /** report this conversation's title up to the tab strip */
  onTitleChange?: (title: string) => void
}

function deriveTitle(s: string): string {
  const t = (s || '').trim().replace(/\s+/g, ' ')
  return t.length > 32 ? t.slice(0, 30) + '…' : t || 'New chat'
}

export function CopilotPanel(props: CopilotPanelProps) {
  const { project, activeFile, diagnostics, ensureProjectSaved, onApplied, onClose, onDeploy, focusSignal, embedded } = props
  const { active = true, freshStart, onTitleChange } = props

  const [mode, setMode] = useState<CopilotMode>('agent')
  const [model, setModel] = useState('auto')
  const [maxMode, setMaxMode] = useState(false)
  const [registry, setRegistry] = useState<ModelRegistry | null>(null)
  const [thread, setThread] = useState<ChatThreadDetail | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [chips, setChips] = useState<Chip[]>([])
  const [live, setLive] = useState<Live | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [runData, setRunData] = useState<Record<string, { edits: ProposedEdit[]; applied: boolean; applying?: boolean }>>({})
  const [slashOpen, setSlashOpen] = useState(false)
  const [ctxOpen, setCtxOpen] = useState(false)
  const [multitask, setMultitask] = useState<{ parentRunId: string; runs: AgentRun[] } | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const unsubRef = useRef<null | (() => void)>(null)
  // Mirror of `live` so socket handlers mutate/read it WITHOUT doing side effects
  // inside a React state-updater (which StrictMode double-invokes → dupes).
  const liveRef = useRef<Live | null>(null)
  const projectFiles = project.files || []

  // ---- bootstrap: settings, models, latest thread -------------------------
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [settings, reg, threads] = await Promise.all([
          aiApi.getSettings().catch(() => null),
          aiApi.getModels().catch(() => null),
          aiApi.listThreads(project._id).catch(() => []),
        ])
        if (!alive) return
        if (settings) {
          setMode(settings.mode)
          setModel(settings.selectedModel)
          setMaxMode(settings.maxMode)
        }
        if (reg) setRegistry(reg)
        // New tabs start fresh; the first tab restores the latest conversation.
        if (!freshStart && threads && threads.length) {
          const detail = await aiApi.getThread(threads[0].id).catch(() => null)
          if (detail && alive) {
            setThread(detail)
            setMessages(detail.messages || [])
            setMode(detail.mode)
            setModel(detail.model)
            setMaxMode(detail.maxMode)
            if (detail.title && detail.messages?.length) onTitleChange?.(detail.title)
          }
        }
      } catch { /* offline-tolerant */ }
    })()
    return () => {
      alive = false
      unsubRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id])

  // Focus on ⌘I — only the active tab.
  useEffect(() => {
    if (focusSignal && active) textareaRef.current?.focus()
  }, [focusSignal, active])

  // Auto-scroll to the latest content.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, live])

  // Lazily hydrate diffs for historical assistant messages that produced edits.
  useEffect(() => {
    const missing = messages.filter(
      (m) => m.role === 'assistant' && m.meta?.runId && m.meta?.editCount > 0 && !runData[m.meta.runId]
    )
    if (!missing.length) return
    ;(async () => {
      for (const m of missing) {
        try {
          const run = await aiApi.getRun(m.meta.runId)
          setRunData((prev) => ({ ...prev, [m.meta.runId]: { edits: run.diffs || [], applied: !!run.result?.applied } }))
        } catch { /* ignore */ }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  // ---- context resolution -------------------------------------------------
  const addChip = (chip: Chip) => {
    setChips((prev) => (prev.some((c) => c.kind === chip.kind && c.value === chip.value) ? prev : [...prev, chip]))
    setCtxOpen(false)
  }

  const resolveContext = (): string => {
    const parts: string[] = []
    for (const c of chips) {
      if (c.kind === 'file') {
        const f = projectFiles.find((x) => pathOf(x) === c.value)
        if (f) parts.push(`// FILE ${c.value}\n${(f.content || '').slice(0, 12000)}`)
      } else if (c.kind === 'folder') {
        const inDir = projectFiles.filter((x) => pathOf(x).startsWith(c.value + '/')).map((x) => pathOf(x))
        parts.push(`// FOLDER ${c.value}\n${inDir.join('\n')}`)
      } else if (c.kind === 'selection') {
        parts.push(`// SELECTION (${c.value})\n${(activeFile?.content || '').slice(0, 12000)}`)
      } else if (c.kind === 'errors') {
        parts.push(`// CURRENT DIAGNOSTICS\n${(diagnostics || []).map((d) => `${d.level} ${d.file || '?'}:${d.line ?? '?'} ${d.message}`).join('\n') || 'none'}`)
      } else if (c.kind === 'symbol') {
        const hits = projectFiles.flatMap((f) =>
          (f.content || '').split('\n').map((l, i) => ({ f: pathOf(f), i, l })).filter((x) => x.l.includes(c.value))
        ).slice(0, 20)
        parts.push(`// SYMBOL ${c.value}\n${hits.map((h) => `${h.f}:${h.i + 1}: ${h.l.trim()}`).join('\n')}`)
      } else if (c.kind === 'docs') {
        parts.push(`// DOCS topic: ${c.value}`)
      }
    }
    return parts.join('\n\n')
  }

  // ---- sending ------------------------------------------------------------
  const applySlash = (cmd: SlashCmd) => {
    setSlashOpen(false)
    if (cmd.template === '__deploy__') {
      onDeploy()
      setInput('')
      return
    }
    setMode(cmd.mode)
    setInput(cmd.template)
    if (cmd.attach === 'errors') addChip({ kind: 'errors', label: '@errors', value: 'errors' })
    if (cmd.attach === 'file' && activeFile) addChip({ kind: 'file', label: `@${pathOf(activeFile)}`, value: pathOf(activeFile) })
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const startStream = (runId: string) => {
    const initial: Live = { runId, content: '', reasoning: '', tools: [], status: 'queued', done: false }
    liveRef.current = initial
    setLive(initial)
    unsubRef.current?.()
    // Plain socket callback (fires once per event) — NOT a React state updater, so
    // side effects like finalizeRun run exactly once.
    unsubRef.current = socketService.subscribeToRun(runId, (type, payload) => {
      const cur = liveRef.current
      if (!cur || cur.runId !== runId) return

      // AI-generated conversation/tab title (first turn). Doesn't touch `live`.
      if (type === 'title') {
        if (payload?.title) onTitleChange?.(payload.title)
        return
      }

      if (type === 'token') {
        cur.content += payload.delta || ''
      } else if (type === 'reasoning') {
        cur.reasoning += payload.delta || ''
      } else if (type === 'tool') {
        if (payload.phase === 'call') {
          cur.tools = [...cur.tools, { callId: payload.callId, name: payload.name, args: payload.args, status: 'running' }]
        } else if (payload.phase === 'result') {
          const idx = cur.tools.findIndex((t) => t.callId === payload.callId)
          const updated: LiveTool = {
            callId: payload.callId, name: payload.name, args: idx >= 0 ? cur.tools[idx].args : {},
            status: payload.ok ? 'success' : 'error', summary: payload.summary, data: payload.data, edit: payload.edit,
          }
          const tools = [...cur.tools]
          if (idx >= 0) tools[idx] = updated
          else tools.push(updated)
          cur.tools = tools
        }
      } else if (type === 'status') {
        cur.status = payload.phase
        if (payload.phase === 'done') {
          cur.done = true
          if (payload.title) onTitleChange?.(payload.title)
          finalizeRun(runId, cur, payload.edits || [], payload.planId)
          return
        }
        if (payload.phase === 'failed') {
          cur.error = payload.message
          cur.done = true
          setIsRunning(false)
        }
      } else if (type === 'error') {
        cur.error = payload.message
        cur.done = true
      }
      setLive({ ...cur })
    })
  }

  const finalizeRun = (runId: string, current: Live, edits: ProposedEdit[], planId?: string) => {
    // Persist a final assistant message into the local list + store its edits.
    const toolCalls: ToolCall[] = current.tools.map((t) => ({
      id: t.callId, callId: t.callId, name: t.name, args: t.args,
      result: { text: t.summary, data: t.data }, status: t.status, diff: t.edit || null,
    }))
    setMessages((prev) => {
      // Guard against a stray double-finalize: never append the same runId twice.
      if (prev.some((m) => m.id === `live-${runId}`)) return prev
      return [
        ...prev,
        {
          id: `live-${runId}`, role: 'assistant', content: current.content, reasoning: current.reasoning,
          meta: { runId, editCount: edits.length, planId }, createdAt: new Date().toISOString(), toolCalls,
        },
      ]
    })
    if (edits.length) setRunData((prev) => ({ ...prev, [runId]: { edits, applied: false } }))
    liveRef.current = null
    setLive(null)
    setIsRunning(false)
    unsubRef.current?.()
    unsubRef.current = null
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isRunning) return

    // Multitask: each non-empty line becomes a parallel sub-task.
    if (mode === 'multitask') {
      const tasks = text.split('\n').map((l) => l.trim()).filter(Boolean).map((prompt) => ({ prompt }))
      if (!tasks.length) return
      try {
        const saved = await ensureProjectSaved(project)
        setIsRunning(true)
        const res = await aiApi.multitask({ projectId: saved._id, tasks, model, maxMode })
        setInput('')
        pollMultitask(res.parentRunId)
      } catch (e: any) {
        toast.error(e.message || 'Failed to start multitask')
        setIsRunning(false)
      }
      return
    }

    try {
      const saved = await ensureProjectSaved(project)
      // Ensure a thread that matches the current mode (mode switch = fresh context).
      let t = thread
      if (!t || t.mode !== mode || t.projectId !== saved._id) {
        const created = await aiApi.createThread({ projectId: saved._id, mode, model, maxMode })
        t = { ...created, messages: [] }
        setThread(t)
        setMessages([])
      }
      // Title the tab from the first prompt.
      if (messages.length === 0) onTitleChange?.(deriveTitle(text))
      const context = resolveContext()
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: 'user', content: text, meta: { attachments: chips }, createdAt: new Date().toISOString() },
      ])
      setInput('')
      setIsRunning(true)
      const res = await aiApi.sendMessage(t.id, { content: text, context, attachments: chips, model, maxMode, mode })
      setChips([])
      startStream(res.runId)
    } catch (e: any) {
      toast.error(e.message || 'Failed to send')
      setIsRunning(false)
    }
  }

  const pollMultitask = (parentRunId: string) => {
    setMultitask({ parentRunId, runs: [] })
    const tick = async () => {
      try {
        const runs = await aiApi.listRuns({ parentRunId })
        setMultitask({ parentRunId, runs })
        const active = runs.some((r) => r.status === 'queued' || r.status === 'running')
        if (active) setTimeout(tick, 1800)
        else setIsRunning(false)
      } catch {
        setIsRunning(false)
      }
    }
    tick()
  }

  const cancelRun = async () => {
    if (live?.runId) {
      try { await aiApi.cancelRun(live.runId) } catch { /* ignore */ }
    }
    setIsRunning(false)
  }

  const applyEdits = async (runId: string, accept: AcceptPayload) => {
    setRunData((prev) => ({ ...prev, [runId]: { ...prev[runId], applying: true } }))
    try {
      const res = await aiApi.applyRun(runId, accept)
      onApplied(res.project)
      setRunData((prev) => ({ ...prev, [runId]: { ...prev[runId], applied: true, applying: false } }))
      toast.success('Applied changes')
    } catch (e: any) {
      toast.error(e.message || 'Failed to apply')
      setRunData((prev) => ({ ...prev, [runId]: { ...prev[runId], applying: false } }))
    }
  }

  const undoEdits = async (runId: string) => {
    setRunData((prev) => ({ ...prev, [runId]: { ...prev[runId], applying: true } }))
    try {
      const res = await aiApi.undoRun(runId)
      onApplied(res.project)
      setRunData((prev) => ({ ...prev, [runId]: { ...prev[runId], applied: false, applying: false } }))
      toast.success('Reverted to checkpoint')
    } catch (e: any) {
      toast.error(e.message || 'Failed to undo')
      setRunData((prev) => ({ ...prev, [runId]: { ...prev[runId], applying: false } }))
    }
  }

  const newChat = async () => {
    unsubRef.current?.()
    setThread(null)
    setMessages([])
    setLive(null)
    setMultitask(null)
    setChips([])
    onTitleChange?.('New chat')
  }

  const buildPlan = async (planId: string) => {
    try {
      const res = await aiApi.buildPlan(planId, { model, maxMode })
      toast.success('Building plan…')
      const detail = await aiApi.getThread(res.threadId)
      setThread(detail)
      setMessages(detail.messages || [])
      setMode('agent')
      setIsRunning(true)
      startStream(res.runId)
    } catch (e: any) {
      toast.error(e.message || 'Failed to build plan')
    }
  }

  // textarea keys: Enter to send, Shift+Enter newline, Shift+Tab rotate mode.
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      setMode((m) => nextMode(m))
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === '/' && input === '') setSlashOpen(true)
    if (e.key === '@') setCtxOpen(true)
  }

  const folders = useMemo(() => {
    const set = new Set<string>()
    for (const f of projectFiles) {
      const segs = pathOf(f).split('/')
      segs.pop()
      let acc = ''
      for (const s of segs) { acc = acc ? `${acc}/${s}` : s; set.add(acc) }
    }
    return [...set].sort()
  }, [projectFiles])

  const isEmpty = messages.length === 0 && !live && !multitask

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header — only the standalone panel renders one; embedded panels live in
          a tab strip (CopilotTabs) which owns the title + new-tab controls. */}
      {!embedded && (
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Sparkles className="h-4 w-4 text-brand" />
          <span className="text-sm font-semibold text-foreground">Copilot</span>
          <span className="rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground">⌘I</span>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={newChat} title="New chat">
              <Plus className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} title="Close">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {isEmpty && (
          <div className="flex h-full flex-col items-center justify-center px-1 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 -z-10 rounded-full bg-brand/25 blur-2xl" aria-hidden />
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/25 to-brand/5 shadow-lg shadow-brand/10">
                <Sparkles className="h-7 w-7 text-brand" />
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground">Soroban Copilot</p>
            <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
              Generate, debug, and optimize contracts. Every edit is validated against the real compile + security pipeline.
            </p>
            <div className="mt-5 w-full max-w-[290px] space-y-1.5">
              {SLASH.filter((s) => ['generate', 'fix', 'audit', 'test', 'explain'].includes(s.id)).map((s) => {
                const Icon = QUICK_ICON[s.id] || Sparkles
                return (
                  <button
                    key={s.id}
                    onClick={() => applySlash(s)}
                    className="group flex w-full items-center gap-2.5 rounded-lg border border-border/70 bg-card/50 px-3 py-2 text-left transition hover:border-brand/40 hover:bg-accent"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-brand/15 group-hover:text-brand">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-mono text-[12px] font-medium text-foreground">{s.label}</span>
                      <span className="truncate text-[10px] text-muted-foreground">{s.hint}</span>
                    </span>
                    <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <MessageView
            key={m.id}
            message={m}
            runData={m.meta?.runId ? runData[m.meta.runId] : undefined}
            onApply={(accept) => applyEdits(m.meta.runId, accept)}
            onUndo={() => undoEdits(m.meta.runId)}
            onBuildPlan={m.meta?.planId ? () => buildPlan(m.meta.planId) : undefined}
          />
        ))}

        {/* Live streaming turn */}
        {live && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-brand/15 text-brand"><Bot className="h-3 w-3" /></span>
              <span className="font-medium text-foreground/80">Assistant</span>
              {!live.done && <span className="flex items-center gap-1 text-brand"><Loader2 className="h-3 w-3 animate-spin" /> thinking…</span>}
            </div>
            {live.reasoning && <Reasoning text={live.reasoning} />}
            {live.tools.length > 0 && (
              <div className="space-y-1.5">
                {live.tools.map((t) => (
                  <ToolStep key={t.callId} name={t.name} args={t.args} status={t.status} summary={t.summary} data={t.data} />
                ))}
              </div>
            )}
            {live.content && <Markdown content={live.content} />}
            {live.error && <p className="text-xs text-destructive">{live.error}</p>}
          </div>
        )}

        {/* Multitask dashboard */}
        {multitask && <MultitaskDashboard runs={multitask.runs} onApply={applyEdits} runData={runData} setRunData={setRunData} />}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-2.5">
        {/* Attached context chips */}
        {chips.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {chips.map((c, i) => (
              <span key={i} className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] text-brand">
                {c.label}
                <button onClick={() => setChips((prev) => prev.filter((_, j) => j !== i))}><X className="h-2.5 w-2.5" /></button>
              </span>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-border bg-card/70 shadow-sm transition focus-within:border-border">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            placeholder={mode === 'multitask' ? 'One sub-task per line…' : 'Ask, generate, or describe a change…  / for commands, @ for context'}
            className="w-full resize-none bg-transparent px-3 py-2.5 text-[13px] text-foreground outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
          />
          <div className="flex items-center gap-1.5 px-2 pb-2">
            <ModeSelector mode={mode} onChange={setMode} />
            {/* Slash menu */}
            <Popover open={slashOpen} onOpenChange={setSlashOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground" title="Commands">
                  <Slash className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-0">
                <Command>
                  <CommandInput placeholder="Slash command…" />
                  <CommandList>
                    <CommandEmpty>No command.</CommandEmpty>
                    <CommandGroup>
                      {SLASH.map((s) => (
                        <CommandItem key={s.id} value={s.label} onSelect={() => applySlash(s)}>
                          <span className="font-mono text-xs text-foreground">{s.label}</span>
                          <span className="ml-auto text-[10px] text-muted-foreground">{s.hint}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* @ context */}
            <Popover open={ctxOpen} onOpenChange={setCtxOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground" title="Add context">
                  <AtSign className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-0">
                <Command>
                  <CommandInput placeholder="Add @context…" />
                  <CommandList className="max-h-72">
                    <CommandEmpty>Nothing found.</CommandEmpty>
                    <CommandGroup heading="Quick">
                      <CommandItem value="@errors" onSelect={() => addChip({ kind: 'errors', label: '@errors', value: 'errors' })}>
                        <SquareTerminal className="mr-2 h-3.5 w-3.5" /> @errors <span className="ml-auto text-[10px] text-muted-foreground">current diagnostics</span>
                      </CommandItem>
                      {activeFile && (
                        <CommandItem value="@selection" onSelect={() => addChip({ kind: 'selection', label: `@selection`, value: pathOf(activeFile) })}>
                          <FileCode2 className="mr-2 h-3.5 w-3.5" /> @selection <span className="ml-auto text-[10px] text-muted-foreground">{pathOf(activeFile)}</span>
                        </CommandItem>
                      )}
                      <CommandItem value="@docs storage ttl" onSelect={() => addChip({ kind: 'docs', label: '@docs', value: 'storage ttl auth events' })}>
                        <Search className="mr-2 h-3.5 w-3.5" /> @docs <span className="ml-auto text-[10px] text-muted-foreground">Soroban docs</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Files">
                      {projectFiles.map((f) => (
                        <CommandItem key={pathOf(f)} value={`file ${pathOf(f)}`} onSelect={() => addChip({ kind: 'file', label: `@${pathOf(f)}`, value: pathOf(f) })}>
                          <FileCode2 className="mr-2 h-3.5 w-3.5" /> {pathOf(f)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {folders.length > 0 && (
                      <CommandGroup heading="Folders">
                        {folders.map((d) => (
                          <CommandItem key={d} value={`folder ${d}`} onSelect={() => addChip({ kind: 'folder', label: `@${d}/`, value: d })}>
                            <FolderClosed className="mr-2 h-3.5 w-3.5" /> {d}/
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="ml-auto flex items-center gap-1.5">
              <ModelSwitcher registry={registry} model={model} maxMode={maxMode} onModel={setModel} onMaxMode={setMaxMode} />
              {isRunning ? (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={cancelRun} title="Stop">
                  <StopCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="icon" className="h-7 w-7" onClick={handleSend} disabled={!input.trim()} title="Send (↵)">
                  <Rocket className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-1 px-1 text-[10px] text-muted-foreground">
          {mode === 'ask' ? 'Read-only.' : mode === 'plan' ? 'Writes a plan, no code edits.' : 'Edits shown as diffs you review.'} Testnet only.
        </p>
      </div>

    </div>
  )
}

// ---- a single message ------------------------------------------------------
function MessageView({
  message, runData, onApply, onUndo, onBuildPlan,
}: {
  message: ChatMessage
  runData?: { edits: ProposedEdit[]; applied: boolean; applying?: boolean }
  onApply: (accept: AcceptPayload) => void
  onUndo: () => void
  onBuildPlan?: () => void
}) {
  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[90%] rounded-2xl rounded-br-md border border-brand/20 bg-gradient-to-br from-brand/15 to-brand/5 px-3.5 py-2 text-[13px] leading-relaxed text-foreground shadow-sm">
          {message.content}
        </div>
        {Array.isArray(message.meta?.attachments) && message.meta.attachments.length > 0 && (
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            {message.meta.attachments.map((a: any, i: number) => (
              <span key={i} className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{a.label}</span>
            ))}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-brand/15 text-brand"><Bot className="h-3 w-3" /></span>
        <span className="font-medium text-foreground/80">Assistant</span>
        {message.meta?.model && <span className="text-[10px]">· {String(message.meta.model).split('/').pop()}</span>}
      </div>
      {message.reasoning && <Reasoning text={message.reasoning} />}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="space-y-1.5">
          {message.toolCalls.map((t) => (
            <ToolStep key={t.id} name={t.name} args={t.args} status={t.status} summary={t.result?.text} data={t.result?.data} />
          ))}
        </div>
      )}
      {message.content && <Markdown content={message.content} />}
      {onBuildPlan && (
        <Button size="sm" className="mt-1 gap-1.5" onClick={onBuildPlan}>
          <Hammer className="h-3.5 w-3.5" /> Build this plan
        </Button>
      )}
      {runData && runData.edits.length > 0 && (
        <DiffView edits={runData.edits} applied={runData.applied} applying={runData.applying} onApply={onApply} onUndo={onUndo} />
      )}
    </div>
  )
}

// ---- multitask dashboard ---------------------------------------------------
function MultitaskDashboard({
  runs, onApply, runData, setRunData,
}: {
  runs: AgentRun[]
  onApply: (runId: string, accept: AcceptPayload) => void
  runData: Record<string, { edits: ProposedEdit[]; applied: boolean; applying?: boolean }>
  setRunData: React.Dispatch<React.SetStateAction<Record<string, { edits: ProposedEdit[]; applied: boolean; applying?: boolean }>>>
}) {
  const loadDiffs = async (runId: string) => {
    try {
      const run = await aiApi.getRun(runId)
      setRunData((prev) => ({ ...prev, [runId]: { edits: run.diffs || [], applied: !!run.result?.applied } }))
    } catch { /* ignore */ }
  }
  return (
    <div className="rounded-lg border border-border bg-card/40 p-2.5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Loader2 className={`h-3.5 w-3.5 ${runs.some((r) => r.status === 'running' || r.status === 'queued') ? 'animate-spin text-brand' : 'text-success'}`} />
        Multitask · {runs.length} agents
      </div>
      <div className="space-y-1.5">
        {runs.map((r) => {
          const dot = r.status === 'completed' ? 'bg-success' : r.status === 'failed' ? 'bg-destructive' : 'bg-brand animate-pulse'
          const data = runData[r.id]
          return (
            <div key={r.id} className="rounded-md border border-border/60 bg-background px-2.5 py-1.5">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <span className="truncate text-[12px] text-foreground">{r.title || r.prompt}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{r.status}</span>
                {r.status === 'completed' && !data && (
                  <button onClick={() => loadDiffs(r.id)} className="text-[10px] text-brand hover:underline">view diffs</button>
                )}
              </div>
              {data && data.edits.length > 0 && (
                <DiffView edits={data.edits} applied={data.applied} applying={data.applying} onApply={(a) => onApply(r.id, a)} onUndo={() => {}} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CopilotPanel
