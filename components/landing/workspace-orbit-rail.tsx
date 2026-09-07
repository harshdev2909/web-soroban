'use client'

import Link from 'next/link'
import type { ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  DataProofGlyph,
  LocalnetGlyph,
  MppGlyph,
  NovaCoreGlyph,
  SorobanGlyph,
  WebAppGlyph,
  X402Glyph,
  type NovaGlyphProps,
} from '@/components/landing/nova-glyphs'
import { cn } from '@/lib/utils'

type Glyph = ComponentType<NovaGlyphProps>

const stations: Array<{
  number: string
  label: string
  detail: string
  href: string
  glyph: Glyph
}> = [
  { number: '01', label: 'Web app', detail: 'Interface', href: '#platform', glyph: WebAppGlyph },
  { number: '02', label: 'Soroban', detail: 'Contracts', href: '#platform', glyph: SorobanGlyph },
  { number: '03', label: 'x402', detail: 'Paid APIs', href: '#payments', glyph: X402Glyph },
  { number: '04', label: 'MPP', detail: 'Sessions', href: '#payments', glyph: MppGlyph },
  { number: '05', label: 'Localnet', detail: 'Test loop', href: '#stellar-local', glyph: LocalnetGlyph },
  { number: '06', label: 'Data + ZK', detail: 'Proof layer', href: '#stellar-stack', glyph: DataProofGlyph },
]

export function WorkspaceOrbitRail({ className }: { className?: string }) {
  const reduce = useReducedMotion()

  return (
    <div className={cn('relative overflow-hidden rounded-3xl bg-foreground text-background shadow-lg', className)}>
      <div className="pointer-events-none absolute inset-0 nova-rail-texture" aria-hidden="true" />
      <div className="relative grid gap-5 p-4 sm:p-5 lg:grid-cols-[17rem_1fr] lg:items-center lg:gap-6">
        <div className="flex items-center gap-3 lg:border-r lg:border-background/15 lg:pr-6">
          <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-md shadow-brand/20">
            <NovaCoreGlyph className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-foreground bg-success" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-base font-semibold lg:whitespace-nowrap">One continuous workspace</p>
            <p className="mt-0.5 text-sm text-background/55">Prompt → inspect → test → ship</p>
          </div>
        </div>

        <nav aria-label="WebSoroban build pipeline" className="relative">
          <svg className="pointer-events-none absolute left-[7%] top-5 hidden h-8 w-[86%] overflow-visible text-brand/55 lg:block" viewBox="0 0 720 32" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d="M0 17C54 17 61 6 120 6c59 0 63 20 120 20 58 0 63-18 120-18 58 0 65 17 120 17 59 0 65-19 120-19 59 0 66 11 120 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.circle
              cx="360"
              cy="8"
              r="3"
              className="fill-brand"
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 24, delay: 0.78 }}
            />
          </svg>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-1">
            {stations.map((station, index) => {
              const StationGlyph = station.glyph
              return (
                <motion.div
                  key={station.label}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 27, delay: 0.4 + index * 0.045 }}
                >
                  <Link
                    href={station.href}
                    className="group relative z-10 flex min-h-16 items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-[background-color,transform] duration-150 hover:bg-background/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-foreground active:translate-y-px lg:min-h-20 lg:flex-col lg:justify-start lg:gap-1.5 lg:px-1 lg:text-center"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-background/15 bg-background/[0.06] text-background/70 transition-[background-color,border-color,color,transform] duration-150 group-hover:-translate-y-0.5 group-hover:border-brand/55 group-hover:bg-brand group-hover:text-brand-foreground lg:h-10 lg:w-10">
                      <StationGlyph className="h-[1.15rem] w-[1.15rem] lg:h-5 lg:w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-baseline gap-1.5 lg:justify-center"><span className="font-mono text-[0.62rem] text-brand">{station.number}</span><span className="whitespace-nowrap font-display text-xs font-medium text-background/85">{station.label}</span></span>
                      <span className="mt-0.5 block font-mono text-[0.58rem] uppercase tracking-[0.12em] text-background/35">{station.detail}</span>
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
