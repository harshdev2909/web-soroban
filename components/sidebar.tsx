"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  File,
  FileCode2,
  FileCog,
  FileJson,
  Plus,
  Save,
  Pencil,
  Check,
  X,
  Code2,
  Trash2,
  Loader2,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { Project, ProjectFile } from "@/lib/api"

interface SidebarProps {
  project: Project
  activeFile: ProjectFile
  onFileSelect: (file: ProjectFile) => void
  onProjectNameChange: (name: string) => void
  onNewFile: (fileName?: string) => void
  onSaveProject: () => void
  onDeleteFile: (fileName: string) => void
}

export function Sidebar({ project, activeFile, onFileSelect, onProjectNameChange, onNewFile, onSaveProject, onDeleteFile }: SidebarProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [isSaving, setIsSaving] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState("")

  const handleNameSave = () => {
    onProjectNameChange(editName)
    setIsEditingName(false)
    toast.success("Project name updated")
  }

  const handleNameCancel = () => {
    setEditName(project.name)
    setIsEditingName(false)
  }

  const handleSaveProject = async () => {
    setIsSaving(true)
    try {
      await onSaveProject()
      toast.success("Project saved")
    } catch {
      toast.error("Failed to save project")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFile = (fileName: string) => {
    if (project.files.length <= 1) {
      toast.error("Cannot delete the last file in the project")
      return
    }
    if (activeFile.name === fileName) {
      if (!confirm(`Delete the currently active file "${fileName}"?`)) return
    }
    onDeleteFile(fileName)
    toast.success(`Deleted "${fileName}"`)
  }

  const handleCreateNewFile = () => {
    if (!newFileName.trim()) {
      toast.error("Please enter a file name")
      return
    }
    const fileName = newFileName.trim().endsWith(".rs") ? newFileName.trim() : `${newFileName.trim()}.rs`
    if (project.files.some((f) => f.name === fileName)) {
      toast.error("A file with this name already exists")
      return
    }
    onNewFile(fileName)
    setShowNewFileDialog(false)
    setNewFileName("")
  }

  const getFileIcon = (fileName: string, active: boolean) => {
    const base = "h-4 w-4 shrink-0"
    if (fileName.endsWith(".rs")) return <FileCode2 className={`${base} ${active ? "text-brand" : "text-brand/70"}`} />
    if (fileName.endsWith(".toml")) return <FileCog className={`${base} text-warning/70`} />
    if (fileName.endsWith(".json")) return <FileJson className={`${base} text-info/70`} />
    return <File className={`${base} text-muted-foreground`} />
  }

  const getFileType = (fileName: string) => {
    if (fileName.endsWith(".rs")) return "Rust"
    if (fileName.endsWith(".toml")) return "TOML"
    if (fileName.endsWith(".json")) return "JSON"
    return "File"
  }

  const deployCount = project.deploymentHistory?.length || 0

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Project header */}
      <div className="border-b border-sidebar-border p-3">
        {isEditingName ? (
          <div className="space-y-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Project name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave()
                if (e.key === "Escape") handleNameCancel()
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleNameSave} className="text-brand">
                <Check className="mr-1 h-3 w-3" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleNameCancel} className="text-muted-foreground">
                <X className="mr-1 h-3 w-3" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="group/header flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand/12 text-brand">
                <Code2 className="h-4 w-4" />
              </span>
              <h2 className="truncate font-display text-sm font-semibold text-foreground">{project.name}</h2>
            </div>
            <button
              onClick={() => setIsEditingName(true)}
              className="rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/header:opacity-100"
              title="Rename project"
              aria-label="Rename project"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Slim stat row — replaces the two stat tiles */}
        <div className="mt-2.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <span className="font-mono-tnum text-foreground/90">{project.files.length}</span>
          <span>{project.files.length === 1 ? "file" : "files"}</span>
          <span className="text-border">·</span>
          <span className="font-mono-tnum text-foreground/90">{deployCount}</span>
          <span>{deployCount === 1 ? "deploy" : "deploys"}</span>
          <span className="ml-auto truncate" title={`Edited ${new Date(project.updatedAt).toLocaleString()}`}>
            {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Explorer — the primary content of the rail */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-3 pb-1 pt-3">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Explorer</h3>
            <span className="font-mono-tnum text-[10px] text-muted-foreground/70">{project.files.length}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => { setNewFileName(""); setShowNewFileDialog(true) }}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="New file"
              aria-label="New file"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleSaveProject}
              disabled={isSaving}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              title="Save project"
              aria-label="Save project"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          <div className="space-y-0.5">
            {project.files.map((file) => {
              const isActive = activeFile.name === file.name
              return (
                <div
                  key={file.name}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-md py-1.5 pl-3 pr-1.5 text-sm transition-colors ${
                    isActive ? "bg-brand/10 text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="file-active-bar"
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <button onClick={() => onFileSelect(file)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    {getFileIcon(file.name, isActive)}
                    <span className="truncate font-mono text-[13px]">{file.name}</span>
                  </button>
                  <div className="ml-2 flex shrink-0 items-center gap-1">
                    <span className="rounded border border-border bg-muted px-1 py-0 font-mono text-[9px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {getFileType(file.name)}
                    </span>
                    {project.files.length > 1 && (
                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        className="rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                        title={`Delete ${file.name}`}
                        aria-label={`Delete ${file.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-2.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>WebSoroban</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-success" /> v1.0.0
          </span>
        </div>
      </div>

      {/* New file dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-brand/12 text-brand">
                <Plus className="h-4 w-4" />
              </span>
              Create new file
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <label htmlFor="new-file-name" className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              File name
            </label>
            <Input
              id="new-file-name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="my_contract.rs"
              className="font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateNewFile()
                if (e.key === "Escape") setShowNewFileDialog(false)
              }}
            />
            <p className="text-[11px] text-muted-foreground">.rs extension is added automatically.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFileDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateNewFile}>Create file</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
