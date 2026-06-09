"use client"

import { useState, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import type { PageTree } from "fumadocs-core/server"
import { DocsTopBar } from "./top-bar"
import { SidebarNav } from "./sidebar-nav"
import type { SearchEntry } from "./search"
import { cn } from "@/lib/utils"

/** Docs chrome: top bar, left nav (fixed on desktop, drawer on mobile), content. */
export function DocsShell({
  tree,
  index,
  version,
  children,
}: {
  tree: PageTree.Root
  index: SearchEntry[]
  version: string
  children: ReactNode
}) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()

  // Close the mobile drawer on navigation.
  useEffect(() => setNavOpen(false), [pathname])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DocsTopBar index={index} version={version} onOpenNav={() => setNavOpen(true)} />

      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 overflow-y-auto border-r border-border px-4 py-6 lg:block">
          <SidebarNav tree={tree} />
        </aside>

        {/* Mobile drawer */}
        <div
          className={cn(
            "fixed inset-0 z-50 lg:hidden",
            navOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
          aria-hidden={!navOpen}
        >
          <div
            className={cn("absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity", navOpen ? "opacity-100" : "opacity-0")}
            onClick={() => setNavOpen(false)}
          />
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-72 max-w-[80vw] overflow-y-auto border-r border-border bg-background px-3 py-4 shadow-lg transition-transform",
              navOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="mb-3 flex items-center justify-between px-2.5">
              <span className="font-display text-sm font-semibold">Documentation</span>
              <button onClick={() => setNavOpen(false)} aria-label="Close navigation" className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav tree={tree} />
          </div>
        </div>

        {/* Content region (page renders article + right TOC) */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
