"use client"

import { useRef, useState, type ComponentPropsWithoutRef } from "react"
import { Check, Copy, FileCode2 } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

/**
 * MDX `pre` replacement. Wraps the shiki-rendered <pre> with a filename header
 * (from ```lang title="src/lib.rs") and a copy button. Line highlighting is
 * handled in docs.css via shiki notation classes.
 */
export function Pre({ children, className, ...props }: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const title = (props as Record<string, unknown>)["data-title"] as string | undefined

  const onCopy = async () => {
    const text = ref.current?.textContent ?? ""
    if (await copyToClipboard(text)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <figure className="group relative my-5 overflow-hidden rounded-lg border border-border bg-card/50">
      {title && (
        <figcaption className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2 font-mono text-xs text-muted-foreground">
          <FileCode2 className="h-3.5 w-3.5 shrink-0 text-brand/70" aria-hidden />
          {title}
        </figcaption>
      )}
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2.5 top-2.5 z-10 grid h-7 w-7 place-items-center rounded-md border border-border bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-all hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre ref={ref} className={className} {...props}>
        {children}
      </pre>
    </figure>
  )
}
