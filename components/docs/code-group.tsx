"use client"

import { Children, isValidElement, useState, type ReactNode, type ReactElement } from "react"
import { FileCode2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Multiple files/languages in one block. Each child is a fenced code block
 * with a title; the title becomes the tab label. Usage:
 *   <CodeGroup>
 *     ```rust title="src/lib.rs" … ```
 *     ```toml title="Cargo.toml" … ```
 *   </CodeGroup>
 */
export function CodeGroup({ children }: { children: ReactNode }) {
  const blocks = Children.toArray(children).filter(isValidElement) as ReactElement<{
    "data-title"?: string
    children?: ReactNode
  }>[]
  const [active, setActive] = useState(0)
  const labels = blocks.map((b, i) => b.props["data-title"] ?? `Tab ${i + 1}`)

  return (
    <div className="my-5 overflow-hidden rounded-lg border border-border bg-card/50">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border bg-muted/40 px-2">
        {labels.map((label, i) => (
          <button
            key={label + i}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 py-2 font-mono text-xs transition-colors",
              active === i
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <FileCode2 className="h-3.5 w-3.5 shrink-0 text-brand/70" aria-hidden />
            {label}
          </button>
        ))}
      </div>
      {blocks.map((block, i) => (
        <div key={i} hidden={active !== i} className="[&_figure]:m-0 [&_figure]:rounded-none [&_figure]:border-0 [&_figcaption]:hidden">
          {block}
        </div>
      ))}
    </div>
  )
}
