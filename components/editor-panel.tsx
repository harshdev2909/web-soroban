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

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* File Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center">
        <div className="flex">
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => onFileSelect(file)}
              className={`px-4 py-2 text-sm border-r border-gray-700 transition-colors ${
                activeFile.name === file.name
                  ? "bg-gray-900 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="ml-auto flex items-center space-x-2 px-4">
          <Button onClick={onCompile} disabled={isCompiling} size="sm" className="bg-blue-600 hover:bg-blue-700">
            {isCompiling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Compile
          </Button>

          <Button
            onClick={onDeploy}
            disabled={isDeploying}
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
          >
            {isDeploying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Deploy
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={getLanguage(activeFile.name)}
          value={activeFile.content}
          onChange={(value) => onFileContentChange(value || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
          }}
        />
      </div>
    </div>
  )
}
