"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/** FAQ / disclosure group. Wrap one or more <FaqItem>. */
export function Accordion({ children }: { children: ReactNode }) {
  return <div className="my-6 divide-y divide-border overflow-hidden rounded-lg border border-border">{children}</div>
}

export function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent/40"
      >
        {question}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground [&>*+*]:mt-2 [&_a]:text-brand [&_a:hover]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]">
          {children}
        </div>
      )}
    </div>
  )
}
