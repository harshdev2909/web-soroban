"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Folder, Clock, Trash2 } from "lucide-react"
import { projectApi, Project, Template } from "@/lib/api"
import { TemplateSelector } from "./template-selector"

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
      const newProject = await projectApi.createProject(newProjectName)
      setProjects(prev => [newProject, ...prev])
      onProjectCreate(newProject)
      setNewProjectName("")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to create project:", error)
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
                onTemplateSelect={onTemplateSelect}
                onClose={() => setIsDialogOpen(false)}
              />
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
    </div>
  )
} 