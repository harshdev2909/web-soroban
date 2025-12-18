"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Folder, Clock, Trash2 } from "lucide-react"
import { projectApi, Project, Template, ProjectFile } from "@/lib/api"
import { TemplateSelector } from "./template-selector"
import { toast } from "sonner"

// Helper function to create project files locally without saving to DB
const createLocalProjectFiles = (projectName: string, templateId?: string): ProjectFile[] => {
  // Convert project name to a valid crate name
  const crateName = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'contract';
  
  if (templateId === 'blank' || templateId === 'empty' || !templateId) {
    // Create blank project files
    return [
      {
        name: 'lib.rs',
        type: 'rust',
        content: ''
      },
      {
        name: 'Cargo.toml',
        type: 'toml',
        content: `[package]
name = "${crateName}"
version = "0.1.0"
edition = "2021"

[dependencies]
soroban-sdk = "22.0.0"

[dev-dependencies]
soroban-sdk = { version = "22.0.0", features = ["testutils"] }

[lib]
crate-type = ["cdylib"]

[profile.release]
opt-level = "z"
overflow-checks = true`
      },
      {
        name: '.cargo/config.toml',
        type: 'toml',
        content: `[target.wasm32v1-none]
rustflags = [
    "-C", "target-feature=-crt-static",
    "-C", "link-arg=--no-entry"
]`
      }
    ];
  }
  
  // For templates, we'll need to fetch from backend or create locally
  // For now, return blank files - templates will need backend call for file contents
  // But we won't save the project to DB
  return [
    {
      name: 'lib.rs',
      type: 'rust',
      content: ''
    },
    {
      name: 'Cargo.toml',
      type: 'toml',
      content: `[package]
name = "${crateName}"
version = "0.1.0"
edition = "2021"

[dependencies]
soroban-sdk = "22.0.0"

[dev-dependencies]
soroban-sdk = { version = "22.0.0", features = ["testutils"] }

[lib]
crate-type = ["cdylib"]

[profile.release]
opt-level = "z"
overflow-checks = true`
    },
    {
      name: '.cargo/config.toml',
      type: 'toml',
      content: `[target.wasm32v1-none]
rustflags = [
    "-C", "target-feature=-crt-static",
    "-C", "link-arg=--no-entry"
]`
    }
  ];
}

// Helper function to create a local project object
const createLocalProject = (name: string, templateId?: string): Project => {
  const now = new Date().toISOString();
  const files = createLocalProjectFiles(name, templateId);
  
  return {
    _id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    files,
    createdAt: now,
    updatedAt: now
  };
}

interface ProjectSelectorProps {
  currentProject: Project | null
  onProjectSelect: (project: Project) => void
  onProjectCreate: (project: Project) => void
  onTemplateSelect: (template: Template) => void
}

export function ProjectSelector({ currentProject, onProjectSelect, onProjectCreate, onTemplateSelect }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: 'blank' | 'template', template?: Template } | null>(null)
  const [projectNameInput, setProjectNameInput] = useState("")

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const projectsData = await projectApi.getProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error("Failed to load projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    try {
      // Create project locally without saving to DB
      const newProject = createLocalProject(newProjectName)
      setProjects(prev => [newProject, ...prev])
      onProjectCreate(newProject)
      setNewProjectName("")
      setIsDialogOpen(false)
      toast.success(`Project "${newProjectName}" created successfully!`)
    } catch (error) {
      console.error("Failed to create project:", error)
      toast.error(`Failed to create project: ${(error as Error).message}`)
    }
  }

  const handleCreateBlankProject = () => {
    setPendingAction({ type: 'blank' })
    setProjectNameInput("")
    setIsNameModalOpen(true)
  }

  const handleTemplateSelectWithName = (template: Template) => {
    setPendingAction({ type: 'template', template })
    setProjectNameInput(template.name || "")
    setIsNameModalOpen(true)
  }

  const handleConfirmProjectCreation = async () => {
    if (!pendingAction) return

    const projectName = projectNameInput.trim() || "Untitled Project"

    try {
      let newProject: Project

      if (pendingAction.type === 'blank') {
        // Create blank project locally without saving to DB
        newProject = createLocalProject(projectName, 'blank')
        toast.success(`Blank project "${projectName}" created successfully!`)
      } else if (pendingAction.template) {
        // For templates, fetch files by creating a temporary project, then delete it
        // This is a workaround until we have a template files endpoint
        try {
          const tempProject = await projectApi.createProject(projectName, undefined, pendingAction.template.id)
          // Create local project with the same files but local ID
          newProject = {
            ...tempProject,
            _id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
          // Immediately delete the temporary project from DB
          await projectApi.deleteProject(tempProject._id).catch(err => {
            console.warn("Failed to delete temp project:", err)
          })
          toast.success(`Project "${projectName}" created from ${pendingAction.template.name} template!`)
        } catch (templateError) {
          // If template fetch fails, create blank project
          console.warn("Failed to fetch template, creating blank project:", templateError)
          newProject = createLocalProject(projectName, 'blank')
          toast.success(`Project "${projectName}" created (template unavailable, using blank)!`)
        }
      } else {
        return
      }

      setProjects(prev => [newProject, ...prev])
      onProjectCreate(newProject)
      setProjectNameInput("")
      setIsNameModalOpen(false)
      setIsDialogOpen(false)
      setPendingAction(null)
    } catch (error) {
      console.error("Failed to create project:", error)
      toast.error(`Failed to create project: ${(error as Error).message}`)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      await projectApi.deleteProject(projectId)
      setProjects(prev => prev.filter(p => p._id !== projectId))
      if (currentProject?._id === projectId) {
        // If we deleted the current project, select the first available one
        const remainingProjects = projects.filter(p => p._id !== projectId)
        if (remainingProjects.length > 0) {
          onProjectSelect(remainingProjects[0])
        }
      }
    } catch (error) {
      console.error("Failed to delete project:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="flex items-center space-x-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Folder className="w-4 h-4 mr-2" />
            {currentProject?.name || "Select Project"}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-800 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle>Projects</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Create New Project */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2 flex-1">
                  <Input
                    placeholder="New project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateProject()
                    }}
                  />
                  <Button onClick={handleCreateProject} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <TemplateSelector
                  onTemplateSelect={handleTemplateSelectWithName}
                  onClose={() => setIsDialogOpen(false)}
                />
              </div>
              <Button 
                onClick={handleCreateBlankProject} 
                size="sm" 
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Blank Project
              </Button>
            </div>

            {/* Project List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="text-center text-gray-400">Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="text-center text-gray-400">No projects found</div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project._id}
                    className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                      currentProject?._id === project._id
                        ? "bg-blue-600 border-blue-500"
                        : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                    }`}
                  >
                    <div
                      className="flex-1"
                      onClick={() => {
                        onProjectSelect(project)
                        setIsDialogOpen(false)
                      }}
                    >
                      <div className="font-medium text-gray-100">{project.name}</div>
                      <div className="text-sm text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(project.updatedAt)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Name Modal */}
      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle>Enter Project Name</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please provide a name for your new project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="My Soroban Contract"
                value={projectNameInput}
                onChange={(e) => setProjectNameInput(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && projectNameInput.trim()) {
                    handleConfirmProjectCreation()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNameModalOpen(false)
                setPendingAction(null)
                setProjectNameInput("")
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmProjectCreation}
              disabled={!projectNameInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 