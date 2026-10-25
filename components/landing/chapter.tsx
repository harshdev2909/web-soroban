'use client'

import type { ReactNode } from 'react'
import { Reveal } from '@/components/reveal'
import { cn } from '@/lib/utils'

/**
 * A numbered chapter of the landing story: a labelled hairline, then the
 * heading row, then whatever the chapter shows. Every chapter shares this
 * rhythm so the page reads as one document.
 */
export function Chapter({
  index,
  label,
  figure,
  id,
  className,
  children,
}: {
  index: string
  label: string
  /** Figure caption shown at the right end of the rule, e.g. "fig. 02 · 402 flow". */
  figure?: string
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={cn('relative mx-auto max-w-7xl px-6', className)}>
      <div className="flex items-center justify-between gap-6 border-t border-border pt-4 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
        <span className="flex items-center gap-3">
          <span className="text-foreground">{index}</span>
          <span aria-hidden="true" className="h-px w-6 bg-border" />
          {label}
        </span>
        {figure && <span className="hidden sm:inline">{figure}</span>}
      </div>
      {children}
    </section>
  )
}

export function ChapterHeading({
  title,
  lead,
  aside,
  className,
}: {
  title: ReactNode
  lead?: ReactNode
  /** Optional element on the right at desktop (a CTA, a note). */
  aside?: ReactNode
  className?: string
}) {
  return (
    <Reveal className={cn('grid gap-8 pt-10 lg:grid-cols-12 lg:items-end', className)}>
      <h2 className="font-display text-display font-medium lg:col-span-7">{title}</h2>
      <div className="flex flex-col gap-5 lg:col-span-5 lg:items-start">
        {lead && <p className="lead text-base sm:text-lg">{lead}</p>}
        {aside}
      </div>
    </Reveal>
  )
}

/**
 * Background for a figure: a faint hairline grid fading out at the edges and,
 * optionally, a pool of iris light behind the frame. Wrap the figure in a
 * `relative` element and render this first.
 */
export function FigureBackdrop({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute -inset-10 -z-10', className)} aria-hidden="true">
      <div className="bg-blueprint mask-radial absolute inset-0 opacity-70" />
      {light && <div className="light-pool absolute left-1/2 top-1/2 h-[80%] w-[70%] -translate-x-1/2 -translate-y-1/2" />}
    </div>
  )
}

/** Mono index numeral used in lists and figure labels. */
export function Index({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground', className)}>{children}</span>
}
