'use client'

import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Index } from '@/components/landing/chapter'
import { cn } from '@/lib/utils'
import { AlertTriangle, FileStack, Plus, RefreshCw, Sparkles, Wand2 } from 'lucide-react'

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
        'group flex h-full min-h-[148px] flex-col justify-between rounded-lg border border-dashed border-border p-4 text-left transition-[border-color,background-color] duration-150',
        'hover:border-foreground/40 hover:bg-card',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <span className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors duration-150 group-hover:border-brand/60 group-hover:text-brand">
        <Plus className="h-4 w-4" />
      </span>
      <span>
        <span className="block font-display text-base font-medium text-foreground">New project</span>
        <span className="mt-1 block font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">Blank · template · wizard</span>
      </span>
    </motion.button>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex h-full min-h-[148px] flex-col rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-16 rounded-sm" />
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
      className="figure ticks overflow-hidden"
    >
      <div className="grid gap-8 p-6 lg:grid-cols-12 lg:items-end lg:p-8">
        <div className="lg:col-span-7">
          <p className="eyebrow">Projects · 00</p>
          <h2 className="mt-4 font-display text-title font-medium">Deploy your first contract.</h2>
        </div>
        <div className="lg:col-span-5">
          <p className="text-sm leading-6 text-muted-foreground">
            You don&apos;t have any projects yet. Spin one up from scratch, a template, or the guided customiser. It
            compiles and deploys to testnet from your auto-provisioned wallet.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={onCreate} className="lit gap-2">
              <Plus className="h-4 w-4" /> Create your first contract
            </Button>
            <Button variant="outline" onClick={onBrowseTemplates} className="gap-2">
              <FileStack className="h-4 w-4" /> Browse templates
            </Button>
          </div>
        </div>
      </div>
      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
        {suggestions.map((s, index) => (
          <button
            key={s.label}
            onClick={onCreate}
            className="group bg-card p-5 text-left transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between">
              <Index>0{index + 1}</Index>
              <s.icon className="h-4 w-4 text-muted-foreground transition-colors duration-150 group-hover:text-brand" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">{s.label}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{s.desc}</p>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export function CatalogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="figure max-w-xl p-6" role="alert">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
        <p className="eyebrow text-warning">Could not load</p>
      </div>
      <h2 className="mt-4 font-display text-xl font-medium">Your projects did not load.</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
    <div className="col-span-full flex flex-col items-start gap-2 rounded-lg border border-dashed border-border px-5 py-10">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">No projects match your search.</p>
      <Button variant="ghost" size="sm" onClick={onClear} className="-ml-3 text-brand hover:text-brand">
        Clear filters
      </Button>
    </div>
  )
}
