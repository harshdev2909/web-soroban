'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutGrid, LayoutTemplate, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CatalogView = 'projects' | 'templates'

const ITEMS: { view: CatalogView; label: string; icon: LucideIcon }[] = [
  { view: 'projects', label: 'All Projects', icon: LayoutGrid },
  { view: 'templates', label: 'Templates', icon: LayoutTemplate },
]

function RailButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-colors',
        active ? 'text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId="catalog-rail"
          className="absolute inset-0 -z-10 rounded-lg bg-accent"
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      )}
      {active && (
        <motion.span
          layoutId="catalog-rail-bar"
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-brand"
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      )}
      <Icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-brand')} aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  )
}

export function CatalogRail({
  view,
  onSelect,
}: {
  view: CatalogView
  onSelect: (v: CatalogView) => void
}) {
  return (
    <>
      {/* Desktop rail — anchored flush-left, full height below the top bar */}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 self-start flex-col gap-1.5 border-r border-border bg-card/20 px-4 py-6 md:flex">
        <p className="px-3 pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Catalog
        </p>
        <nav className="flex flex-col gap-1.5" aria-label="Catalog">
          {ITEMS.map((it) => (
            <RailButton
              key={it.view}
              active={view === it.view}
              label={it.label}
              icon={it.icon}
              onClick={() => onSelect(it.view)}
            />
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-3">
          <Link
            href="/billing"
            className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-[18px] w-[18px] shrink-0" aria-hidden /> Settings
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-background/90 px-2 py-1.5 backdrop-blur-xl md:hidden"
        aria-label="Catalog"
      >
        {ITEMS.map((it) => {
          const active = view === it.view
          return (
            <button
              key={it.view}
              onClick={() => onSelect(it.view)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[11px] font-medium transition-colors',
                active ? 'text-brand' : 'text-muted-foreground',
              )}
            >
              <it.icon className="h-5 w-5" aria-hidden />
              {it.label.replace('All ', '')}
            </button>
          )
        })}
        <Link
          href="/billing"
          className="flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[11px] font-medium text-muted-foreground"
        >
          <Settings className="h-5 w-5" aria-hidden /> Settings
        </Link>
      </nav>
    </>
  )
}
