"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Plus,
  FolderPlus,
  Save,
  Pencil,
  Check,
  X,
  Code2,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

import { Project, ProjectFile } from "@/lib/api"
import { FileTree } from "@/components/file-tree"
import { pathOf, validatePath, findMissingModules, baseName } from "@/lib/paths"

interface SidebarProps {
  project: Project
  activeFile: ProjectFile
  onFileSelect: (file: ProjectFile) => void
  onProjectNameChange: (name: string) => void
  onNewFile: (path: string) => void
  onRenameFile: (oldPath: string, newPath: string) => void
  onSaveProject: () => void
  onDeleteFile: (path: string) => void
}

type DialogMode = "new-file" | "new-folder" | "rename" | null

export function Sidebar({
  project,
  activeFile,
  onFileSelect,
  onProjectNameChange,
  onNewFile,
  onRenameFile,
  onSaveProject,
  onDeleteFile,
}: SidebarProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [isSaving, setIsSaving] = useState(false)

  // Client-only empty folders (Rust doesn't persist empty dirs; these render
  // until a file is added under them).
  const [extraFolders, setExtraFolders] = useState<string[]>([])

  // Path dialog state (shared by new-file / new-folder / rename).
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [pathInput, setPathInput] = useState("")
  const [renameTarget, setRenameTarget] = useState<ProjectFile | null>(null)

  const existingPaths = useMemo(() => new Set(project.files.map(pathOf)), [project.files])
  const missingModules = useMemo(() => findMissingModules(project.files), [project.files])

  const handleNameSave = () => {
    onProjectNameChange(editName)
    setIsEditingName(false)
    toast.success("Project name updated")
  }

  const handleSaveProject = async () => {
    setIsSaving(true)
    try {
      await onSaveProject()
    } catch {
      toast.error("Failed to save project")
    } finally {
      setIsSaving(false)
    }
  }

  const openNewFile = (dir = "") => {
    setDialogMode("new-file")
    setPathInput(dir ? `${dir}/` : "")
  }
  const openNewFolder = (dir = "") => {
    setDialogMode("new-folder")
    setPathInput(dir ? `${dir}/` : "")
  }
  const openRename = (file: ProjectFile) => {
    setRenameTarget(file)
    setDialogMode("rename")
    setPathInput(pathOf(file))
  }
  const closeDialog = () => {
    setDialogMode(null)
    setPathInput("")
    setRenameTarget(null)
  }

  // Live validation for the current dialog input.
  const validationError = useMemo(() => {
    if (!dialogMode) return null
    const raw = pathInput.trim().replace(/\/+$/, "") // tolerate a trailing slash while typing
    if (!raw) return dialogMode === "new-folder" ? "Enter a folder path" : "Enter a file path"
    const err = validatePath(raw)
    if (err) return err
    if (dialogMode !== "new-folder") {
      const finalPath = raw.includes(".") ? raw : `${raw}.rs`
      if (dialogMode === "new-file" && existingPaths.has(finalPath)) return "A file at this path already exists"
      if (dialogMode === "rename" && renameTarget && finalPath !== pathOf(renameTarget) && existingPaths.has(finalPath))
        return "A file at this path already exists"
    }
    return null
  }, [dialogMode, pathInput, existingPaths, renameTarget])

  const submitDialog = () => {
    if (validationError) {
      toast.error(validationError)
      return
    }
    const raw = pathInput.trim().replace(/\/+$/, "")
    if (dialogMode === "new-folder") {
      setExtraFolders((prev) => Array.from(new Set([...prev, raw])))
      toast.success(`Folder "${raw}" ready — add a file to keep it`)
    } else {
      // .rs is added automatically only when no extension was given.
      const finalPath = raw.includes(".") ? raw : `${raw}.rs`
      if (dialogMode === "new-file") onNewFile(finalPath)
      else if (dialogMode === "rename" && renameTarget) onRenameFile(pathOf(renameTarget), finalPath)
    }
    closeDialog()
  }

  const handleDelete = (path: string) => {
    if (project.files.length <= 1) {
      toast.error("Cannot delete the last file in the project")
      return
    }
    if (pathOf(activeFile) === path && !confirm(`Delete the currently active file "${path}"?`)) return
    onDeleteFile(path)
  }

  const deployCount = project.deploymentHistory?.length || 0

  const dialogTitle =
    dialogMode === "new-folder" ? "New folder" : dialogMode === "rename" ? "Rename / move file" : "New file"

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
                if (e.key === "Escape") setIsEditingName(false)
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleNameSave} className="text-brand">
                <Check className="mr-1 h-3 w-3" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)} className="text-muted-foreground">
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
              onClick={() => { setEditName(project.name); setIsEditingName(true) }}
              className="rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/header:opacity-100"
              title="Rename project"
              aria-label="Rename project"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

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

      {/* Explorer */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-3 pb-1 pt-3">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Explorer</h3>
            <span className="font-mono-tnum text-[10px] text-muted-foreground/70">{project.files.length}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => openNewFile()}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="New file"
              aria-label="New file"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => openNewFolder()}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="New folder"
              aria-label="New folder"
            >
              <FolderPlus className="h-3.5 w-3.5" />
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
          <FileTree
            files={project.files}
            extraFolders={extraFolders}
            activePath={pathOf(activeFile)}
            onSelect={onFileSelect}
            onNewFileInDir={openNewFile}
            onNewFolderInDir={openNewFolder}
            onRename={openRename}
            onDelete={handleDelete}
            canDelete={project.files.length > 1}
          />
        </div>

        {/* mod-without-file warning */}
        {missingModules.length > 0 && (
          <div className="mx-2 mb-2 rounded-md border border-warning/30 bg-warning/10 px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> Unresolved modules
            </div>
            <ul className="mt-1 space-y-0.5 font-mono text-[10px] text-muted-foreground">
              {missingModules.slice(0, 4).map((m) => (
                <li key={`${m.file}:${m.module}`} className="truncate" title={`${m.file}: mod ${m.module};`}>
                  <span className="text-foreground/80">{baseName(m.file)}</span>: <code>mod {m.module};</code> has no file
                </li>
              ))}
              {missingModules.length > 4 && <li>+{missingModules.length - 4} more…</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-sidebar-border px-3 py-2.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>WebSoroban</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-success" /> v1.0.0
          </span>
        </div>
      </div>

      {/* Path dialog (new file / new folder / rename-move) */}
      <Dialog open={dialogMode !== null} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-brand/12 text-brand">
                {dialogMode === "new-folder" ? <FolderPlus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <label htmlFor="path-input" className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {dialogMode === "new-folder" ? "Folder path" : "File path"}
            </label>
            <Input
              id="path-input"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              placeholder={dialogMode === "new-folder" ? "src/admin" : "src/admin/mod.rs"}
              className="font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") submitDialog()
                if (e.key === "Escape") closeDialog()
              }}
            />
            {validationError ? (
              <p className="text-[11px] text-destructive">{validationError}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {dialogMode === "new-folder"
                  ? "Intermediate folders are created automatically. Empty folders aren't saved until they contain a file."
                  : "Use a project-relative path (e.g. src/storage.rs). .rs is added if you omit an extension."}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={submitDialog} disabled={!!validationError}>
              {dialogMode === "rename" ? "Rename" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
