import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { HackMeridianFrame } from '@/components/hackmeridian/frame'
import { PartnerMarks } from '@/components/hackmeridian/marks'
import {
  APPLY_URL,
  EVENT_META,
  ideas,
  themeLabel,
  themes,
  type ThemeId,
} from '@/lib/hackmeridian'

export const metadata: Metadata = {
  title: 'HackMeridian Idea Bank · WebSoroban',
  description:
    'Ten buildable Stellar briefs for HackMeridian: RWA credit, PayFi, private payroll, agent wallets, and cross-border treasury.',
}

const themeIds = new Set(themes.map((theme) => theme.id))

function difficultyClass(difficulty: string) {
  if (difficulty.startsWith('Beginner')) return 'border-success/30 bg-success/10 text-success'
  if (difficulty === 'Intermediate') return 'border-brand/30 bg-brand/10 text-brand'
  return 'border-hm/40 bg-hm/10 text-hm'
}

export default async function HackMeridianPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>
}) {
  const { theme: raw } = await searchParams
  const theme = raw && themeIds.has(raw as ThemeId | 'all') ? (raw as ThemeId | 'all') : 'all'
  const visible = theme === 'all' ? ideas : ideas.filter((idea) => idea.theme === theme)
  const activeTheme = themes.find((item) => item.id === theme) ?? themes[0]

  return (
    <HackMeridianFrame>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 md:pb-20 md:pt-20">
          <PartnerMarks />
          <p className="eyebrow mt-8 text-hm">Idea Bank · {EVENT_META}</p>
          <h1 className="font-display mt-4 max-w-3xl text-display font-semibold">
            Build something worth shipping.
          </h1>
          <p className="lead mt-5 max-w-2xl text-base md:text-lg">
            Ten HackMeridian briefs organized the way Stellar is actually moving: RWA finance, PayFi,
            agentic commerce, privacy, and cross-border infrastructure. Each one is a contract plan,
            not a slogan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={APPLY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-hm px-5 text-sm font-semibold text-hm-foreground transition-colors duration-200 hover:bg-hm/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Apply to HackMeridian
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Read the Soroban docs
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Idea themes">
          {themes.map((item) => {
            const selected = item.id === theme
            return (
              <Link
                key={item.id}
                href={item.id === 'all' ? '/hackmeridian' : `/hackmeridian?theme=${item.id}`}
                role="tab"
                aria-selected={selected}
                className={
                  selected
                    ? 'inline-flex h-10 shrink-0 items-center rounded-full bg-hm px-4 text-sm font-semibold text-hm-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                    : 'inline-flex h-10 shrink-0 items-center rounded-full border border-border px-4 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                }
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{activeTheme.blurb}</p>

        {visible.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card px-6 py-12 text-center">
            <p className="font-display text-lg font-semibold">No briefs in this theme</p>
            <p className="mt-2 text-sm text-muted-foreground">The bank has ten ideas across the five tracks.</p>
            <Link
              href="/hackmeridian"
              className="mt-5 inline-flex h-10 items-center rounded-full bg-hm px-4 text-sm font-semibold text-hm-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Show all ideas
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {visible.map((idea) => (
              <li key={idea.slug}>
                <Link
                  href={`/hackmeridian/${idea.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-hm/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:hover:translate-y-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-sm text-hm">{idea.number}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${difficultyClass(idea.difficulty)}`}>
                      {idea.difficulty}
                    </span>
                  </div>
                  <h2 className="font-display mt-4 text-xl font-semibold tracking-tight">{idea.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {idea.category}
                    <span className="px-1.5 text-border">/</span>
                    {themeLabel(idea.theme)}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{idea.tagline}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {idea.buildWith.slice(0, 4).map((tool) => (
                      <li key={tool} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">
                        {tool}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                    Open the brief
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </HackMeridianFrame>
  )
}
