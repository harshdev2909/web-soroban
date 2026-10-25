'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Coins, Code2, Landmark, Sparkles, Lock, ArrowUpRight, Search,
  ShieldCheck, Store, TrendingUp, FileText, LayoutGrid, WalletCards,
} from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { LoginModal } from '@/components/login-modal'
import { Reveal } from '@/components/reveal'
import { Index } from '@/components/landing/chapter'
import { Skeleton } from '@/components/ui/skeleton'
import { templatesApi, TemplateDoc } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type CategoryMeta = { icon: LucideIcon; tint: string; chip: string }

const CATEGORY_META: Record<string, CategoryMeta> = {
  token: { icon: Coins, tint: 'text-warning', chip: 'border-warning/25 text-warning' },
  basic: { icon: Code2, tint: 'text-brand', chip: 'border-brand/25 text-brand' },
  governance: { icon: Landmark, tint: 'text-cosmic', chip: 'border-cosmic/25 text-cosmic' },
  nft: { icon: Sparkles, tint: 'text-info', chip: 'border-info/25 text-info' },
  defi: { icon: TrendingUp, tint: 'text-success', chip: 'border-success/25 text-success' },
  security: { icon: ShieldCheck, tint: 'text-destructive', chip: 'border-destructive/25 text-destructive' },
  marketplace: { icon: Store, tint: 'text-warning', chip: 'border-warning/25 text-warning' },
  payments: { icon: WalletCards, tint: 'text-brand', chip: 'border-brand/25 text-brand' },
}

function categoryMeta(cat: string): CategoryMeta {
  return CATEGORY_META[cat?.toLowerCase()] ?? {
    icon: FileText,
    tint: 'text-muted-foreground',
    chip: 'border-border text-muted-foreground',
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
    <div className="relative min-h-screen bg-background text-foreground">
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      <main className="mx-auto max-w-7xl px-6">
        {/* Hero */}
        <section className="border-b border-border pb-10 pt-14 lg:pt-20">
          <Reveal className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow">Templates</p>
              <h1 className="mt-4 font-display text-display-lg font-medium">Soroban templates, ready to ship.</h1>
            </div>
            <div className="lg:col-span-5">
              <p className="lead text-base">
                Production-ready smart contract templates with full documentation. Free templates are open to
                everyone; premium templates unlock with the same XLM payment as subscriptions.
              </p>
              {!loading && (
                <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {String(filtered.length).padStart(2, '0')} {filtered.length === 1 ? 'template' : 'templates'}
                  {freeCount > 0 && <span className="text-success"> · {freeCount} free</span>}
                </p>
              )}
            </div>
          </Reveal>

          {/* Search + filters */}
          <Reveal delay={0.06}>
            <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by category">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat
                  const Icon = cat === 'all' ? LayoutGrid : categoryMeta(cat).icon
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      aria-pressed={isActive}
                      className={cn(
                        'inline-flex min-h-9 items-center gap-1.5 rounded-sm border px-2.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors duration-150',
                        isActive
                          ? 'border-foreground bg-card text-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cat}
                    </button>
                  )
                })}
              </div>
              <div className="relative w-full lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates…"
                  aria-label="Search templates"
                  className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 font-mono text-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </Reveal>
        </section>

        {/* Grid */}
        <section className="py-10 pb-24">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-5 w-16 rounded-sm" />
                  </div>
                  <Skeleton className="mt-6 h-5 w-3/5" />
                  <Skeleton className="mt-3 h-3.5 w-full" />
                  <Skeleton className="mt-2 h-3.5 w-4/5" />
                  <div className="mt-6 flex items-center justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-border px-6 py-14">
              <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
              <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">No templates match your search.</p>
              <button
                onClick={() => { setQuery(''); setActiveCategory('all') }}
                className="min-h-9 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-brand hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, i) => {
                const meta = categoryMeta(t.category)
                const Icon = meta.icon
                const isFree = t.price === 0
                return (
                  <Reveal key={t.id} delay={Math.min(i * 0.04, 0.24)}>
                    <Link href={`/marketplace/${t.id}`} className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                      <article className="flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors duration-150 group-hover:border-foreground/30">
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-3">
                            <Index>{String(i + 1).padStart(2, '0')}</Index>
                            <Icon className={cn('h-4 w-4', meta.tint)} aria-hidden />
                          </span>
                          <span className={cn('inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em]', meta.chip)}>
                            {t.category}
                          </span>
                        </div>

                        <h2 className="mt-6 font-display text-lg font-medium text-foreground">{t.name}</h2>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {t.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between border-t border-border pt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em]">
                          {isFree ? (
                            <span className="text-success">Free</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-brand">
                              <Lock className="h-3 w-3" />
                              {t.price} XLM
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
                            View
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
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
