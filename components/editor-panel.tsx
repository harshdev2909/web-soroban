"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Play, Upload } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  ),
})

import { ProjectFile } from "@/lib/api"

interface EditorPanelProps {
  activeFile: ProjectFile
  files: ProjectFile[]
  onFileSelect: (file: ProjectFile) => void
  onFileContentChange: (content: string) => void
  onCompile: () => void
  onDeploy: () => void
  isCompiling: boolean
  isDeploying: boolean
}

export function EditorPanel({
  activeFile,
  files,
  onFileSelect,
  onFileContentChange,
  onCompile,
  onDeploy,
  isCompiling,
  isDeploying,
}: EditorPanelProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Configure Monaco for dark theme
    monaco.editor.setTheme("vs-dark")

    // Set up Rust language support
    monaco.languages.register({ id: "rust" })
  }

  const getLanguage = (fileName: string) => {
    if (fileName.endsWith(".rs")) return "rust"
    if (fileName.endsWith(".toml")) return "toml"
    return "plaintext"
  }

  const getTabAccent = (fileName: string) => {
    if (fileName.endsWith(".rs")) return "#FF8C42"
    if (fileName.endsWith(".toml")) return "#FF4CF0"
    if (fileName.endsWith(".json")) return "#A3FF12"
    return "#94A3B8"
  }

  return (
    <div className="relative h-full bg-[#0a0e14] flex flex-col">
      {/* File Tabs Bar */}
      <div className="relative bg-slate-950/80 border-b border-slate-800/80 flex items-center backdrop-blur-sm">
        {/* subtle top accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

        <div className="flex flex-1 min-w-0 overflow-x-auto scrollbar-thin">
          {files.map((file) => {
            const isActive = activeFile.name === file.name
            const accent = getTabAccent(file.name)
            return (
              <button
                key={file.name}
                onClick={() => onFileSelect(file)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 text-xs font-mono whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "text-white bg-[#0a0e14]"
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: accent,
                    boxShadow: isActive ? `0 0 8px ${accent}` : "none",
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
                {file.name}
                {/* Active underline */}
                {isActive && (
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5"
                    style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 border-l border-slate-800/80 flex-shrink-0">
          <Button
            onClick={onCompile}
            disabled={isCompiling}
            size="sm"
            className="group relative h-8 bg-gradient-to-r from-[#FF4CF0]/90 to-[#FF4CF0] hover:from-[#FF4CF0] hover:to-[#FF4CF0]/80 text-white font-semibold shadow-[0_0_16px_rgba(255,76,240,0.25)] hover:shadow-[0_0_24px_rgba(255,76,240,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
          >
            {isCompiling ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs">{isCompiling ? "Compiling..." : "Compile"}</span>
          </Button>

          <Button
            onClick={onDeploy}
            disabled={isDeploying}
            size="sm"
            className="group relative h-8 bg-gradient-to-r from-[#A3FF12] to-[#8FE600] hover:from-[#8FE600] hover:to-[#7BD300] text-black font-semibold shadow-[0_0_16px_rgba(163,255,18,0.25)] hover:shadow-[0_0_24px_rgba(163,255,18,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
          >
            {isDeploying ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-y-0.5 transition-transform" />
            )}
            <span className="text-xs">{isDeploying ? "Deploying..." : "Deploy"}</span>
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="relative flex-1">
        <MonacoEditor
          height="100%"
          language={getLanguage(activeFile.name)}
          value={activeFile.content}
          onChange={(value) => onFileContentChange(value || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: true, renderCharacters: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace",
            fontLigatures: true,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "gutter",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-4 py-1.5 border-t border-slate-800/80 bg-slate-950/80 text-[10px] font-mono text-slate-500 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A3FF12] shadow-[0_0_4px_#A3FF12]" />
            {getLanguage(activeFile.name).toUpperCase()}
          </span>
          <span className="text-slate-600">·</span>
          <span>UTF-8</span>
          <span className="text-slate-600">·</span>
          <span>LF</span>
          <span className="text-slate-600">·</span>
          <span>Spaces: 4</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{(activeFile.content || "").length.toLocaleString()} chars</span>
          <span className="text-slate-600">·</span>
          <span>{(activeFile.content || "").split("\n").length} lines</span>
        </div>
      </div>
    </div>
  )
}
