"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X, AlertCircle, CheckCircle, Info, Copy, ChevronDown, ChevronRight, Terminal } from "lucide-react"
import { toast } from "sonner"
import { cn, copyToClipboard as copyText } from "@/lib/utils"

export interface LogEntry {
  type: "info" | "error" | "success" | "warning"
  message: string
  timestamp: string
}

interface BottomPanelProps {
  logs: LogEntry[]
  onClose: () => void
  onClear?: () => void
}

export function BottomPanel({ logs, onClose, onClear }: BottomPanelProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set())
  const [filterType, setFilterType] = useState<LogEntry["type"] | "all">("all")

  const toggleExpand = (index: number) => {
    const next = new Set(expandedLogs)
    next.has(index) ? next.delete(index) : next.add(index)
    setExpandedLogs(next)
  }

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />
      default:
        return <Info className="h-4 w-4 text-brand" />
    }
  }

  const getLogStyle = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "border-destructive/30 bg-destructive/[0.06]"
      case "success":
        return "border-success/30 bg-success/[0.06]"
      case "warning":
        return "border-warning/30 bg-warning/[0.06]"
      default:
        return "border-border bg-muted/30"
    }
  }

  const parseErrorMessage = (message: string) => {
    const filePathRegex = /(?:^|\s)(\/[^\s:]+):(\d+):(\d+)/g
    const matches = Array.from(message.matchAll(filePathRegex))
    if (matches.length === 0) return null
    return matches.map((m) => ({ file: m[1], line: parseInt(m[2]), column: parseInt(m[3]) }))
  }

  const formatMessage = (message: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return message.split(urlRegex).map((part, i) =>
      part.match(urlRegex) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-brand underline">
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      ),
    )
  }

  const formatCodeBlock = (message: string) => {
    const lines = message.split("\n")
    const isLongMessage = lines.length > 3 || message.length > 200
    return { lines, isLongMessage }
  }

  const copyToClipboard = async (text: string) => {
    if (await copyText(text)) toast.success("Copied to clipboard")
  }

  const extractContractAddress = (message: string) => message.match(/C[A-Z0-9]{55}/)?.[0] ?? null
  const extractTransactionHash = (message: string) => message.match(/[a-f0-9]{64}/)?.[0] ?? null

  const filteredLogs = filterType === "all" ? logs : logs.filter((l) => l.type === filterType)

  const counts = {
    all: logs.length,
    error: logs.filter((l) => l.type === "error").length,
    warning: logs.filter((l) => l.type === "warning").length,
    success: logs.filter((l) => l.type === "success").length,
  }

  const chip = (key: LogEntry["type"] | "all", label: string, active: string) => (
    <button
      onClick={() => setFilterType(key)}
      className={cn(
        "h-6 rounded px-2 font-mono text-[10px] transition-colors",
        filterType === key ? active : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="flex h-full flex-col border-t border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-3 py-1.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-brand" />
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Console</h3>
          </div>
          {logs.length > 0 && (
            <div className="flex items-center gap-1">
              {chip("all", `ALL · ${counts.all}`, "border border-border bg-accent text-foreground")}
              {counts.error > 0 && chip("error", `ERR · ${counts.error}`, "bg-destructive/15 text-destructive")}
              {counts.warning > 0 && chip("warning", `WARN · ${counts.warning}`, "bg-warning/15 text-warning")}
              {counts.success > 0 && chip("success", `OK · ${counts.success}`, "bg-success/15 text-success")}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onClear && logs.length > 0 && (
            <Button onClick={onClear} size="sm" variant="ghost" className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Clear
            </Button>
          )}
          <Button onClick={onClose} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" aria-label="Close console">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Terminal className="h-6 w-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {filterType === "all" ? "No output yet — compile or deploy to see logs." : `No ${filterType} logs`}
              </p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const contractAddress = extractContractAddress(log.message)
              const transactionHash = extractTransactionHash(log.message)
              const fileInfo = parseErrorMessage(log.message)
              const { lines, isLongMessage } = formatCodeBlock(log.message)
              const isExpanded = expandedLogs.has(index)
              const collapsed = isLongMessage && !isExpanded

              return (
                <div key={index} className={cn("rounded-lg border p-3", getLogStyle(log.type))}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getLogIcon(log.type)}</div>
                    <div className="min-w-0 flex-1">
                      {fileInfo && fileInfo.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {fileInfo.map((info, idx) => (
                            <span key={idx} className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {info.file.split("/").pop()}:{info.line}:{info.column}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="font-mono text-[13px] leading-relaxed text-foreground/90">
                        <div className="whitespace-pre-wrap break-words">
                          {collapsed ? `${lines.slice(0, 3).join("\n")}${lines.length > 3 ? "\n…" : ""}` : formatMessage(log.message)}
                        </div>
                        {isLongMessage && (
                          <Button variant="ghost" size="sm" className="mt-1 h-6 px-2 text-xs text-muted-foreground" onClick={() => toggleExpand(index)}>
                            {isExpanded ? <ChevronDown className="mr-1 h-3 w-3" /> : <ChevronRight className="mr-1 h-3 w-3" />}
                            {isExpanded ? "Collapse" : `Show ${lines.length - 3} more lines`}
                          </Button>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        {(contractAddress || transactionHash) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(contractAddress || transactionHash || "")}
                          >
                            <Copy className="h-3 w-3" /> Copy id
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
