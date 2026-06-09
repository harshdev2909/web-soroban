"use client"

import { AlertCircle, AlertTriangle, Check, Terminal, PanelRightOpen, PanelRightClose, Cloud, CloudOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBarProps {
  language: string
  cursor: { line: number; col: number }
  charCount: number
  lineCount: number
  errors: number
  warnings: number
  network?: string
  version?: string
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  consoleOpen: boolean
  onToggleConsole: () => void
  rightPanelOpen: boolean
  onToggleRightPanel: () => void
}

/**
 * Single full-width IDE status bar. Consolidates language/encoding/indent,
 * cursor position, document metrics, problem counts, network, and version —
 * the scattered status chips that used to live in the editor + right panel.
 */
export function StatusBar({
  language,
  cursor,
  charCount,
  lineCount,
  errors,
  warnings,
  network = "Testnet",
  version = "v1.0.0",
  saveStatus = 'idle',
  consoleOpen,
  onToggleConsole,
  rightPanelOpen,
  onToggleRightPanel,
}: StatusBarProps) {
  const Sep = () => <span className="h-3 w-px bg-border/70" aria-hidden />

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border bg-card/60 px-3 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
      {/* Left: document/source facts */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleConsole}
          className={cn(
            "flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-accent hover:text-foreground",
            consoleOpen && "text-foreground",
          )}
          aria-pressed={consoleOpen}
          title="Toggle console (logs)"
        >
          <Terminal className="h-3 w-3" />
          <span className="hidden sm:inline">Console</span>
        </button>
        <Sep />
        <span className="flex items-center gap-1.5 text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {language}
        </span>
        <Sep />
        <span className="hidden md:inline">UTF-8</span>
        <span className="hidden md:inline-flex"><Sep /></span>
        <span className="hidden md:inline">LF</span>
        <span className="hidden lg:inline-flex"><Sep /></span>
        <span className="hidden lg:inline">Spaces: 4</span>
        {saveStatus !== 'idle' && (
          <>
            <Sep />
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Saving…</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-success">
                <Cloud className="h-3 w-3" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-destructive">
                <CloudOff className="h-3 w-3" />
                <span className="hidden sm:inline">Save failed</span>
              </span>
            )}
          </>
        )}
      </div>

      {/* Right: position, metrics, problems, network */}
      <div className="flex items-center gap-2.5">
        <span className="font-mono-tnum tabular-nums">
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <span className="hidden sm:inline-flex"><Sep /></span>
        <span className="hidden font-mono-tnum tabular-nums sm:inline">
          {charCount.toLocaleString()} chars · {lineCount.toLocaleString()} lines
        </span>
        <Sep />
        {/* Problems — click jumps to console */}
        <button
          onClick={onToggleConsole}
          className="flex items-center gap-2 rounded px-1.5 py-0.5 transition-colors hover:bg-accent hover:text-foreground"
          title={`${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`}
        >
          {errors === 0 && warnings === 0 ? (
            <span className="flex items-center gap-1 text-success">
              <Check className="h-3 w-3" /> 0
            </span>
          ) : (
            <>
              <span className={cn("flex items-center gap-1", errors > 0 ? "text-destructive" : "")}>
                <AlertCircle className="h-3 w-3" /> {errors}
              </span>
              <span className={cn("flex items-center gap-1", warnings > 0 ? "text-warning" : "")}>
                <AlertTriangle className="h-3 w-3" /> {warnings}
              </span>
            </>
          )}
        </button>
        <Sep />
        <span className="flex items-center gap-1.5 text-success">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          {network}
        </span>
        <span className="hidden sm:inline-flex"><Sep /></span>
        <span className="hidden sm:inline">{version}</span>
        <Sep />
        <button
          onClick={onToggleRightPanel}
          className={cn(
            "flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-accent hover:text-foreground",
            rightPanelOpen && "text-foreground",
          )}
          aria-pressed={rightPanelOpen}
          title={rightPanelOpen ? "Hide panel" : "Show panel"}
        >
          {rightPanelOpen ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
          <span className="hidden lg:inline">Panel</span>
        </button>
      </div>
    </footer>
  )
}
