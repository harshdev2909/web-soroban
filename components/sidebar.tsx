"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { File, FileText, Plus, Save, Edit3, Check, X, Folder, Code2, Zap, Clock, GitBranch, Trash2, AlertTriangle } from "lucide-react"
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
    if (fileName.endsWith(".rs")) return <FileText className="w-4 h-4 text-orange-400" />
    if (fileName.endsWith(".toml")) return <File className="w-4 h-4 text-blue-400" />
    if (fileName.endsWith(".json")) return <File className="w-4 h-4 text-green-400" />
    return <File className="w-4 h-4 text-gray-400" />
  }

  const getFileType = (fileName: string) => {
    if (fileName.endsWith(".rs")) return "Rust"
    if (fileName.endsWith(".toml")) return "Config"
    if (fileName.endsWith(".json")) return "JSON"
    return "File"
  }

  return (
    <div className="h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 flex flex-col">
      {/* Project Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800/50">
        {isEditingName ? (
          <div className="space-y-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm bg-slate-700 border-slate-600 text-slate-200"
              placeholder="Enter project name..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave()
                if (e.key === "Escape") handleNameCancel()
              }}
            />
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost" onClick={handleNameSave} className="text-green-400 hover:text-green-300">
                <Check className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleNameCancel} className="text-red-400 hover:text-red-300">
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-heading text-slate-200 truncate">{project.name}</h2>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsEditingName(true)} 
                className="p-1 h-auto text-slate-400 hover:text-slate-200"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Last modified: {new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-slate-700 space-y-3">
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white"
          onClick={handleNewFileClick}
        >
          <Plus className="w-4 h-4 mr-2" />
          New File
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={handleSaveProject}
          disabled={isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Project"}
        </Button>
      </div>

      {/* Project Stats */}
      <div className="p-4 border-b border-slate-700">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-slate-700/50 rounded-lg">
            <div className="text-lg font-bold text-blue-400">{project.files.length}</div>
            <div className="text-xs text-slate-400">Files</div>
          </div>
          <div className="text-center p-2 bg-slate-700/50 rounded-lg">
            <div className="text-lg font-bold text-green-400">
              {project.deploymentHistory?.length || 0}
            </div>
            <div className="text-xs text-slate-400">Deployments</div>
          </div>
        </div>
      </div>

      {/* File Explorer */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-heading text-slate-200 flex items-center">
            <Folder className="w-4 h-4 mr-2 text-blue-400" />
            Files
          </h3>
          <Badge className="bg-slate-700 text-slate-300 text-xs">
            {project.files.length} files
          </Badge>
        </div>
        <div className="space-y-1">
          {project.files.map((file) => (
            <div
              key={file.name}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                activeFile.name === file.name 
                  ? "bg-blue-600/20 border border-blue-500/30 text-blue-300" 
                  : "text-slate-300 hover:bg-slate-700/50 border border-transparent"
              }`}
            >
              <button
                onClick={() => onFileSelect(file)}
                className="flex items-center space-x-2 flex-1 text-left min-w-0"
              >
                {getFileIcon(file.name)}
                <span className="truncate font-medium">{file.name}</span>
              </button>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                <Badge className="bg-slate-600 text-slate-300 text-xs">
                  {getFileType(file.name)}
                </Badge>
                {project.files.length > 1 && (
                  <button
                    onClick={() => handleDeleteFile(file.name)}
                    className={`p-1 rounded transition-colors ${
                      file.name === activeFile.name 
                        ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/20" 
                        : "text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    }`}
                    title={`Delete ${file.name}${file.name === activeFile.name ? ' (currently active)' : ''}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <GitBranch className="w-3 h-3" />
            <span>Web Soroban IDE</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>v1.0.0</span>
          </div>
        </div>
      </div>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Create New File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                File Name
              </label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter file name (e.g., my_contract.rs)"
                className="bg-slate-700 border-slate-600 text-slate-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNewFile()
                  if (e.key === "Escape") handleCancelNewFile()
                }}
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1">
                The .rs extension will be added automatically if not provided
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelNewFile}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewFile}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
