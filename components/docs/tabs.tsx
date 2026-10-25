"use client"

import { Children, isValidElement, useId, useState, type ReactNode, type ReactElement } from "react"
import { cn } from "@/lib/utils"

/**
 * Tabbed content. Usage:
 *   <Tabs items={["Testnet", "Local"]}>
 *     <Tab>…</Tab>
 *     <Tab>…</Tab>
 *   </Tabs>
 */
export function Tabs({ items, children }: { items: string[]; children: ReactNode }) {
  const [active, setActive] = useState(0)
  const base = useId()
  const panels = Children.toArray(children).filter(isValidElement) as ReactElement[]

  return (
    <div className="my-5 overflow-hidden rounded-lg border border-border bg-card">
      <div role="tablist" className="flex gap-1 border-b border-border px-2">
        {items.map((label, i) => (
          <button
            key={label}
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${base}-panel-${i}`}
            onClick={() => setActive(i)}
            className={cn(
              "relative flex h-10 items-center px-3 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors duration-150",
              active === i ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {active === i && <span aria-hidden className="absolute inset-x-3 -bottom-px h-px bg-brand" />}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${base}-panel-${i}`}
          aria-labelledby={`${base}-tab-${i}`}
          hidden={active !== i}
          className="px-4 py-4 text-sm leading-relaxed [&>figure]:my-0 [&_pre.shiki]:text-[0.8125rem]"
        >
          {panel}
        </div>
      ))}
    </div>
  )
}

export function Tab({ children }: { children: ReactNode }) {
  return <>{children}</>
}
