"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Loader2, Copy, Check, FileCode2, Cog, AlertTriangle } from "lucide-react"
import { cn, copyToClipboard } from "@/lib/utils"
import type { WizardBundleFile } from "@/lib/wizard"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-brand" />
    </div>
  ),
})

function languageFor(path: string): string {
  if (path.endsWith(".toml")) return "toml"
  if (path.endsWith(".rs")) return "rust"
  if (path.endsWith(".md")) return "markdown"
  if (path.endsWith(".json")) return "json"
  return "plaintext"
}

function iconFor(path: string) {
  return path.endsWith(".toml") ? Cog : FileCode2
}

// Sort so the contract source leads, then manifests, then the rest.
function order(files: WizardBundleFile[]): WizardBundleFile[] {
  const weight = (p: string) =>
    p.endsWith("contract.rs") || p === "src/lib.rs" ? 0 : p.endsWith(".rs") ? 1 : p.endsWith("Cargo.toml") ? 2 : 3
  return [...files].sort((a, b) => weight(a.path) - weight(b.path) || a.path.localeCompare(b.path))
}

export function WizardPreview({
  files,
  error,
}: {
  files: WizardBundleFile[]
  error?: string | null
}) {
  const ordered = useMemo(() => order(files), [files])
  const [active, setActive] = useState<string>(ordered[0]?.path ?? "")
  const [copied, setCopied] = useState(false)

  // Keep a valid active tab as the file set changes (toggles add/remove files).
  useEffect(() => {
    if (!ordered.some((f) => f.path === active)) setActive(ordered[0]?.path ?? "")
  }, [ordered, active])

  const current = ordered.find((f) => f.path === active) ?? ordered[0]

  const onCopy = async () => {
    if (!current) return
    await copyToClipboard(current.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* File tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-muted/30 px-2 py-1.5">
        {ordered.map((f) => {
          const Icon = iconFor(f.path)
          const isActive = f.path === active
          return (
            <button
              key={f.path}
              onClick={() => setActive(f.path)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
                isActive ? "bg-brand/15 text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
              title={f.path}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-brand" : "")} />
              {f.path.split("/").pop()}
            </button>
          )
        })}
        <button
          onClick={onCopy}
          disabled={!current}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground disabled:opacity-50"
          title="Copy this file"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code / error */}
      <div className="relative min-h-0 flex-1">
        {error ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="flex max-w-md items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-foreground">Can't generate this contract</p>
                <p className="mt-1 text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        ) : current ? (
          <MonacoEditor
            key={current.path}
            height="100%"
            theme="vs-dark"
            language={languageFor(current.path)}
            value={current.content}
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "var(--font-mono), monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "off",
              renderLineHighlight: "none",
              padding: { top: 12, bottom: 12 },
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No preview</div>
        )}
      </div>
    </div>
  )
}
