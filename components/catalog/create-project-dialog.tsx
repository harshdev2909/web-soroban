'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ContractWizard } from '@/components/wizard/contract-wizard'
import { cn } from '@/lib/utils'
import { rememberOrigin } from '@/lib/catalog'
import { projectApi, templatesApi, type Project, type Template } from '@/lib/api'
import { useNetwork } from '@/contexts/NetworkContext'
import { getNetwork, type NetworkId } from '@/lib/networks'
import { FileStack, Lock, Loader2, Plus, SquarePen, Wand2 } from 'lucide-react'

type Mode = 'blank' | 'template' | 'wizard'

const isLocked = (t: Template) => t.price !== undefined && t.price > 0 && !t.hasAccess

export interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Fired after the Project row exists server-side; the catalog routes to the IDE. */
  onCreated: (project: Project) => void
  /** Preselect the "from template" path (e.g. opened from the Templates view). */
  initialMode?: Mode
  /** Preselect a specific template id (forces template mode). */
  initialTemplateId?: string
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onCreated,
  initialMode = 'blank',
  initialTemplateId,
}: CreateProjectDialogProps) {
  const { network: activeNetwork, setNetwork } = useNetwork()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [name, setName] = useState('')
  const [network, setLocalNetwork] = useState<NetworkId>('testnet')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  // Reset to a clean slate each time the dialog opens.
  useEffect(() => {
    if (!open) return
    setMode(initialTemplateId ? 'template' : initialMode)
    setName('')
    setLocalNetwork(activeNetwork === 'mainnet' ? 'mainnet' : 'testnet')
    setSelectedTemplate(initialTemplateId ?? null)
    setCreating(false)
  }, [open, initialMode, initialTemplateId, activeNetwork])

  // Load the built-in template list lazily when first needed.
  useEffect(() => {
    if (!open || mode !== 'template' || templates.length || loadingTemplates) return
    setLoadingTemplates(true)
    templatesApi
      .getTemplates()
      .then(setTemplates)
      .catch(() => toast.error('Could not load templates'))
      .finally(() => setLoadingTemplates(false))
  }, [open, mode, templates.length, loadingTemplates])

  const chosen = useMemo(() => templates.find((t) => t.id === selectedTemplate) || null, [templates, selectedTemplate])

  const finalize = (project: Project, origin?: string) => {
    setNetwork(network)
    if (origin) rememberOrigin(project._id, origin)
    onCreated(project)
  }

  const handleCreate = async () => {
    if (mode === 'wizard') {
      onOpenChange(false)
      setWizardOpen(true)
      return
    }
    const projectName = name.trim() || (chosen?.name ?? 'Untitled Project')
    if (mode === 'template' && !chosen) {
      toast.error('Pick a template to start from')
      return
    }
    setCreating(true)
    try {
      const templateId = mode === 'template' ? chosen!.id : 'blank'
      const project = await projectApi.createProject(projectName, undefined, templateId)
      finalize(project, mode === 'template' ? chosen!.name : undefined)
      toast.success(`Created "${project.name}"`)
      onOpenChange(false)
    } catch (err) {
      toast.error(`Failed to create project: ${(err as Error).message}`)
    } finally {
      setCreating(false)
    }
  }

  const confirmLabel = mode === 'wizard' ? 'Open customiser' : 'Create project'
  const canConfirm = mode === 'wizard' || (mode === 'blank' ? true : !!chosen)

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !creating && onOpenChange(o)}>
        <DialogContent className="flex max-h-[88vh] flex-col gap-0 p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="font-display">New project</DialogTitle>
            <DialogDescription>Name it, choose a starting point, and pick a default network.</DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="cp-name">Project name</Label>
              <Input
                id="cp-name"
                placeholder={chosen?.name || 'My Soroban Contract'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={creating}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canConfirm && mode !== 'template') handleCreate()
                }}
              />
            </div>

            {/* Starting point */}
            <div className="space-y-2">
              <Label>Start from</Label>
              <div className="grid grid-cols-3 gap-2">
                <ModeButton active={mode === 'blank'} onClick={() => setMode('blank')} icon={<SquarePen className="h-4 w-4" />} label="Blank" sub="Empty contract" />
                <ModeButton active={mode === 'template'} onClick={() => setMode('template')} icon={<FileStack className="h-4 w-4" />} label="Template" sub="Starter code" />
                <ModeButton active={mode === 'wizard'} onClick={() => setMode('wizard')} icon={<Wand2 className="h-4 w-4" />} label="Customise" sub="Guided wizard" />
              </div>
            </div>

            {mode === 'template' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Choose a template</span>
                  <Link href="/marketplace" target="_blank" className="text-xs text-brand hover:underline">
                    Browse all
                  </Link>
                </div>
                <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {loadingTemplates
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[68px] rounded-lg" />)
                    : templates.map((t) => {
                        const locked = isLocked(t)
                        const selected = selectedTemplate === t.id
                        return (
                          <button
                            key={t.id}
                            disabled={locked}
                            onClick={() => setSelectedTemplate(t.id)}
                            className={cn(
                              'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                              locked && 'cursor-not-allowed opacity-60',
                              selected
                                ? 'border-brand/60 bg-brand/10'
                                : 'border-border bg-card/40 hover:border-brand/30 hover:bg-accent',
                            )}
                          >
                            <div className="flex w-full items-center gap-1.5">
                              <span className="truncate text-sm font-medium text-foreground">{t.name}</span>
                              {locked && <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-warning" />}
                            </div>
                            <p className="line-clamp-2 text-[11px] text-muted-foreground">{t.description}</p>
                            <span className="mt-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                              {t.category}
                            </span>
                          </button>
                        )
                      })}
                </div>
              </div>
            )}

            {mode === 'wizard' && (
              <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground">
                The contract customiser lets you pick a type (Fungible, NFT, Stablecoin, Counter), toggle features, and
                preview the code live before scaffolding. Continue to open it.
              </div>
            )}

            {/* Default network */}
            <div className="space-y-2">
              <Label>Default network</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['testnet', 'mainnet'] as NetworkId[]).map((id) => {
                  const cfg = getNetwork(id)
                  const active = network === id
                  return (
                    <button
                      key={id}
                      onClick={() => setLocalNetwork(id)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                        active ? cn(cfg.badgeClass, 'font-medium') : 'border-border bg-card/40 text-muted-foreground hover:bg-accent',
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full', cfg.dotClass)} />
                      {cfg.label}
                      <span className="ml-auto text-[10px] uppercase tracking-wide opacity-70">
                        {id === 'testnet' ? 'free faucet' : 'real XLM'}
                      </span>
                    </button>
                  )
                })}
              </div>
              {network === 'mainnet' && (
                <p className="text-[11px] text-warning">Mainnet uses real XLM — you confirm every deploy in the IDE.</p>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!canConfirm || creating} className="gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'wizard' ? <Wand2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {creating ? 'Creating…' : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guided contract customiser — scaffolds + reports the new project up. */}
      <ContractWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onProjectCreate={(p) => {
          finalize(p, 'Custom contract')
          setWizardOpen(false)
        }}
        initialState={null}
      />
    </>
  )
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  sub: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
        active ? 'border-brand/60 bg-brand/10' : 'border-border bg-card/40 hover:border-brand/30 hover:bg-accent',
      )}
    >
      <span className={cn('grid h-7 w-7 place-items-center rounded-md', active ? 'bg-brand/15 text-brand' : 'bg-muted text-muted-foreground')}>
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-[11px] text-muted-foreground">{sub}</span>
    </button>
  )
}
