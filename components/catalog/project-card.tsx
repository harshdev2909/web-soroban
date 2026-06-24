'use client'

import { motion, type Variants } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { projectMeta } from '@/lib/catalog'
import type { Project } from '@/lib/api'
import {
  Copy,
  FileCode2,
  MoreVertical,
  Pencil,
  Pin,
  Rocket,
  SquareArrowOutUpRight,
  Star,
  Trash2,
  Loader2,
} from 'lucide-react'

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
}

export interface ProjectCardProps {
  project: Project
  favorite: boolean
  duplicating?: boolean
  onOpen: (p: Project) => void
  onRename: (p: Project) => void
  onDuplicate: (p: Project) => void
  onDelete: (p: Project) => void
  onToggleFavorite: (p: Project) => void
}

export function ProjectCard({
  project,
  favorite,
  duplicating,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: ProjectCardProps) {
  const meta = projectMeta(project)
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <motion.div variants={item} exit="exit" layout>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open ${project.name}`}
        onClick={() => onOpen(project)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen(project)
          }
        }}
        className={cn(
          'group relative flex h-full cursor-pointer flex-col rounded-xl border border-border bg-card p-4 text-left shadow-xs transition-all duration-200',
          'hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-md',
          'focus-visible:-translate-y-0.5 focus-visible:border-brand/45 focus-visible:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        {/* Top: network badge + favorite + kebab */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              meta.networkCfg.badgeClass,
            )}
            title={`Network: ${meta.networkCfg.label}`}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', meta.networkCfg.dotClass)} />
            {meta.networkCfg.label}
          </span>

          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                stop(e)
                onToggleFavorite(project)
              }}
              aria-pressed={favorite}
              aria-label={favorite ? `Unfavorite ${project.name}` : `Favorite ${project.name}`}
              className={cn(
                'grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                favorite
                  ? 'text-warning opacity-100'
                  : 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100',
              )}
            >
              <Star className={cn('h-4 w-4', favorite && 'fill-warning')} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={stop}
                  aria-label={`Actions for ${project.name}`}
                  className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground opacity-0 transition-colors hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44" onClick={stop}>
                <DropdownMenuItem onClick={() => onOpen(project)}>
                  <SquareArrowOutUpRight className="mr-2 h-4 w-4" /> Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRename(project)}>
                  <Pencil className="mr-2 h-4 w-4" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(project)}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFavorite(project)}>
                  <Pin className="mr-2 h-4 w-4" /> {favorite ? 'Unpin' : 'Pin / Favorite'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Name + origin */}
        <div className="min-h-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold leading-tight text-foreground">
            {project.name}
          </h3>
          {meta.origin && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              from <span className="text-foreground/70">{meta.origin}</span>
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-4 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="truncate">edited {meta.updated}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1" title={`${meta.fileCount} file(s)`}>
            <FileCode2 className="h-3 w-3" /> {meta.fileCount}
          </span>
          <span className="flex shrink-0 items-center gap-1" title={`${meta.deployCount} deploy(s)`}>
            <Rocket className="h-3 w-3" /> {meta.deployCount}
          </span>
        </div>

        {duplicating && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-card/70 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-brand" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
