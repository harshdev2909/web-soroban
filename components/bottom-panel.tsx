"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X, AlertCircle, CheckCircle, Info, ExternalLink, Copy, ChevronDown, ChevronRight, Filter } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

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
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedLogs(newExpanded)
  }

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-rose-400" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-[#A3FF12]" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-400" />
      default:
        return <Info className="w-4 h-4 text-sky-400" />
    }
  }

  const getLogBgColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "bg-rose-950/20 border-rose-900/40"
      case "success":
        return "bg-[#A3FF12]/[0.04] border-[#A3FF12]/20"
      case "warning":
        return "bg-amber-950/20 border-amber-900/40"
      default:
        return "bg-slate-900/50 border-slate-800/60"
    }
  }

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-rose-200"
      case "success":
        return "text-emerald-200"
      case "warning":
        return "text-amber-200"
      default:
        return "text-slate-300"
    }
  }

  const parseErrorMessage = (message: string) => {
    // Extract file paths and line numbers
    const filePathRegex = /(?:^|\s)(\/[^\s:]+):(\d+):(\d+)/g
    const matches = Array.from(message.matchAll(filePathRegex))
    
    if (matches.length === 0) return null
    
    return matches.map(match => ({
      file: match[1],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      fullMatch: match[0]
    }))
  }

  const formatMessage = (message: string) => {
    // Extract URLs and make them clickable
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = message.split(urlRegex)
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
          >
            {part}
            <ExternalLink className="w-3 h-3" />
          </a>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const formatCodeBlock = (message: string) => {
    // Check if message contains code-like patterns
    const codePatterns = [
      /```[\s\S]*?```/g,
      /`[^`]+`/g,
      /error:.*\n.*\n.*\n/g,
      /warning:.*\n.*\n.*\n/g
    ]
    
    let formatted = message
    
    // Extract code blocks
    const codeBlocks: string[] = []
    formatted = formatted.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match)
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`
    })
    
    // Split by lines for better formatting
    const lines = formatted.split('\n')
    const isLongMessage = lines.length > 3 || message.length > 200
    
    return { lines, isLongMessage, codeBlocks }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const extractContractAddress = (message: string) => {
    const match = message.match(/C[A-Z0-9]{55}/)
    return match ? match[0] : null
  }

  const extractTransactionHash = (message: string) => {
    const match = message.match(/[a-f0-9]{64}/)
    return match ? match[0] : null
  }

  const filteredLogs = filterType === "all" 
    ? logs 
    : logs.filter(log => log.type === filterType)

  const logCounts = {
    all: logs.length,
    error: logs.filter(l => l.type === "error").length,
    warning: logs.filter(l => l.type === "warning").length,
    success: logs.filter(l => l.type === "success").length,
    info: logs.filter(l => l.type === "info").length,
  }

  return (
    <div className="h-full bg-slate-950 border-t border-slate-800/80 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#A3FF12]" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-mono font-semibold text-slate-300">
              Build Output
            </h3>
          </div>
          {logs.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400 bg-slate-900/60 px-1.5 py-0">
                {filteredLogs.length}/{logs.length}
              </Badge>
              {/* Filter chips */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterType("all")}
                  className={`h-6 px-2 rounded text-[10px] font-mono transition-all ${
                    filterType === "all"
                      ? "bg-slate-800 text-slate-200 border border-slate-700"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  ALL · {logCounts.all}
                </button>
                {logCounts.error > 0 && (
                  <button
                    onClick={() => setFilterType("error")}
                    className={`h-6 px-2 rounded text-[10px] font-mono transition-all ${
                      filterType === "error"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "text-rose-400 hover:bg-rose-500/10"
                    }`}
                  >
                    ERR · {logCounts.error}
                  </button>
                )}
                {logCounts.warning > 0 && (
                  <button
                    onClick={() => setFilterType("warning")}
                    className={`h-6 px-2 rounded text-[10px] font-mono transition-all ${
                      filterType === "warning"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "text-amber-400 hover:bg-amber-500/10"
                    }`}
                  >
                    WARN · {logCounts.warning}
                  </button>
                )}
                {logCounts.success > 0 && (
                  <button
                    onClick={() => setFilterType("success")}
                    className={`h-6 px-2 rounded text-[10px] font-mono transition-all ${
                      filterType === "success"
                        ? "bg-[#A3FF12]/15 text-[#A3FF12] border border-[#A3FF12]/30"
                        : "text-[#A3FF12]/70 hover:bg-[#A3FF12]/10"
                    }`}
                  >
                    OK · {logCounts.success}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onClear && logs.length > 0 && (
            <Button
              onClick={onClear}
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-200 hover:bg-slate-800"
            >
              Clear
            </Button>
          )}
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-8">
              {filterType === "all" ? "No logs yet..." : `No ${filterType} logs`}
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const contractAddress = extractContractAddress(log.message)
              const transactionHash = extractTransactionHash(log.message)
              const fileInfo = parseErrorMessage(log.message)
              const { lines, isLongMessage, codeBlocks } = formatCodeBlock(log.message)
              const isExpanded = expandedLogs.has(index)
              const shouldShowExpand = isLongMessage && !isExpanded
              
              return (
                <div 
                  key={index} 
                  className={`${getLogBgColor(log.type)} border rounded-lg p-3 transition-all hover:border-opacity-100`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                  {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Header with timestamp and actions */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          {fileInfo && fileInfo.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                              {fileInfo.map((info, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs font-mono bg-gray-800/50 border-gray-600 text-gray-400"
                                >
                                  {info.file.split('/').pop()}:{info.line}:{info.column}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Message content */}
                          <div className={`${getLogColor(log.type)} text-sm font-mono leading-relaxed`}>
                            {shouldShowExpand ? (
                              <>
                                <div className="whitespace-pre-wrap break-words">
                                  {lines.slice(0, 3).join('\n')}
                                  {lines.length > 3 && '...'}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 mt-2 text-xs text-gray-400 hover:text-gray-200"
                                  onClick={() => toggleExpand(index)}
                                >
                                  <ChevronRight className="w-3 h-3 mr-1" />
                                  Show {lines.length - 3} more lines
                                </Button>
                              </>
                            ) : (
                              <div className="whitespace-pre-wrap break-words">
                      {formatMessage(log.message)}
                                {isExpanded && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 mt-2 text-xs text-gray-400 hover:text-gray-200"
                                    onClick={() => toggleExpand(index)}
                                  >
                                    <ChevronDown className="w-3 h-3 mr-1" />
                                    Collapse
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {(contractAddress || transactionHash) && (
                        <Button
                          size="sm"
                          variant="ghost"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                              onClick={() => copyToClipboard(contractAddress || transactionHash || '')}
                              title="Copy to clipboard"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                          {isLongMessage && (
                        <Button
                          size="sm"
                          variant="ghost"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                              onClick={() => toggleExpand(index)}
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                        </Button>
                      )}
                    </div>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="text-xs text-gray-500 mt-2 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
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
