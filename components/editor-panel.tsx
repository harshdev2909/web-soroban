"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Hammer, Rocket, FlaskConical } from "lucide-react"
import { motion } from "framer-motion"
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
import { pathOf, dirName, baseName } from "@/lib/paths"

export interface CompileDiagnostic {
  level: "error" | "warning"
  code?: string
  message: string
  file?: string
  line?: number
  column?: number
}

interface EditorPanelProps {
  activeFile: ProjectFile
  files: ProjectFile[]
  onFileSelect: (file: ProjectFile) => void
  onFileContentChange: (content: string) => void
  onCompile: () => void
  onDeploy: () => void
  onTest?: () => void
  isCompiling: boolean
  isDeploying: boolean
  isTesting?: boolean
  onCursorChange?: (pos: { line: number; col: number }) => void
  diagnostics?: CompileDiagnostic[]
}

export function EditorPanel({
  activeFile,
  files,
  onFileSelect,
  onFileContentChange,
  onCompile,
  onDeploy,
  onTest,
  isCompiling,
  isDeploying,
  isTesting = false,
  onCursorChange,
  diagnostics = [],
}: EditorPanelProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco
    monaco.editor.setTheme("vs-dark")
    monaco.languages.register({ id: "rust" })
    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange?.({ line: e.position.lineNumber, col: e.position.column })
    })
  }

  // Reflect compiler diagnostics as gutter markers on the active file's model.
  useEffect(() => {
    const monaco = monacoRef.current
    const editor = editorRef.current
    if (!monaco || !editor) return
    const model = editor.getModel()
    if (!model) return

    // Route a diagnostic to this file by FULL path (so two files named mod.rs
    // in different folders don't collide). Tolerate a bare-basename file field
    // from older payloads.
    const activePath = pathOf(activeFile)
    const matchesActive = (file?: string) => {
      if (!file) return true
      if (file === activePath) return true
      return !file.includes("/") && baseName(activePath) === file
    }
    const markers = diagnostics
      .filter((d) => matchesActive(d.file))
      .map((d) => ({
        severity: d.level === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
        message: d.code ? `[${d.code}] ${d.message}` : d.message,
        startLineNumber: d.line || 1,
        startColumn: d.column || 1,
        endLineNumber: d.line || 1,
        endColumn: (d.column || 1) + 1,
      }))
    monaco.editor.setModelMarkers(model, "soroban", markers)
  }, [diagnostics, activeFile])

  const getLanguage = (fileName: string) => {
    if (fileName.endsWith(".rs")) return "rust"
    if (fileName.endsWith(".toml")) return "toml"
    return "plaintext"
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* File tabs + actions */}
      <div className="flex items-center border-b border-border bg-card/30">
        <div className="flex min-w-0 flex-1 overflow-x-auto">
          {files.map((file) => {
            const filePath = pathOf(file)
            const isActive = pathOf(activeFile) === filePath
            const dir = dirName(filePath)
            return (
              <button
                key={filePath}
                onClick={() => onFileSelect(file)}
                aria-current={isActive}
                title={filePath}
                className={`group relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 font-mono text-xs transition-colors ${
                  isActive
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full transition-colors ${isActive ? "bg-brand" : "bg-border group-hover:bg-muted-foreground"}`} />
                {dir && <span className="text-muted-foreground/60">{dir}/</span>}
                {baseName(filePath)}
                {isActive && (
                  <motion.span
                    layoutId="editor-tab-underline"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-brand"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Action cluster: Deploy is the single primary; Compile is secondary */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-2 border-l border-border px-3 py-1.5">
          <Button onClick={onCompile} disabled={isCompiling} size="sm" variant="outline" className="h-8 gap-1.5">
            {isCompiling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Hammer className="h-3.5 w-3.5" />}
            <span className="text-xs">{isCompiling ? "Compiling…" : "Compile"}</span>
          </Button>
          {onTest && (
            <Button onClick={onTest} disabled={isTesting} size="sm" variant="outline" className="h-8 gap-1.5">
              {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
              <span className="text-xs">{isTesting ? "Testing…" : "Test"}</span>
            </Button>
          )}
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
            lineHeight: 21,
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
    </div>
  )
}
