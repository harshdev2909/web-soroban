'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { projectApi, type Project } from '@/lib/api'
import {
  filterProjects,
  forgetOrigin,
  getFavorites,
  getOrigin,
  rememberOrigin,
  sortProjects,
  toggleFavorite,
  SORT_OPTIONS,
  type NetworkFilter,
  type SortKey,
} from '@/lib/catalog'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoginModal } from '@/components/login-modal'
import { CatalogTopBar } from '@/components/catalog/catalog-top-bar'
import { CatalogRail, type CatalogView } from '@/components/catalog/catalog-rail'
import { ProjectCard } from '@/components/catalog/project-card'
import { CreateProjectDialog } from '@/components/catalog/create-project-dialog'
import {
  CatalogEmptyState,
  CatalogErrorState,
  CatalogNoMatches,
  NewProjectCard,
  ProjectCardSkeleton,
} from '@/components/catalog/catalog-states'
import { TemplatesView } from '@/components/catalog/catalog-views'
import { ArrowDownUp, Search, Star, X } from 'lucide-react'

const NETWORK_FILTERS: { value: NetworkFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'testnet', label: 'Testnet' },
  { value: 'mainnet', label: 'Mainnet' },
]

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
}

export default function ProjectsPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  const [view, setView] = useState<CatalogView>('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loginOpen, setLoginOpen] = useState(false)

  // search / sort / filter
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('updated')
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favorites, setFavoritesState] = useState<Set<string>>(new Set())

  // dialogs / per-card busy state
  const [createOpen, setCreateOpen] = useState(false)
  const [createTemplateId, setCreateTemplateId] = useState<string | undefined>(undefined)
  const [renameTarget, setRenameTarget] = useState<Project | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  // Debounce the search input (cheap client filter, but matches the spec UX).
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(t)
  }, [query])

  const loadProjects = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await projectApi.getProjects()
      setProjects(data)
      setStatus('ready')
    } catch (err) {
      console.error('Failed to load projects:', err)
      setStatus('error')
    }
  }, [])

  // Load the user's projects (server-scoped) once authenticated.
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setLoginOpen(true)
      setStatus('ready')
      return
    }
    loadProjects()
  }, [authLoading, isAuthenticated, loadProjects])

  // Hydrate favorites from localStorage once the user id is known.
  useEffect(() => {
    if (user?._id) setFavoritesState(getFavorites(user._id))
  }, [user?._id])

  const openInIde = useCallback(
    (p: Project) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastProjectId', p._id)
        const first = p.files?.[0]
        localStorage.setItem('lastActiveFileName', first ? first.path || first.name || '' : '')
      }
      router.push(`/ide?project=${encodeURIComponent(p._id)}`)
    },
    [router],
  )

  const handleToggleFavorite = useCallback(
    (p: Project) => {
      if (!user?._id) return
      setFavoritesState(new Set(toggleFavorite(user._id, p._id)))
    },
    [user?._id],
  )

  const handleDuplicate = useCallback(async (p: Project) => {
    setDuplicatingId(p._id)
    try {
      const copy = await projectApi.createProject(`${p.name} (copy)`, p.files, undefined, false, {
        manifestPath: p.manifestPath,
        deployTarget: p.deployTarget ?? undefined,
      })
      const origin = getOrigin(p._id)
      if (origin) rememberOrigin(copy._id, origin)
      setProjects((prev) => [copy, ...prev])
      toast.success(`Duplicated "${p.name}"`)
    } catch (err) {
      toast.error(`Failed to duplicate: ${(err as Error).message}`)
    } finally {
      setDuplicatingId(null)
    }
  }, [])

  const submitRename = useCallback(async () => {
    const p = renameTarget
    const next = renameValue.trim()
    if (!p || !next || next === p.name) {
      setRenameTarget(null)
      return
    }
    const prevName = p.name
    setRenameTarget(null)
    setProjects((prev) => prev.map((x) => (x._id === p._id ? { ...x, name: next } : x))) // optimistic
    try {
      await projectApi.updateProject(p._id, { name: next })
      toast.success('Project renamed')
    } catch (err) {
      setProjects((prev) => prev.map((x) => (x._id === p._id ? { ...x, name: prevName } : x))) // rollback
      toast.error('Failed to rename project')
    }
  }, [renameTarget, renameValue])

  const confirmDelete = useCallback(async () => {
    const p = deleteTarget
    if (!p) return
    setDeleteTarget(null)
    setProjects((prev) => prev.filter((x) => x._id !== p._id)) // optimistic
    try {
      await projectApi.deleteProject(p._id)
      forgetOrigin(p._id)
      toast.success(`Deleted "${p.name}"`)
    } catch (err) {
      setProjects((prev) => [p, ...prev]) // rollback
      toast.error('Failed to delete project')
    }
  }, [deleteTarget])

  const startCreate = (templateId?: string) => {
    setCreateTemplateId(templateId)
    setCreateOpen(true)
  }

  // filter → sort → pin favorites to the front
  const visible = useMemo(() => {
    const filtered = filterProjects(projects, {
      query: debouncedQuery,
      network: networkFilter,
      favoritesOnly,
      favorites,
    })
    const sorted = sortProjects(filtered, sortKey)
    return [...sorted.filter((p) => favorites.has(p._id)), ...sorted.filter((p) => !favorites.has(p._id))]
  }, [projects, debouncedQuery, networkFilter, favoritesOnly, favorites, sortKey])

  const filtersActive = !!debouncedQuery || networkFilter !== 'all' || favoritesOnly
  const clearFilters = () => {
    setQuery('')
    setNetworkFilter('all')
    setFavoritesOnly(false)
  }

  // --- auth gate (mirrors the IDE) ---
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-6">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
        <div className="relative max-w-md text-center">
          <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
          <img src="/websoroban_logo.png" alt="" className="mx-auto mb-6 h-14 w-14 object-contain" aria-hidden />
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Sign in to <span className="text-gradient-brand">WebSoroban</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to see your projects and open the IDE.</p>
          <Button className="mt-6" onClick={() => setLoginOpen(true)}>
            Sign in to continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" aria-hidden />
        <CatalogTopBar user={user} />

        <div className="flex flex-1">
          <CatalogRail view={view} onSelect={setView} />

          <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-10">
            <div className="mx-auto w-full max-w-[1200px]">
            {view === 'templates' && <TemplatesView onUse={(id) => startCreate(id)} />}

            {view === 'projects' && (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search projects by name…"
                    aria-label="Search projects"
                    className="h-11 pl-9 pr-9"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Heading + controls */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <h1 className="font-display text-title font-semibold tracking-tight">Projects</h1>
                    {status === 'ready' && (
                      <span className="font-mono text-sm text-muted-foreground">{projects.length}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* network filter chips */}
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card/40 p-0.5">
                      {NETWORK_FILTERS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setNetworkFilter(f.value)}
                          className={cn(
                            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                            networkFilter === f.value
                              ? 'bg-accent text-foreground'
                              : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* favorites toggle */}
                    <button
                      onClick={() => setFavoritesOnly((v) => !v)}
                      aria-pressed={favoritesOnly}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                        favoritesOnly
                          ? 'border-warning/40 bg-warning/10 text-warning'
                          : 'border-border bg-card/40 text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <Star className={cn('h-3.5 w-3.5', favoritesOnly && 'fill-warning')} /> Favorites
                    </button>

                    {/* sort */}
                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                      <SelectTrigger className="h-9 w-[150px] gap-1.5 bg-card/40 text-xs" aria-label="Sort projects">
                        <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Grid / states */}
                <div className="mt-5">
                  {status === 'error' ? (
                    <CatalogErrorState onRetry={loadProjects} />
                  ) : status === 'ready' && projects.length === 0 ? (
                    <CatalogEmptyState onCreate={() => startCreate()} onBrowseTemplates={() => setView('templates')} />
                  ) : (
                    <motion.div
                      variants={gridContainer}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    >
                      <NewProjectCard onClick={() => startCreate()} />

                      {status === 'loading' &&
                        Array.from({ length: 5 }).map((_, i) => <ProjectCardSkeleton key={i} />)}

                      {status === 'ready' && (
                        <AnimatePresence mode="popLayout">
                          {visible.map((p) => (
                            <ProjectCard
                              key={p._id}
                              project={p}
                              favorite={favorites.has(p._id)}
                              duplicating={duplicatingId === p._id}
                              onOpen={openInIde}
                              onRename={(proj) => {
                                setRenameTarget(proj)
                                setRenameValue(proj.name)
                              }}
                              onDuplicate={handleDuplicate}
                              onDelete={setDeleteTarget}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          ))}
                        </AnimatePresence>
                      )}

                      {status === 'ready' && projects.length > 0 && visible.length === 0 && (
                        <CatalogNoMatches onClear={clearFilters} />
                      )}
                    </motion.div>
                  )}
                </div>
              </>
            )}
            </div>
          </main>
        </div>

        {/* Create */}
        <CreateProjectDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          initialTemplateId={createTemplateId}
          onCreated={(p) => {
            setCreateOpen(false)
            openInIde(p)
          }}
        />

        {/* Rename */}
        <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Rename project</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-1">
              <Label htmlFor="rename-input">Project name</Label>
              <Input
                id="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename()
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameTarget(null)}>
                Cancel
              </Button>
              <Button onClick={submitRename} disabled={!renameValue.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{deleteTarget?.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the project and its files. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MotionConfig>
  )
}
