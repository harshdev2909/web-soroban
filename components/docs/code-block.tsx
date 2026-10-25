"use client"

import { useRef, useState, type ComponentPropsWithoutRef } from "react"
import { Check, Copy } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

/**
 * MDX `pre` replacement: a figure frame with a mono header row (filename from
 * ```lang title="src/lib.rs", the language, and a copy action) above the
 * shiki-rendered <pre>. Line highlighting is handled in docs.css via shiki
 * notation classes.
 */
export function Pre({ children, className, ...props }: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const extra = props as Record<string, unknown>
  const title = extra["data-title"] as string | undefined
  const language = (extra["data-language"] ?? extra["data-lang"]) as string | undefined

  const onCopy = async () => {
    const text = ref.current?.textContent ?? ""
    if (await copyToClipboard(text)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <figure className="group relative my-5 overflow-hidden rounded-lg border border-border bg-card">
      <figcaption className="flex h-9 items-center gap-3 border-b border-border px-3 font-mono text-[0.68rem] text-muted-foreground">
        {title ? <span className="truncate text-foreground">{title}</span> : <span className="truncate">code</span>}
        {language && (
          <>
            <span className="h-3 w-px bg-border" aria-hidden />
            <span className="uppercase tracking-[0.14em]">{language}</span>
          </>
        )}
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="ml-auto flex h-7 items-center gap-1.5 rounded-sm px-1.5 uppercase tracking-[0.14em] transition-colors duration-150 hover:bg-accent hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
      </figcaption>
      <pre ref={ref} className={className} {...props}>
        {children}
      </pre>
    </figure>
  )
}
