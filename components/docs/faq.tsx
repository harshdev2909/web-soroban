"use client"

import { useState, type ReactNode } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

/** FAQ / disclosure group: hairline rows. Wrap one or more <FaqItem>. */
export function Accordion({ children }: { children: ReactNode }) {
  return <div className="my-6 border-t border-border">{children}</div>
}

export function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-12 w-full items-center justify-between gap-4 py-3 text-left text-sm font-medium text-foreground transition-colors duration-150 hover:text-brand"
      >
        {question}
        <Plus
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150", open && "rotate-45")}
          aria-hidden
        />
      </button>
      {open && (
        <div className="pb-4 text-sm leading-relaxed text-muted-foreground [&>*+*]:mt-2 [&_a]:text-brand [&_a:hover]:underline [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]">
          {children}
        </div>
      )}
    </div>
  )
}
