'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Index } from '@/components/landing/chapter'
import { templatesApi, type Template } from '@/lib/api'
import { ArrowUpRight, Lock, Plus } from 'lucide-react'

const isLocked = (t: Template) => t.price !== undefined && t.price > 0 && !t.hasAccess

/** Starter-template gallery. "Use" opens the create dialog with the template preselected. */
export function TemplatesView({ onUse }: { onUse: (templateId: string) => void }) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    templatesApi
      .getTemplates()
      .then((t) => alive && setTemplates(t))
      .catch(() => toast.error('Could not load templates'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return (
    <section>
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Templates</p>
          <h1 className="mt-3 font-display text-display font-medium">Start from a starter.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Scaffold a project from a battle-tested template.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/marketplace" target="_blank">
            Marketplace <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[150px] rounded-lg" />)
          : templates.map((t, index) => {
              const locked = isLocked(t)
              return (
                <div
                  key={t.id}
                  className="flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:border-foreground/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Index>{String(index + 1).padStart(2, '0')}</Index>
                    <span className="flex items-center gap-2">
                      {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-warning" aria-label="Premium template" />}
                      <span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                        {t.category}
                      </span>
                    </span>
                  </div>
                  <h3 className="mt-4 truncate font-display text-base font-medium text-foreground">{t.name}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">{t.description}</p>
                  <div className="mt-4">
                    {locked ? (
                      <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                        <Link href="/marketplace" target="_blank">
                          <Lock className="h-3.5 w-3.5" /> Unlock in marketplace
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => onUse(t.id)}>
                        <Plus className="h-3.5 w-3.5" /> Use template
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
      </div>
    </section>
  )
}
