"use client"

import Link from "next/link"
import { ArrowUpRight, Menu } from "lucide-react"
import { DocsSearch, type SearchEntry } from "./search"
import { ThemeToggle } from "./theme"
import { NovaMark } from "@/components/nova-mark"

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/docs/payments", label: "x402" },
  { href: "/docs/payloop", label: "PayLoop" },
  { href: "/docs/reference/api", label: "API" },
]

/** Sticky hairline bar: the mark, mono section links, ⌘K search, theme toggle, and the one lit action. */
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 lg:px-6">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link href="/" className="flex min-h-10 items-center gap-3 rounded-md pr-2">
          <NovaMark className="h-7 w-7 rounded-md" />
          <span className="font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-foreground">WebSoroban</span>
          <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            docs {version}
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Documentation sections">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-10 items-center rounded-md px-3 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <DocsSearch index={index} />
          <ThemeToggle />
          <Link
            href="/ide"
            className="lit group ml-1 flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
          >
            Open IDE
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
