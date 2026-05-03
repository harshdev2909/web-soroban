"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { File, FileText, Plus, Save, Edit3, Check, X, Folder, Code2, Zap, Clock, GitBranch, Trash2, AlertTriangle, Loader2 } from "lucide-react"
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
    toast.success("Project name updated!")
  }

  const handleNameCancel = () => {
    setEditName(project.name)
    setIsEditingName(false)
  }

  const handleSaveProject = async () => {
    setIsSaving(true)
    try {
      await onSaveProject()
      toast.success("Project saved successfully!")
    } catch (error) {
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
      // Allow deletion of active file but show warning
      if (!confirm(`Are you sure you want to delete the currently active file "${fileName}"?`)) {
        return
      }
    }
    
    onDeleteFile(fileName)
    toast.success(`File "${fileName}" deleted successfully!`)
  }

  const handleNewFileClick = () => {
    setNewFileName("")
    setShowNewFileDialog(true)
  }

  const handleCreateNewFile = () => {
    if (!newFileName.trim()) {
      toast.error("Please enter a file name")
      return
    }

    // Ensure the file has .rs extension
    const fileName = newFileName.trim().endsWith('.rs') ? newFileName.trim() : `${newFileName.trim()}.rs`
    
    // Check if file already exists
    if (project.files.some(f => f.name === fileName)) {
      toast.error("A file with this name already exists")
      return
    }

    onNewFile(fileName)
    setShowNewFileDialog(false)
    setNewFileName("")
  }

  const handleCancelNewFile = () => {
    setShowNewFileDialog(false)
    setNewFileName("")
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".rs")) return <FileText className="w-4 h-4 text-[#FF8C42] flex-shrink-0" />
    if (fileName.endsWith(".toml")) return <File className="w-4 h-4 text-[#FF4CF0] flex-shrink-0" />
    if (fileName.endsWith(".json")) return <File className="w-4 h-4 text-[#A3FF12] flex-shrink-0" />
    return <File className="w-4 h-4 text-slate-500 flex-shrink-0" />
  }

  const getFileType = (fileName: string) => {
    if (fileName.endsWith(".rs")) return "Rust"
    if (fileName.endsWith(".toml")) return "Config"
    if (fileName.endsWith(".json")) return "JSON"
    return "File"
  }

  return (
    <div className="relative h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/80 flex flex-col overflow-hidden">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -top-24 -left-12 h-48 w-48 rounded-full bg-[#A3FF12]/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-12 h-48 w-48 rounded-full bg-[#FF4CF0]/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A3FF12]/30 to-transparent" />

      {/* Project Header */}
      <div className="relative z-10 p-5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
        {isEditingName ? (
          <div className="space-y-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm bg-slate-800 border-slate-700 text-slate-200 focus:border-[#A3FF12]/50 focus:ring-[#A3FF12]/20"
              placeholder="Enter project name..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave()
                if (e.key === "Escape") handleNameCancel()
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleNameSave} className="text-[#A3FF12] hover:text-[#A3FF12] hover:bg-[#A3FF12]/10">
                <Check className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleNameCancel} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-md bg-[#A3FF12]/20 blur-md" />
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-br from-[#A3FF12]/20 to-[#FF4CF0]/20 border border-[#A3FF12]/30">
                    <Code2 className="w-4 h-4 text-[#A3FF12]" />
                  </div>
                </div>
                <h2 className="text-base font-bold text-slate-100 truncate">{project.name}</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingName(true)}
                className="p-1 h-auto text-slate-500 hover:text-[#A3FF12] hover:bg-[#A3FF12]/10 transition-colors"
                title="Rename project"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono">
              <Clock className="w-3 h-3" />
              <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 p-3 border-b border-slate-800/80 space-y-2">
        <Button
          size="sm"
          className="group w-full bg-gradient-to-r from-[#A3FF12] to-[#8FE600] hover:from-[#8FE600] hover:to-[#7BD300] text-black font-semibold shadow-[0_0_16px_rgba(163,255,18,0.25)] hover:shadow-[0_0_24px_rgba(163,255,18,0.45)] transition-all duration-300"
          onClick={handleNewFileClick}
        >
          <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
          New File
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:border-[#FF4CF0]/40 hover:text-white transition-all duration-300"
          onClick={handleSaveProject}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaving ? "Saving..." : "Save Project"}
        </Button>
      </div>

      {/* Project Stats */}
      <div className="relative z-10 p-3 border-b border-slate-800/80">
        <div className="grid grid-cols-2 gap-2">
          <div className="group relative overflow-hidden rounded-lg border border-slate-800/80 bg-slate-900/40 p-3 hover:border-[#A3FF12]/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#A3FF12]/0 to-[#A3FF12]/0 group-hover:from-[#A3FF12]/[0.06] group-hover:to-transparent transition-all duration-300" />
            <div className="relative">
              <div className="font-mono text-2xl font-bold text-[#A3FF12] leading-none">{project.files.length}</div>
              <div className="mt-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono">Files</div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-lg border border-slate-800/80 bg-slate-900/40 p-3 hover:border-[#FF4CF0]/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF4CF0]/0 to-[#FF4CF0]/0 group-hover:from-[#FF4CF0]/[0.06] group-hover:to-transparent transition-all duration-300" />
            <div className="relative">
              <div className="font-mono text-2xl font-bold text-[#FF4CF0] leading-none">
                {project.deploymentHistory?.length || 0}
              </div>
              <div className="mt-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono">Deploys</div>
            </div>
          </div>
        </div>
      </div>

      {/* File Explorer */}
      <div className="relative z-10 flex-1 p-3 overflow-y-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono flex items-center gap-1.5">
            <Folder className="w-3 h-3 text-[#F9F871]" />
            Explorer
          </h3>
          <Badge className="bg-slate-800/80 text-slate-400 border border-slate-700/50 text-[9px] font-mono px-1.5 py-0">
            {project.files.length}
          </Badge>
        </div>
        <div className="space-y-0.5">
          {project.files.map((file) => {
            const isActive = activeFile.name === file.name
            return (
              <div
                key={file.name}
                className={`relative w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-sm transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? "bg-[#A3FF12]/[0.08] text-white"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-[#A3FF12] shadow-[0_0_8px_#A3FF12]" />
                )}
                <button
                  onClick={() => onFileSelect(file)}
                  className="flex items-center gap-2 flex-1 text-left min-w-0"
                >
                  {getFileIcon(file.name)}
                  <span className="truncate font-medium">{file.name}</span>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                  <Badge className="bg-slate-800 text-slate-400 border border-slate-700/50 text-[9px] font-mono px-1 py-0">
                    {getFileType(file.name)}
                  </Badge>
                  {project.files.length > 1 && (
                    <button
                      onClick={() => handleDeleteFile(file.name)}
                      className={`p-1 rounded transition-colors ${
                        file.name === activeFile.name
                          ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                          : "text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                      }`}
                      title={`Delete ${file.name}${file.name === activeFile.name ? ' (currently active)' : ''}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-sm">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3 h-3 text-[#A3FF12]/60" />
            <span>WebSoroban</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[#A3FF12] animate-pulse" />
            <span>v1.0.0</span>
          </div>
        </div>
      </div>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-800 shadow-[0_0_40px_rgba(163,255,18,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-slate-100 flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#A3FF12]/10 border border-[#A3FF12]/30">
                <Plus className="w-4 h-4 text-[#A3FF12]" />
              </div>
              Create New File
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs uppercase tracking-wider font-mono text-slate-400 mb-2 block">
                File Name
              </label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="my_contract.rs"
                className="bg-slate-900 border-slate-700 text-slate-200 focus:border-[#A3FF12]/50 focus:ring-[#A3FF12]/20 font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNewFile()
                  if (e.key === "Escape") handleCancelNewFile()
                }}
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#A3FF12]" />
                .rs extension added automatically
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelNewFile}
              className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewFile}
              className="bg-gradient-to-r from-[#A3FF12] to-[#8FE600] hover:from-[#8FE600] hover:to-[#7BD300] text-black font-semibold shadow-[0_0_16px_rgba(163,255,18,0.3)]"
            >
              Create File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
