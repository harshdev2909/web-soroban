"use client"

import { useRef, useEffect, type WheelEvent } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Hammer, Rocket, FlaskConical, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center gap-2 bg-background font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
      Loading editor
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
  /** When set, the Deploy button shows a non-blocking warning (e.g. the connected
   *  wallet is on the wrong network for a mainnet deploy). The click still works —
   *  the actual block happens at sign time, scoped to the non-custodial path. */
  deployWarning?: string
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
  deployWarning,
}: EditorPanelProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  // Keep the active tab visible when switching files from elsewhere (file tree,
  // command palette, AI-applied edits).
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ inline: "nearest", block: "nearest" })
  }, [activeFile])

  // Let the mouse wheel scroll the tab strip horizontally (it has no vertical
  // axis), so an overflowing strip is usable without a visible scrollbar.
  const onTabsWheel = (e: WheelEvent<HTMLDivElement>) => {
    const el = tabsRef.current
    if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY
  }

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
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-background">
      {/* File tabs + actions: one 36px hairline row */}
      <div className="flex h-9 min-w-0 shrink-0 items-stretch border-b border-border bg-card/40">
        <div ref={tabsRef} onWheel={onTabsWheel} className="flex min-w-0 flex-1 overflow-x-auto overflow-y-hidden no-scrollbar">
          {files.map((file) => {
            const filePath = pathOf(file)
            const isActive = pathOf(activeFile) === filePath
            const dir = dirName(filePath)
            return (
              <button
                key={filePath}
                ref={isActive ? activeTabRef : undefined}
                onClick={() => onFileSelect(file)}
                aria-current={isActive}
                title={filePath}
                className={cn(
                  "group relative flex shrink-0 items-center gap-1 whitespace-nowrap border-r border-border px-3 font-mono text-[0.72rem] transition-colors duration-150",
                  isActive ? "bg-background text-foreground" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                )}
              >
                {dir && <span className="text-muted-foreground/60">{dir}/</span>}
                {baseName(filePath)}
                {isActive && (
                  <motion.span
                    layoutId="editor-tab-underline"
                    className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-brand"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Action cluster: Deploy is the single lit action; Compile and Test are outline */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-1.5 border-l border-border px-2">
          <Button onClick={onCompile} disabled={isCompiling} size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-xs">
            {isCompiling ? <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" /> : <Hammer className="h-3.5 w-3.5" />}
            {isCompiling ? "Compiling…" : "Compile"}
          </Button>
          {onTest && (
            <Button onClick={onTest} disabled={isTesting} size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-xs">
              {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" /> : <FlaskConical className="h-3.5 w-3.5" />}
              {isTesting ? "Testing…" : "Test"}
            </Button>
          )}
          <Button
            onClick={onDeploy}
            disabled={isDeploying}
            size="sm"
            title={deployWarning || undefined}
            aria-label={deployWarning ? `Deploy — ${deployWarning}` : undefined}
            className={cn("h-7 gap-1.5 px-2.5 text-xs", deployWarning ? "bg-warning text-warning-foreground hover:bg-warning/90" : "lit")}
          >
            {isDeploying ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
            ) : deployWarning ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <Rocket className="h-3.5 w-3.5" />
            )}
            {isDeploying ? "Deploying…" : "Deploy"}
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
