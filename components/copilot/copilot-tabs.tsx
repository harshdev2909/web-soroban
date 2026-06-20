"use client"

// Multiple Copilot conversations as switchable tabs (like Cursor). Every tab's
// CopilotPanel stays mounted (inactive ones hidden) so each keeps its own
// messages, mode/model, and in-flight stream when you switch away and back.

import { useRef, useState } from 'react'
import { MessageSquare, Plus, X } from 'lucide-react'
import type { Project, ProjectFile } from '@/lib/api'
import { CopilotPanel } from './copilot-panel'

interface TabItem {
  id: string
  title: string
  /** new tabs start a fresh conversation; the first restores the latest thread */
  fresh: boolean
}

export interface CopilotTabsProps {
  project: Project
  activeFile: ProjectFile | null
  diagnostics: any[]
  ensureProjectSaved: (p: Project) => Promise<Project>
  onApplied: (project: Project) => void
  onDeploy: () => void
  focusSignal?: number
}

export function CopilotTabs(props: CopilotTabsProps) {
  const [tabs, setTabs] = useState<TabItem[]>([{ id: 't1', title: 'Chat', fresh: false }])
  const [activeId, setActiveId] = useState('t1')
  const counter = useRef(1)

  const addTab = () => {
    const id = `t${++counter.current}`
    setTabs((prev) => [...prev, { id, title: 'New chat', fresh: true }])
    setActiveId(id)
  }

  const closeTab = (id: string) => {
    const idx = tabs.findIndex((t) => t.id === id)
    const rest = tabs.filter((t) => t.id !== id)
    if (rest.length === 0) {
      // Never leave zero tabs — replace with a fresh one.
      const nid = `t${++counter.current}`
      setTabs([{ id: nid, title: 'New chat', fresh: true }])
      setActiveId(nid)
      return
    }
    setTabs(rest)
    if (id === activeId) {
      const next = rest[idx] || rest[idx - 1] || rest[0]
      setActiveId(next.id)
    }
  }

  const setTitle = (id: string, title: string) =>
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Tab strip */}
      <div className="flex items-center gap-1 border-b border-border/70 px-1.5 py-1">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const isActive = t.id === activeId
            return (
              <div
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`group flex max-w-[150px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs transition ${
                  isActive
                    ? 'border border-border/80 bg-card text-foreground shadow-sm'
                    : 'border border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                }`}
              >
                <MessageSquare className={`h-3 w-3 shrink-0 ${isActive ? 'text-brand' : ''}`} />
                <span className="truncate">{t.title || 'New chat'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(t.id)
                  }}
                  className={`-mr-0.5 rounded p-0.5 transition hover:bg-muted ${
                    isActive || tabs.length > 1 ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`}
                  title="Close tab"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}
          <button
            onClick={addTab}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            title="New chat tab"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* One mounted panel per tab; inactive hidden to preserve state + streams. */}
      <div className="relative min-h-0 flex-1">
        {tabs.map((t) => (
          <div key={t.id} className={t.id === activeId ? 'h-full' : 'hidden'}>
            <CopilotPanel
              embedded
              active={t.id === activeId}
              freshStart={t.fresh}
              onTitleChange={(title) => setTitle(t.id, title)}
              focusSignal={t.id === activeId ? props.focusSignal : undefined}
              project={props.project}
              activeFile={props.activeFile}
              diagnostics={props.diagnostics}
              ensureProjectSaved={props.ensureProjectSaved}
              onApplied={props.onApplied}
              onDeploy={props.onDeploy}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CopilotTabs
