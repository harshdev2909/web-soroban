"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Hammer, Rocket } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
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
    monaco.editor.setTheme("vs-dark")
    monaco.languages.register({ id: "rust" })
  }

  const getLanguage = (fileName: string) => {
    if (fileName.endsWith(".rs")) return "rust"
    if (fileName.endsWith(".toml")) return "toml"
    return "plaintext"
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* File tabs + actions */}
      <div className="flex items-center border-b border-border bg-card/40">
        <div className="flex min-w-0 flex-1 overflow-x-auto">
          {files.map((file) => {
            const isActive = activeFile.name === file.name
            return (
              <button
                key={file.name}
                onClick={() => onFileSelect(file)}
                aria-current={isActive}
                className={`group relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 font-mono text-xs transition-colors ${
                  isActive
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-brand" : "bg-border"}`} />
                {file.name}
                {isActive && <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-brand" />}
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex flex-shrink-0 items-center gap-2 border-l border-border px-3 py-1.5">
          <Button onClick={onCompile} disabled={isCompiling} size="sm" variant="outline" className="h-8 gap-1.5">
            {isCompiling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Hammer className="h-3.5 w-3.5" />}
            <span className="text-xs">{isCompiling ? "Compiling…" : "Compile"}</span>
          </Button>
          <Button onClick={onDeploy} disabled={isDeploying} size="sm" className="h-8 gap-1.5">
            {isDeploying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            <span className="text-xs">{isDeploying ? "Deploying…" : "Deploy"}</span>
          </Button>
        </div>
      </div>

      {/* Monaco */}
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
            fontSize: 13.5,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            fontFamily: "var(--font-mono), 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "gutter",
            padding: { top: 14, bottom: 14 },
          }}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border bg-card/40 px-4 py-1.5 font-mono text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {getLanguage(activeFile.name).toUpperCase()}
          </span>
          <span className="opacity-40">·</span>
          <span>UTF-8</span>
          <span className="opacity-40">·</span>
          <span>Spaces: 4</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono-tnum">{(activeFile.content || "").length.toLocaleString()} chars</span>
          <span className="opacity-40">·</span>
          <span className="font-mono-tnum">{(activeFile.content || "").split("\n").length} lines</span>
        </div>
      </div>
    </div>
  )
}
