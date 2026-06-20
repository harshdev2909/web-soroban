"use client"

// Inline diff review. Renders each proposed edit's unified diff with per-hunk
// accept toggles, plus Accept all / Reject all / Apply and Undo. Hunk indices
// match the backend's computeHunks order, so the apply payload selects the same
// hunks server-side.

import { useMemo, useState } from 'react'
import { Check, FilePlus2, FileX2, FileText, Undo2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProposedEdit } from '@/lib/aiApi'

interface DiffLine { type: 'add' | 'del' | 'context' | 'meta'; text: string }
interface ParsedHunk { index: number; header: string; lines: DiffLine[] }

function parseDiff(diff: string): ParsedHunk[] {
  const hunks: ParsedHunk[] = []
  let current: ParsedHunk | null = null
  for (const line of (diff || '').split('\n')) {
    if (line.startsWith('--- ') || line.startsWith('+++ ')) continue
    if (line.startsWith('@@')) {
      current = { index: hunks.length, header: line, lines: [] }
      hunks.push(current)
      continue
    }
    if (!current) continue
    if (line.startsWith('+')) current.lines.push({ type: 'add', text: line.slice(1) })
    else if (line.startsWith('-')) current.lines.push({ type: 'del', text: line.slice(1) })
    else current.lines.push({ type: 'context', text: line.startsWith(' ') ? line.slice(1) : line })
  }
  return hunks
}

function opIcon(op: ProposedEdit['op']) {
  if (op === 'create') return <FilePlus2 className="h-3.5 w-3.5 text-success" />
  if (op === 'delete') return <FileX2 className="h-3.5 w-3.5 text-destructive" />
  return <FileText className="h-3.5 w-3.5 text-brand" />
}

export type AcceptPayload = 'all' | Record<string, 'all' | 'reject' | number[]>

export function DiffView({
  edits,
  applied,
  applying,
  onApply,
  onUndo,
}: {
  edits: ProposedEdit[]
  applied?: boolean
  applying?: boolean
  onApply: (accept: AcceptPayload) => void
  onUndo: () => void
}) {
  // accepted[path] = Set of accepted hunk indices (default: all).
  const parsed = useMemo(
    () => edits.map((e) => ({ edit: e, hunks: parseDiff(e.diff) })),
    [edits]
  )
  const [accepted, setAccepted] = useState<Record<string, Set<number>>>(() => {
    const init: Record<string, Set<number>> = {}
    for (const { edit, hunks } of parsed) {
      init[edit.path] = new Set(hunks.length ? hunks.map((h) => h.index) : [0])
    }
    return init
  })

  const toggleHunk = (path: string, idx: number) => {
    setAccepted((prev) => {
      const set = new Set(prev[path] || [])
      if (set.has(idx)) set.delete(idx)
      else set.add(idx)
      return { ...prev, [path]: set }
    })
  }

  const setAll = (on: boolean) => {
    const next: Record<string, Set<number>> = {}
    for (const { edit, hunks } of parsed) {
      next[edit.path] = on ? new Set(hunks.length ? hunks.map((h) => h.index) : [0]) : new Set()
    }
    setAccepted(next)
  }

  const buildAccept = (): AcceptPayload => {
    const obj: Record<string, 'all' | 'reject' | number[]> = {}
    let everythingAll = true
    for (const { edit, hunks } of parsed) {
      const total = hunks.length || 1
      const set = accepted[edit.path] || new Set()
      if (set.size === total) obj[edit.path] = 'all'
      else if (set.size === 0) {
        obj[edit.path] = 'reject'
        everythingAll = false
      } else {
        obj[edit.path] = [...set]
        everythingAll = false
      }
    }
    return everythingAll ? 'all' : obj
  }

  const totalAdds = parsed.reduce((n, p) => n + p.hunks.reduce((a, h) => a + h.lines.filter((l) => l.type === 'add').length, 0), 0)
  const totalDels = parsed.reduce((n, p) => n + p.hunks.reduce((a, h) => a + h.lines.filter((l) => l.type === 'del').length, 0), 0)

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card/50">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-foreground">{edits.length} file{edits.length === 1 ? '' : 's'} changed</span>
          <span className="font-mono text-success">+{totalAdds}</span>
          <span className="font-mono text-destructive">-{totalDels}</span>
        </div>
        {applied ? (
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={onUndo} disabled={applying}>
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={() => setAll(false)} className="rounded px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
              Reject all
            </button>
            <button onClick={() => setAll(true)} className="rounded px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
              Accept all
            </button>
            <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => onApply(buildAccept())} disabled={applying}>
              {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Apply
            </Button>
          </div>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {parsed.map(({ edit, hunks }) => (
          <div key={edit.path} className="border-b border-border/60 last:border-0">
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5">
              {opIcon(edit.op)}
              <span className="font-mono text-[11px] text-foreground">{edit.path}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">{edit.op}</span>
            </div>
            {(hunks.length ? hunks : [{ index: 0, header: '', lines: [] as DiffLine[] }]).map((h) => {
              const on = (accepted[edit.path] || new Set()).has(h.index)
              return (
                <div key={h.index} className="border-t border-border/40 first:border-0">
                  {!applied && (
                    <button
                      onClick={() => toggleHunk(edit.path, h.index)}
                      className="flex w-full items-center gap-2 px-3 py-1 text-left text-[10px] text-muted-foreground hover:bg-accent/40"
                    >
                      <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${on ? 'border-brand bg-brand/20' : 'border-border'}`}>
                        {on && <Check className="h-2.5 w-2.5 text-brand" />}
                      </span>
                      <span className="font-mono">{h.header || (edit.op === 'delete' ? 'delete file' : 'new file')}</span>
                    </button>
                  )}
                  <pre className={`overflow-x-auto px-3 pb-1.5 font-mono text-[11px] leading-[1.5] ${!applied && !on ? 'opacity-40' : ''}`}>
                    {h.lines.map((l, k) => (
                      <div
                        key={k}
                        className={
                          l.type === 'add'
                            ? 'bg-success/10 text-success'
                            : l.type === 'del'
                              ? 'bg-destructive/10 text-destructive'
                              : 'text-muted-foreground'
                        }
                      >
                        <span className="select-none opacity-60">{l.type === 'add' ? '+ ' : l.type === 'del' ? '- ' : '  '}</span>
                        {l.text || ' '}
                      </div>
                    ))}
                  </pre>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DiffView
