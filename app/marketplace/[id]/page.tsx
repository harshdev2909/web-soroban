'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Coins, Code2, Landmark, Sparkles, ShieldCheck, Store,
  TrendingUp, FileText, Lock, Check, Rocket, FileCode2, WalletCards,
} from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { LoginModal } from '@/components/login-modal'
import { Reveal } from '@/components/reveal'
import { Index } from '@/components/landing/chapter'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { templatesApi, TemplateDoc } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { TemplatePurchaseModal } from '@/components/template-purchase-modal'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const CATEGORY_META: Record<string, { icon: LucideIcon; chip: string }> = {
  token: { icon: Coins, chip: 'border-warning/25 text-warning' },
  basic: { icon: Code2, chip: 'border-brand/25 text-brand' },
  governance: { icon: Landmark, chip: 'border-cosmic/25 text-cosmic' },
  nft: { icon: Sparkles, chip: 'border-info/25 text-info' },
  defi: { icon: TrendingUp, chip: 'border-success/25 text-success' },
  security: { icon: ShieldCheck, chip: 'border-destructive/25 text-destructive' },
  marketplace: { icon: Store, chip: 'border-warning/25 text-warning' },
  payments: { icon: WalletCards, chip: 'border-brand/25 text-brand' },
}

function categoryMeta(cat: string) {
  return CATEGORY_META[cat?.toLowerCase()] ?? { icon: FileText, chip: 'border-border text-muted-foreground' }
}

export default function TemplateDocPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const [template, setTemplate] = useState<TemplateDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!id) return
    templatesApi.getTemplateDoc(id).then((res) => {
      if (res.success && res.template) setTemplate(res.template)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const purchased = (user?.purchasedTemplates as string[] | undefined) || []
  const hasAccess = template ? (template.price === 0 || purchased.includes(template.id)) : false

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground">
        <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />
        <main className="mx-auto max-w-7xl px-6 py-12">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-8 h-12 w-2/3" />
          <Skeleton className="mt-4 h-4 w-1/2" />
          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg lg:col-span-4" />
          </div>
        </main>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="relative min-h-screen bg-background text-foreground">
        <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />
        <main className="mx-auto max-w-7xl px-6 py-24">
          <div className="figure ticks max-w-md p-8">
            <p className="eyebrow flex items-center gap-3"><FileText className="h-3.5 w-3.5" aria-hidden /> 404</p>
            <h1 className="mt-6 font-display text-title font-medium">Template not found.</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">This template may have been removed or the link is incorrect.</p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/marketplace"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to marketplace</Link>
            </Button>
          </div>
        </main>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    )
  }

  const doc = template.documentation
  const meta = categoryMeta(template.category)
  const Icon = meta.icon
  const isFree = template.price === 0
  const locked = !isFree && !hasAccess

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:pt-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/marketplace" className="inline-flex min-h-9 items-center gap-1.5 transition-colors duration-150 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Templates
          </Link>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span className="truncate text-foreground">{template.name}</span>
        </nav>

        {/* Header */}
        <Reveal className="mt-8 grid gap-8 border-b border-border pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em]">
              <span className={cn('inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5', meta.chip)}>
                <Icon className="h-3 w-3" aria-hidden />
                {template.category}
              </span>
              {isFree ? (
                <span className="inline-flex items-center rounded-sm border border-success/30 px-1.5 py-0.5 text-success">Free</span>
              ) : hasAccess ? (
                <span className="inline-flex items-center gap-1 rounded-sm border border-success/30 px-1.5 py-0.5 text-success">
                  <Check className="h-3 w-3" /> Owned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-sm border border-brand/30 px-1.5 py-0.5 text-brand">
                  <Lock className="h-3 w-3" /> {template.price} XLM
                </span>
              )}
            </div>
            <h1 className="mt-5 font-display text-display font-medium">{template.name}</h1>
          </div>
          <p className="lead text-base lg:col-span-5">{template.description}</p>
        </Reveal>

        {/* Body: docs + sticky CTA */}
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* Documentation */}
          <div className="min-w-0 space-y-10 lg:col-span-8">
            {doc?.summary && (
              <Reveal>
                <section>
                  <h2 className="eyebrow">Overview</h2>
                  <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">{doc.summary}</p>
                </section>
              </Reveal>
            )}

            {doc?.usage && (
              <Reveal>
                <section>
                  <h2 className="eyebrow">Usage</h2>
                  <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">{doc.usage}</p>
                </section>
              </Reveal>
            )}

            {doc?.functions && doc.functions.length > 0 && (
              <Reveal>
                <section>
                  <h2 className="eyebrow">Functions · {String(doc.functions.length).padStart(2, '0')}</h2>
                  <ul className="mt-4 border-t border-border">
                    {doc.functions.map((fn, index) => (
                      <li key={fn.name} className="grid gap-3 border-b border-border py-4 sm:grid-cols-[3rem_1fr]">
                        <Index className="pt-1">{String(index + 1).padStart(2, '0')}</Index>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-1 font-mono text-sm">
                            <span className="font-medium text-foreground">{fn.name}</span>
                            <span className="text-muted-foreground">({(fn.params || []).join(', ')})</span>
                            {fn.returns && (
                              <>
                                <span className="text-muted-foreground/60">→</span>
                                <span className="text-brand">{fn.returns}</span>
                              </>
                            )}
                          </div>
                          {fn.description && (
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{fn.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {doc?.readMore && (
              <Reveal>
                <section>
                  <h2 className="eyebrow">Read more</h2>
                  <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">{doc.readMore}</p>
                </section>
              </Reveal>
            )}
          </div>

          {/* Sticky CTA / meta */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
            <div className="figure ticks p-5">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Price</span>
                <span className={cn('font-mono-tnum text-xl font-medium', isFree ? 'text-success' : 'text-foreground')}>
                  {isFree ? 'Free' : `${template.price} XLM`}
                </span>
              </div>

              <div className="mt-5 space-y-2">
                {locked && user && (
                  <Button className="lit w-full gap-1.5" onClick={() => setPurchaseModalOpen(true)}>
                    <Coins className="h-4 w-4" /> Purchase template
                  </Button>
                )}
                {locked && !user && (
                  <Button className="lit w-full" onClick={() => setLoginOpen(true)}>
                    Sign in to purchase
                  </Button>
                )}
                <Button asChild variant={locked ? 'outline' : 'default'} className={cn('w-full gap-1.5', !locked && 'lit')}>
                  <Link href={`/ide?template=${encodeURIComponent(template.id)}`}>
                    <Rocket className="h-4 w-4" /> Open in IDE
                  </Link>
                </Button>
              </div>

              {locked && (
                <p className="mt-3 font-mono text-[0.68rem] text-muted-foreground">
                  Premium template. Purchase unlocks the full source.
                </p>
              )}

              {/* Files */}
              <div className="mt-5 border-t border-border pt-4">
                <h3 className="eyebrow">
                  Files · {String(template.files.length).padStart(2, '0')}
                </h3>
                <ul className="mt-3 space-y-1">
                  {template.files.map((f) => (
                    <li key={f} className="flex items-center gap-2 py-1 font-mono text-[0.78rem] text-muted-foreground">
                      <FileCode2 className="h-3.5 w-3.5 shrink-0 text-brand/70" />
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <PlaygroundFooter />

      <TemplatePurchaseModal
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        template={template}
        onSuccess={() => setPurchaseModalOpen(false)}
      />
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}
