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
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getLogBgColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "bg-red-950/30 border-red-800/50"
      case "success":
        return "bg-green-950/30 border-green-800/50"
      case "warning":
        return "bg-yellow-950/30 border-yellow-800/50"
      default:
        return "bg-gray-800/50 border-gray-700/50"
    }
  }

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-red-300"
      case "success":
        return "text-green-300"
      case "warning":
        return "text-yellow-300"
      default:
        return "text-gray-300"
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
    <div className="h-full bg-gray-900 border-t border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-200">Build Output</h3>
          {logs.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                {filteredLogs.length} / {logs.length}
              </Badge>
              {/* Filter buttons */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={filterType === "all" ? "default" : "ghost"}
                  className={`h-6 px-2 text-xs ${filterType === "all" ? "bg-gray-700" : ""}`}
                  onClick={() => setFilterType("all")}
                >
                  All ({logCounts.all})
                </Button>
                {logCounts.error > 0 && (
                  <Button
                    size="sm"
                    variant={filterType === "error" ? "default" : "ghost"}
                    className={`h-6 px-2 text-xs ${filterType === "error" ? "bg-red-900/50 text-red-300" : "text-red-400"}`}
                    onClick={() => setFilterType("error")}
                  >
                    Errors ({logCounts.error})
                  </Button>
                )}
                {logCounts.warning > 0 && (
                  <Button
                    size="sm"
                    variant={filterType === "warning" ? "default" : "ghost"}
                    className={`h-6 px-2 text-xs ${filterType === "warning" ? "bg-yellow-900/50 text-yellow-300" : "text-yellow-400"}`}
                    onClick={() => setFilterType("warning")}
                  >
                    Warnings ({logCounts.warning})
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onClear && logs.length > 0 && (
            <Button 
              onClick={onClear} 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2 text-xs text-gray-400 hover:text-gray-200"
            >
              Clear
            </Button>
          )}
          <Button onClick={onClose} size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-200">
            <X className="w-4 h-4" />
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
