'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Coins, Code2, Landmark, Sparkles, Lock, ArrowRight, Search,
  ShieldCheck, Store, TrendingUp, FileText, LayoutGrid,
} from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { LoginModal } from '@/components/login-modal'
import { Reveal } from '@/components/reveal'
import { Skeleton } from '@/components/ui/skeleton'
import { templatesApi, TemplateDoc } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type CategoryMeta = { icon: LucideIcon; tint: string; chip: string }

const CATEGORY_META: Record<string, CategoryMeta> = {
  token: { icon: Coins, tint: 'text-warning', chip: 'bg-warning/10 text-warning border-warning/25' },
  basic: { icon: Code2, tint: 'text-brand', chip: 'bg-brand/10 text-brand border-brand/25' },
  governance: { icon: Landmark, tint: 'text-cosmic', chip: 'bg-cosmic/10 text-cosmic border-cosmic/25' },
  nft: { icon: Sparkles, tint: 'text-info', chip: 'bg-info/10 text-info border-info/25' },
  defi: { icon: TrendingUp, tint: 'text-success', chip: 'bg-success/10 text-success border-success/25' },
  security: { icon: ShieldCheck, tint: 'text-destructive', chip: 'bg-destructive/10 text-destructive border-destructive/25' },
  marketplace: { icon: Store, tint: 'text-warning', chip: 'bg-warning/10 text-warning border-warning/25' },
}

function categoryMeta(cat: string): CategoryMeta {
  return CATEGORY_META[cat?.toLowerCase()] ?? {
    icon: FileText,
    tint: 'text-muted-foreground',
    chip: 'bg-muted text-muted-foreground border-border',
  }
}

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<TemplateDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    templatesApi.getMarketplace().then((res) => {
      if (res.success && res.templates) setTemplates(res.templates)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const set = new Set(templates.map((t) => t.category?.toLowerCase()).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [templates])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return templates.filter((t) => {
      const matchesCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      return matchesCat && matchesQuery
    })
  }, [templates, query, activeCategory])

  const freeCount = templates.filter((t) => t.price === 0).length

  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient deep-space backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" aria-hidden />

      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="pb-10 pt-12 sm:pt-16">
          <Reveal>
            <p className="eyebrow">Template library</p>
            <h1 className="mt-3 font-display text-title font-semibold tracking-tight">
              Ship faster with <span className="text-gradient-brand">Soroban templates</span>
            </h1>
            <p className="lead mt-3 max-w-2xl text-[15px]">
              Production-ready smart contract templates with full documentation. Free templates are
              open to everyone; premium templates unlock with the same XLM payment as subscriptions.
            </p>
          </Reveal>

          {/* Search + filters */}
          <Reveal delay={0.06}>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates…"
                  aria-label="Search templates"
                  className="h-10 w-full rounded-lg border border-border bg-card/60 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat
                  const Icon = cat === 'all' ? LayoutGrid : categoryMeta(cat).icon
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                        isActive
                          ? 'border-brand/40 bg-brand/10 text-brand'
                          : 'border-border bg-card/40 text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>
          </Reveal>

          {!loading && (
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'template' : 'templates'}
              {freeCount > 0 && <span className="text-success"> · {freeCount} free</span>}
            </p>
          )}
        </section>

        {/* Grid */}
        <section className="pb-20">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card/40 p-5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="mt-4 h-5 w-3/5" />
                  <Skeleton className="mt-3 h-3.5 w-full" />
                  <Skeleton className="mt-2 h-3.5 w-4/5" />
                  <div className="mt-5 flex items-center justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
              <Search className="h-7 w-7 text-muted-foreground/50" />
              <p className="text-sm text-foreground">No templates match your search</p>
              <button
                onClick={() => { setQuery(''); setActiveCategory('all') }}
                className="text-xs text-brand hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, i) => {
                const meta = categoryMeta(t.category)
                const Icon = meta.icon
                const isFree = t.price === 0
                return (
                  <Reveal key={t.id} delay={Math.min(i * 0.04, 0.24)}>
                    <Link href={`/marketplace/${t.id}`} className="group block h-full">
                      <article className="flex h-full flex-col rounded-xl border border-border bg-card/40 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-card hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg border', meta.chip)}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider', meta.chip)}>
                            {t.category}
                          </span>
                        </div>

                        <h2 className="mt-4 font-display text-base font-semibold text-foreground">{t.name}</h2>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {t.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                          {isFree ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 font-mono text-[11px] font-medium text-success">
                              Free
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 font-mono text-[11px] font-medium text-brand">
                              <Lock className="h-3 w-3" />
                              {t.price} XLM
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                            View
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <PlaygroundFooter />
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}
