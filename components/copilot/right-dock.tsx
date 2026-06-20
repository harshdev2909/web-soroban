"use client"

// One docked right panel that hosts both the AI Copilot and the Contract
// invoke/info panel, switched by a segmented control. Both panels stay mounted
// (the inactive one is hidden) so an in-flight Copilot stream survives a tab
// switch over to Contract and back.

import { Activity, PanelRightClose, Sparkles } from 'lucide-react'
import type { Project, ProjectFile } from '@/lib/api'
import { CopilotTabs } from './copilot-tabs'
import { RightPanel } from '@/components/right-panel'

export type DockTab = 'copilot' | 'contract'

export interface RightDockProps {
  tab: DockTab
  onTabChange: (t: DockTab) => void
  onClose: () => void
  project: Project
  activeFile: ProjectFile | null
  diagnostics: any[]
  ensureProjectSaved: (p: Project) => Promise<Project>
  onApplied: (project: Project) => void
  onDeploy: () => void
  focusSignal?: number
  walletAddress?: string
}

export function RightDock(props: RightDockProps) {
  const { tab, onTabChange, onClose, project, walletAddress } = props
  const deployed = Boolean(project.contractAddress)

  const TabButton = ({ id, icon: Icon, label }: { id: DockTab; icon: any; label: string }) => {
    const active = tab === id
    return (
      <button
        onClick={() => onTabChange(id)}
        className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
          active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon className={`h-3.5 w-3.5 ${active ? 'text-brand' : ''}`} />
        {label}
        {id === 'contract' && deployed && (
          <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-success" title="Contract deployed" />
        )}
      </button>
    )
  }

  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      {/* Top bar: segmented control + close */}
      <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
        <div className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-muted/50 p-0.5">
          <TabButton id="copilot" icon={Sparkles} label="Copilot" />
          <TabButton id="contract" icon={Activity} label="Contract" />
        </div>
        <span className="ml-auto rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground">⌘I</span>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          title="Hide panel"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {/* Both panels stay mounted; inactive is hidden to preserve state. */}
      <div className="relative min-h-0 flex-1">
        <div className={tab === 'copilot' ? 'h-full' : 'hidden'}>
          <CopilotTabs
            project={project}
            activeFile={props.activeFile}
            diagnostics={props.diagnostics}
            ensureProjectSaved={props.ensureProjectSaved}
            onApplied={props.onApplied}
            onDeploy={props.onDeploy}
            focusSignal={props.focusSignal}
          />
        </div>
        <div className={tab === 'contract' ? 'h-full' : 'hidden'}>
          <RightPanel embedded project={project} walletAddress={walletAddress} />
        </div>
      </div>
    </div>
  )
}

export default RightDock
