"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X, AlertCircle, CheckCircle, Info, ExternalLink, Copy } from "lucide-react"
import { toast } from "sonner"

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
      return part
    })
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

  return (
    <div className="h-full bg-gray-800 border-t border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-200">Build Output</h3>
          {logs.length > 0 && (
            <span className="text-xs text-gray-400">({logs.length} entries)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onClear && logs.length > 0 && (
            <Button 
              onClick={onClear} 
              size="sm" 
              variant="ghost" 
              className="p-1 h-auto text-gray-400 hover:text-gray-200"
            >
              Clear
            </Button>
          )}
          <Button onClick={onClose} size="sm" variant="ghost" className="p-1 h-auto text-gray-400 hover:text-gray-200">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-sm">No logs yet...</div>
          ) : (
            logs.map((log, index) => {
              const contractAddress = extractContractAddress(log.message)
              const transactionHash = extractTransactionHash(log.message)
              
              return (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  {getLogIcon(log.type)}
                  <div className="flex-1">
                    <div className={`${getLogColor(log.type)} flex items-center gap-2`}>
                      {formatMessage(log.message)}
                      {contractAddress && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => copyToClipboard(contractAddress)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                      {transactionHash && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => copyToClipboard(transactionHash)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
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
