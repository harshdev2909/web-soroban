"use client"

import { Bot, Bug, ChevronDown, ListChecks, Layers, MessageCircleQuestion } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CopilotMode } from '@/lib/aiApi'

export const MODES: { id: CopilotMode; label: string; icon: any; desc: string }[] = [
  { id: 'agent', label: 'Agent', icon: Bot, desc: 'Generate & edit code, self-correct against compile + tests' },
  { id: 'ask', label: 'Ask', icon: MessageCircleQuestion, desc: 'Read-only — answers questions about your contract' },
  { id: 'plan', label: 'Plan', icon: ListChecks, desc: 'Research, then write an editable build plan' },
  { id: 'debug', label: 'Debug', icon: Bug, desc: 'Diagnose a failure, propose a minimal fix' },
  { id: 'multitask', label: 'Multitask', icon: Layers, desc: 'Run several agents in parallel on sub-tasks' },
]

export const MODE_ORDER: CopilotMode[] = ['agent', 'ask', 'plan', 'debug', 'multitask']

export function nextMode(mode: CopilotMode): CopilotMode {
  const i = MODE_ORDER.indexOf(mode)
  return MODE_ORDER[(i + 1) % MODE_ORDER.length]
}

export function ModeSelector({ mode, onChange }: { mode: CopilotMode; onChange: (m: CopilotMode) => void }) {
  const current = MODES.find((m) => m.id === mode) || MODES[0]
  const Icon = current.icon
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground transition hover:border-brand/50 hover:bg-accent">
          <Icon className="h-3.5 w-3.5 text-brand" />
          {current.label}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          Mode · <kbd className="rounded bg-muted px-1">⇧Tab</kbd> to rotate
        </div>
        {MODES.map((m) => {
          const MIcon = m.icon
          return (
            <DropdownMenuItem key={m.id} onClick={() => onChange(m.id)} className="flex items-start gap-2 py-2">
              <MIcon className={`mt-0.5 h-4 w-4 ${m.id === mode ? 'text-brand' : 'text-muted-foreground'}`} />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">{m.label}</span>
                <span className="text-[11px] text-muted-foreground">{m.desc}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ModeSelector
