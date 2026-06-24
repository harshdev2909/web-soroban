'use client'

import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { AlertTriangle, FileStack, Plus, RefreshCw, Rocket, Sparkles, Wand2 } from 'lucide-react'

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

/** The lead "+ New Project" card that opens the create dialog. */
export function NewProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      variants={item}
      onClick={onClick}
      className={cn(
        'group flex h-full min-h-[148px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand/40 bg-brand/[0.04] p-4 text-center transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-brand/60 hover:bg-brand/10 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-brand/15 text-brand transition-transform duration-200 group-hover:scale-105">
        <Plus className="h-5 w-5" />
      </span>
      <span className="font-display text-sm font-semibold text-foreground">New Project</span>
      <span className="text-xs text-muted-foreground">Blank, template, or wizard</span>
    </motion.button>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex h-full min-h-[148px] flex-col rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <div className="mt-auto flex items-center gap-3 pt-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="ml-auto h-3 w-8" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  )
}

/** First-run empty state — a thoughtful CTA, not a blank grid. */
export function CatalogEmptyState({
  onCreate,
  onBrowseTemplates,
}: {
  onCreate: () => void
  onBrowseTemplates: () => void
}) {
  const suggestions = [
    { icon: Sparkles, label: 'Blank contract', desc: 'Start from an empty Soroban crate' },
    { icon: FileStack, label: 'From a template', desc: 'Token, NFT, escrow, and more' },
    { icon: Wand2, label: 'Customise a contract', desc: 'Pick features, preview live, scaffold' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-xl rounded-2xl border border-border bg-card/40 px-6 py-12 text-center"
    >
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-brand">
        <Rocket className="h-7 w-7" />
      </span>
      <h2 className="mt-5 font-display text-title font-semibold">Deploy your first contract</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        You don&apos;t have any projects yet. Spin one up from scratch, a template, or the guided customiser — it
        compiles and deploys to testnet from your auto-provisioned wallet.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <Button onClick={onCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Create your first contract
        </Button>
        <Button variant="outline" onClick={onBrowseTemplates} className="gap-2">
          <FileStack className="h-4 w-4" /> Browse templates
        </Button>
      </div>
      <div className="mt-8 grid gap-2 sm:grid-cols-3">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={onCreate}
            className="rounded-lg border border-border bg-card/60 p-3 text-left transition-colors hover:border-brand/30 hover:bg-accent"
          >
            <s.icon className="h-4 w-4 text-brand" />
            <p className="mt-2 text-xs font-medium text-foreground">{s.label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.desc}</p>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export function CatalogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card/40 px-6 py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-warning/10 text-warning">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-display text-lg font-semibold">Couldn&apos;t load your projects</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        Something went wrong reaching the server. Check your connection and try again.
      </p>
      <Button variant="outline" onClick={onRetry} className="mt-5 gap-2">
        <RefreshCw className="h-4 w-4" /> Retry
      </Button>
    </div>
  )
}

/** No results after search/filter (distinct from the first-run empty state). */
export function CatalogNoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-border py-12 text-center">
      <p className="text-sm text-muted-foreground">No projects match your search.</p>
      <Button variant="ghost" size="sm" onClick={onClear} className="mt-2 text-brand hover:text-brand">
        Clear filters
      </Button>
    </div>
  )
}
