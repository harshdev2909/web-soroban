"use client"

import Link from "next/link"
import { ArrowUpRight, Menu } from "lucide-react"
import { DocsSearch, type SearchEntry } from "./search"
import { ThemeToggle } from "./theme"

/** Sticky top bar: logo, version, ⌘K search, theme toggle, link back to the IDE. */
export function DocsTopBar({
  index,
  version,
  onOpenNav,
}: {
  index: SearchEntry[]
  version: string
  onOpenNav?: () => void
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <Link href="/docs" className="flex items-center gap-2">
        <img src="/websoroban_logo.png" alt="" className="h-6 w-6 object-contain" aria-hidden />
        <span className="font-display text-sm font-semibold tracking-tight text-foreground">WebSoroban</span>
        <span className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          docs {version}
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-1.5">
        <DocsSearch index={index} />
        <ThemeToggle />
        <Link
          href="/ide"
          className="flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
        >
          Open IDE
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  )
}
