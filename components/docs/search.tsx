"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, CornerDownLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface SearchEntry {
  url: string
  title: string
  description?: string
  section?: string
  headings?: { text: string; url: string }[]
}

type Hit = { url: string; title: string; sub?: string; section?: string }

function search(index: SearchEntry[], q: string): Hit[] {
  const query = q.trim().toLowerCase()
  if (!query) {
    return index.slice(0, 8).map((e) => ({ url: e.url, title: e.title, sub: e.description, section: e.section }))
  }
  const hits: Hit[] = []
  for (const e of index) {
    const hay = `${e.title} ${e.description ?? ""} ${e.section ?? ""}`.toLowerCase()
    if (hay.includes(query)) hits.push({ url: e.url, title: e.title, sub: e.description, section: e.section })
    for (const h of e.headings ?? []) {
      if (h.text.toLowerCase().includes(query)) hits.push({ url: h.url, title: h.text, sub: e.title, section: e.section })
    }
    if (hits.length > 24) break
  }
  return hits
}

/** ⌘K search over the docs index — mirrors the IDE command palette. */
export function DocsSearch({ index }: { index: SearchEntry[] }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const router = useRouter()
  const listRef = useRef<HTMLDivElement>(null)

  const hits = useMemo(() => search(index, q), [index, q])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQ("")
      setActive(0)
    }
  }, [open])
  useEffect(() => setActive(0), [q])

  const go = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, hits.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault()
      go(hits[active].url)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:border-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 sm:w-56"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Search docs…</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Search documentation</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-3.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search documentation…"
              className="h-12 flex-1 bg-transparent text-sm text-foreground caret-foreground outline-none ring-0 ring-offset-0 placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-1.5">
            {hits.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results for “{q}”.</p>
            ) : (
              hits.map((hit, i) => (
                <button
                  key={hit.url + i}
                  onClick={() => go(hit.url)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                    active === i ? "bg-accent text-foreground" : "text-muted-foreground",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-foreground">{hit.title}</div>
                    {hit.sub && <div className="truncate text-xs text-muted-foreground">{hit.sub}</div>}
                  </div>
                  {hit.section && <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{hit.section}</span>}
                  {active === i && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                </button>
              ))
            )}
          </div>
          <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-3 py-2 font-mono text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-background px-1">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-background px-1">↵</kbd> open</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-background px-1">esc</kbd> close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
