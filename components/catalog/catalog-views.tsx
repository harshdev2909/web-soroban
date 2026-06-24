'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
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
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-title font-semibold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">Scaffold a project from a battle-tested starter.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/marketplace" target="_blank">
            Marketplace <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[150px] rounded-xl" />)
          : templates.map((t) => {
              const locked = isLocked(t)
              return (
                <div
                  key={t.id}
                  className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:border-brand/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-base font-semibold text-foreground">{t.name}</h3>
                    {locked && <Lock className="ml-auto h-4 w-4 shrink-0 text-warning" />}
                    <span
                      className={cn(
                        'rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground',
                        locked ? '' : 'ml-auto',
                      )}
                    >
                      {t.category}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{t.description}</p>
                  <div className="mt-3">
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
