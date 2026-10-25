'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutGrid, LayoutTemplate, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CatalogView = 'projects' | 'templates'

const ITEMS: { view: CatalogView; label: string; index: string; icon: LucideIcon }[] = [
  { view: 'projects', label: 'All projects', index: '01', icon: LayoutGrid },
  { view: 'templates', label: 'Templates', index: '02', icon: LayoutTemplate },
]

function RailButton({
  active,
  label,
  index,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  index: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150',
        active ? 'text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId="catalog-rail"
          className="absolute inset-0 -z-10 rounded-md bg-accent"
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      )}
      {active && (
        <motion.span
          layoutId="catalog-rail-bar"
          className="absolute -left-4 bottom-2 top-2 w-px bg-brand"
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      )}
      <Icon className={cn('h-4 w-4 shrink-0', active && 'text-brand')} aria-hidden />
      <span className="truncate">{label}</span>
      <span className="ml-auto font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground">{index}</span>
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
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col gap-1 self-start border-r border-border bg-sidebar px-4 py-6 md:flex">
        <p className="eyebrow px-3 pb-4">Catalog</p>
        <nav className="flex flex-col gap-0.5" aria-label="Catalog">
          {ITEMS.map((it) => (
            <RailButton
              key={it.view}
              active={view === it.view}
              label={it.label}
              index={it.index}
              icon={it.icon}
              onClick={() => onSelect(it.view)}
            />
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-3">
          <Link
            href="/billing"
            className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden /> Settings
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
                'flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-md font-mono text-[0.62rem] uppercase tracking-[0.14em] transition-colors duration-150',
                active ? 'text-brand' : 'text-muted-foreground',
              )}
            >
              <it.icon className="h-4 w-4" aria-hidden />
              {it.label.replace('All ', '')}
            </button>
          )
        })}
        <Link
          href="/billing"
          className="flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-md font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground"
        >
          <Settings className="h-4 w-4" aria-hidden /> Settings
        </Link>
      </nav>
    </>
  )
}
