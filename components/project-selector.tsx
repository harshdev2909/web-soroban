"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, FolderClosed, Clock, Trash2, Loader2 } from "lucide-react"
import { projectApi, Project, Template } from "@/lib/api"
import { TemplateSelector } from "./template-selector"
import { toast } from "sonner"

interface ProjectSelectorProps {
  currentProject: Project | null
  onProjectSelect: (project: Project) => void
  onProjectCreate: (project: Project) => void
  onTemplateSelect: (template: Template) => void
}

export function ProjectSelector({ currentProject, onProjectSelect, onProjectCreate }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: 'blank' | 'template', template?: Template } | null>(null)
  const [projectNameInput, setProjectNameInput] = useState("")
  // Guards against double-submits that would create duplicate projects.
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  // Keep the list in sync when a project is created/renamed elsewhere.
  useEffect(() => {
    if (!currentProject) return
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p._id === currentProject._id)
      if (idx === -1) return [currentProject, ...prev]
      const next = [...prev]
      next[idx] = { ...next[idx], name: currentProject.name, updatedAt: currentProject.updatedAt }
      return next
    })
  }, [currentProject?._id, currentProject?.name, currentProject?.updatedAt])

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

  // Persist a brand-new project to the DB so it survives refresh and appears in
  // the list. Returns the saved project (with its real _id) or null on failure.
  const persistNewProject = async (name: string, template?: string): Promise<Project | null> => {
    try {
      const saved = await projectApi.createProject(name, undefined, template)
      setProjects((prev) => [saved, ...prev])
      onProjectCreate(saved)
      return saved
    } catch (error) {
      console.error("Failed to create project:", error)
      toast.error(`Failed to create project: ${(error as Error).message}`)
      return null
    }
  }

  const handleCreateProject = async () => {
    const name = newProjectName.trim()
    if (!name || isCreating) return
    setIsCreating(true)
    const saved = await persistNewProject(name)
    setIsCreating(false)
    if (saved) {
      setNewProjectName("")
      setIsDialogOpen(false)
      toast.success(`Project "${name}" created`)
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
    if (!pendingAction || isCreating) return
    const projectName = projectNameInput.trim() || "Untitled Project"

    setIsCreating(true)
    const templateId = pendingAction.type === 'template' ? pendingAction.template?.id : 'blank'
    const saved = await persistNewProject(projectName, templateId)
    setIsCreating(false)

    if (saved) {
      const via = pendingAction.type === 'template' ? ` from ${pendingAction.template?.name} template` : ''
      toast.success(`Project "${projectName}" created${via}`)
      setProjectNameInput("")
      setIsNameModalOpen(false)
      setIsDialogOpen(false)
      setPendingAction(null)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (deletingId) return
    if (!confirm("Delete this project? This cannot be undone.")) return

    setDeletingId(projectId)
    try {
      await projectApi.deleteProject(projectId)
      const remaining = projects.filter((p) => p._id !== projectId)
      setProjects(remaining)
      if (currentProject?._id === projectId && remaining.length > 0) {
        onProjectSelect(remaining[0])
      }
      toast.success("Project deleted")
    } catch (error) {
      console.error("Failed to delete project:", error)
      toast.error("Failed to delete project")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  return (
    <div className="flex items-center space-x-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="max-w-[220px] gap-2 border-brand/40 bg-brand/10 font-medium text-brand hover:border-brand/60 hover:bg-brand/15"
          >
            <FolderClosed className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentProject?.name || "Select Project"}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Projects</DialogTitle>
            <DialogDescription>
              Create a new contract or open an existing one. Everything is saved automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create new project */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="New project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  disabled={isCreating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateProject()
                  }}
                />
                <Button
                  onClick={handleCreateProject}
                  size="icon"
                  disabled={isCreating || !newProjectName.trim()}
                  title="Create project"
                  className="shrink-0"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
                <TemplateSelector
                  onTemplateSelect={handleTemplateSelectWithName}
                  onClose={() => setIsDialogOpen(false)}
                />
              </div>
              <Button
                onClick={handleCreateBlankProject}
                size="sm"
                variant="outline"
                disabled={isCreating}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Create blank project
              </Button>
            </div>

            {/* Project list */}
            <div className="-mr-2 max-h-72 space-y-2 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading projects…
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No projects yet — create one above.
                </div>
              ) : (
                projects.map((project) => {
                  const isActive = currentProject?._id === project._id
                  return (
                    <div
                      key={project._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        onProjectSelect(project)
                        setIsDialogOpen(false)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onProjectSelect(project)
                          setIsDialogOpen(false)
                        }
                      }}
                      className={`group relative flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${
                        isActive
                          ? "border-brand/50 bg-brand/10"
                          : "border-border bg-card/40 hover:border-border hover:bg-accent"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand" aria-hidden />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className={`truncate font-medium ${isActive ? "text-foreground" : "text-foreground/90"}`}>
                          {project.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(project.updatedAt)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === project._id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project._id)
                        }}
                        className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                        title="Delete project"
                        aria-label={`Delete ${project.name}`}
                      >
                        {deletingId === project._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project name modal (blank + template) */}
      <Dialog open={isNameModalOpen} onOpenChange={(o) => { if (!isCreating) setIsNameModalOpen(o) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Name your project</DialogTitle>
            <DialogDescription>
              {pendingAction?.type === 'template'
                ? `Scaffolds from the ${pendingAction.template?.name} template.`
                : 'Creates an empty Soroban contract.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              placeholder="My Soroban Contract"
              value={projectNameInput}
              onChange={(e) => setProjectNameInput(e.target.value)}
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && projectNameInput.trim()) handleConfirmProjectCreation()
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isCreating}
              onClick={() => {
                setIsNameModalOpen(false)
                setPendingAction(null)
                setProjectNameInput("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmProjectCreation} disabled={!projectNameInput.trim() || isCreating} className="gap-2">
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreating ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
