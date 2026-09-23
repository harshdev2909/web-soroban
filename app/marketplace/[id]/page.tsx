'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Coins, Code2, Landmark, Sparkles, ShieldCheck, Store,
  TrendingUp, FileText, Lock, Check, Rocket, ChevronRight, FileCode2,
} from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { LoginModal } from '@/components/login-modal'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { templatesApi, TemplateDoc } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { TemplatePurchaseModal } from '@/components/template-purchase-modal'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const CATEGORY_META: Record<string, { icon: LucideIcon; chip: string }> = {
  token: { icon: Coins, chip: 'bg-warning/10 text-warning border-warning/25' },
  basic: { icon: Code2, chip: 'bg-brand/10 text-brand border-brand/25' },
  governance: { icon: Landmark, chip: 'bg-cosmic/10 text-cosmic border-cosmic/25' },
  nft: { icon: Sparkles, chip: 'bg-info/10 text-info border-info/25' },
  defi: { icon: TrendingUp, chip: 'bg-success/10 text-success border-success/25' },
  security: { icon: ShieldCheck, chip: 'bg-destructive/10 text-destructive border-destructive/25' },
  marketplace: { icon: Store, chip: 'bg-warning/10 text-warning border-warning/25' },
}

function categoryMeta(cat: string) {
  return CATEGORY_META[cat?.toLowerCase()] ?? { icon: FileText, chip: 'bg-muted text-muted-foreground border-border' }
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
      <div className="relative min-h-screen bg-background">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" aria-hidden />
        <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-6 h-9 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" aria-hidden />
        <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />
        <main className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-4 py-32 text-center sm:px-6">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <h1 className="font-display text-xl font-semibold">Template not found</h1>
          <p className="text-sm text-muted-foreground">This template may have been removed or the link is incorrect.</p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/marketplace"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to marketplace</Link>
          </Button>
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
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" aria-hidden />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/marketplace" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Templates
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-border" />
          <span className="truncate text-foreground">{template.name}</span>
        </nav>

        {/* Hero header */}
        <Reveal>
          <div className="mt-6 flex items-start gap-4">
            <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl border', meta.chip)}>
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider', meta.chip)}>
                  {template.category}
                </span>
                {isFree ? (
                  <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 font-mono text-[10px] font-medium text-success">Free</span>
                ) : hasAccess ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[10px] font-medium text-success">
                    <Check className="h-3 w-3" /> Owned
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] font-medium text-brand">
                    <Lock className="h-3 w-3" /> {template.price} XLM
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-display text-title font-semibold tracking-tight">{template.name}</h1>
              <p className="lead mt-2 max-w-2xl text-[15px]">{template.description}</p>
            </div>
          </div>
        </Reveal>

        {/* Body: docs + sticky CTA */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Documentation */}
          <div className="min-w-0 space-y-8">
            {doc?.summary && (
              <Reveal>
                <section>
                  <h2 className="eyebrow">Overview</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">{doc.summary}</p>
                </section>
              </Reveal>
            )}

            {doc?.usage && (
              <Reveal>
                <section>
                  <h2 className="eyebrow">Usage</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">{doc.usage}</p>
                </section>
              </Reveal>
            )}

            {doc?.functions && doc.functions.length > 0 && (
              <Reveal>
                <section>
                  <h2 className="eyebrow">Functions</h2>
                  <div className="mt-3 space-y-2.5">
                    {doc.functions.map((fn) => (
                      <div key={fn.name} className="rounded-xl border border-border bg-card/40 p-4">
                        <div className="flex flex-wrap items-baseline gap-x-1 font-mono text-sm">
                          <FileCode2 className="mr-1 h-4 w-4 shrink-0 -translate-y-px text-brand" />
                          <span className="font-semibold text-foreground">{fn.name}</span>
                          <span className="text-muted-foreground">({(fn.params || []).join(', ')})</span>
                          {fn.returns && (
                            <>
                              <span className="text-muted-foreground/60">→</span>
                              <span className="text-cosmic">{fn.returns}</span>
                            </>
                          )}
                        </div>
                        {fn.description && (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fn.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {doc?.readMore && (
              <Reveal>
                <section>
                  <h2 className="eyebrow">Read more</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">{doc.readMore}</p>
                </section>
              </Reveal>
            )}
          </div>

          {/* Sticky CTA / meta */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Price</span>
                <span className={cn('font-display text-lg font-semibold', isFree ? 'text-success' : 'text-foreground')}>
                  {isFree ? 'Free' : `${template.price} XLM`}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {locked && user && (
                  <Button className="w-full gap-1.5" onClick={() => setPurchaseModalOpen(true)}>
                    <Coins className="h-4 w-4" /> Purchase template
                  </Button>
                )}
                {locked && !user && (
                  <Button className="w-full" onClick={() => setLoginOpen(true)}>
                    Sign in to purchase
                  </Button>
                )}
                <Button asChild variant={locked ? 'outline' : 'default'} className="w-full gap-1.5">
                  <Link href={`/ide?template=${encodeURIComponent(template.id)}`}>
                    <Rocket className="h-4 w-4" /> Open in IDE
                  </Link>
                </Button>
              </div>

              {locked && (
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Premium template — purchase unlocks full source.
                </p>
              )}

              {/* Files */}
              <div className="mt-5 border-t border-border/60 pt-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Files <span className="text-muted-foreground/60">· {template.files.length}</span>
                </h3>
                <ul className="mt-2.5 space-y-1">
                  {template.files.map((f) => (
                    <li key={f} className="flex items-center gap-2 rounded-md px-1 py-1 font-mono text-[13px] text-foreground/80">
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
