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
    <div className="my-5 overflow-hidden rounded-lg border border-border">
      <div role="tablist" className="flex gap-1 border-b border-border bg-muted/30 px-2">
        {items.map((label, i) => (
          <button
            key={label}
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${base}-panel-${i}`}
            onClick={() => setActive(i)}
            className={cn(
              "relative -mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              active === i
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
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
          className="px-4 py-3 text-sm leading-relaxed [&>figure]:my-0 [&_pre.shiki]:text-[0.8125rem]"
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
