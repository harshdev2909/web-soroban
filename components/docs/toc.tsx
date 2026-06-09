"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface TocItem {
  title: string
  url: string
  depth: number
}

/** Right-rail "On this page" with scroll-spy. */
export function DocsToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const ids = items.map((i) => i.url.replace(/^#/, ""))
    const headings = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0].target.id)
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
      <ul className="space-y-1.5 border-l border-border">
        {items.map((item) => {
          const id = item.url.replace(/^#/, "")
          const active = id === activeId
          return (
            <li key={item.url}>
              <a
                href={item.url}
                className={cn(
                  "-ml-px block border-l-2 py-0.5 leading-snug transition-colors",
                  item.depth >= 3 ? "pl-5" : "pl-3",
                  active
                    ? "border-brand font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
