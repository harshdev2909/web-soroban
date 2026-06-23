"use client"

import { useMemo, useState } from 'react'
import { Check, ChevronDown, Gauge, Plus, Search, Sparkles, Zap } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { formatModelName, type ModelRegistry, type RegistryModel } from '@/lib/aiApi'

function EffortBadge({ effort }: { effort: RegistryModel['effort'] }) {
  const map = {
    High: { cls: 'text-brand', icon: Gauge },
    Medium: { cls: 'text-info', icon: Gauge },
    Fast: { cls: 'text-success', icon: Zap },
  } as const
  const { cls, icon: Icon } = map[effort]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] ${cls}`}>
      <Icon className="h-3 w-3" />
      {effort}
    </span>
  )
}

export function ModelSwitcher({
  registry,
  model,
  maxMode,
  onModel,
  onMaxMode,
}: {
  registry: ModelRegistry | null
  model: string
  maxMode: boolean
  onModel: (id: string) => void
  onMaxMode: (on: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [q, setQ] = useState('')

  const curated = registry?.models || []
  const current = curated.find((m) => m.id === model)
  const currentLabel = current?.label || formatModelName(model)

  const catalogResults = useMemo(() => {
    if (!showAll || !registry) return []
    const query = q.toLowerCase()
    return registry.catalog.filter((c) => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)).slice(0, 60)
  }, [showAll, q, registry])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground transition hover:border-brand/50 hover:bg-accent">
          {maxMode && <Sparkles className="h-3.5 w-3.5 text-brand" />}
          <span className="max-w-[120px] truncate">{currentLabel}</span>
          {maxMode && <span className="rounded bg-brand/15 px-1 text-[9px] font-semibold text-brand">MAX</span>}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {/* MAX Mode */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            <div>
              <div className="text-xs font-medium text-foreground">MAX Mode</div>
              <div className="text-[10px] text-muted-foreground">High reasoning + bigger context budget</div>
            </div>
          </div>
          <Switch checked={maxMode} onCheckedChange={onMaxMode} />
        </div>

        {!showAll ? (
          <>
            <div className="max-h-[320px] overflow-y-auto py-1">
              {curated.map((m) => (
                <button
                  key={m.id}
                  disabled={!m.available}
                  onClick={() => {
                    onModel(m.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-accent disabled:opacity-40"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {m.id === model && <Check className="h-3.5 w-3.5 text-brand" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-medium text-foreground">{m.label}</span>
                      {m.recommended && <span className="rounded bg-brand/15 px-1 text-[9px] text-brand">★</span>}
                      {!m.available && <span className="text-[9px] text-muted-foreground">unavailable</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{m.vendor}</span>
                      <EffortBadge effort={m.effort} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAll(true)}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Add Models…
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search models…"
                className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="max-h-[320px] overflow-y-auto py-1">
              {catalogResults.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">No models match.</div>
              )}
              {catalogResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onModel(c.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-accent"
                >
                  <span className="truncate text-xs text-foreground">{c.name}</span>
                  {c.contextLength ? (
                    <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{Math.round(c.contextLength / 1000)}k</span>
                  ) : null}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAll(false)}
              className="w-full border-t border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back to curated
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default ModelSwitcher
