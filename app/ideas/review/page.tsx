'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, Check, Loader2, RotateCcw, X } from 'lucide-react'
import { toast } from 'sonner'
import { IdeaBankFrame } from '@/components/ideas/frame'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { ideasApi } from '@/lib/ideasApi'
import type { IdeaSubmission } from '@/lib/ideas'

type Status = IdeaSubmission['status']

const tabs: { id: Status; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Showcased' },
  { id: 'rejected', label: 'Rejected' },
]

const button =
  'inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60'

export default function ReviewIdeasPage() {
  const { user, loading: authLoading, login } = useAuth()
  const [status, setStatus] = useState<Status>('pending')
  const [items, setItems] = useState<IdeaSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { submissions } = await ideasApi.list(status)
      setItems(submissions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load submissions.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (user) void load()
  }, [user, load])

  async function review(item: IdeaSubmission, next: Status) {
    setBusy(item.id)
    try {
      await ideasApi.review(item.id, { status: next })
      setItems((prev) => prev.filter((row) => row.id !== item.id))
      toast.success(
        next === 'accepted'
          ? `“${item.title}” is now showcased in the Idea Bank`
          : next === 'rejected'
            ? `“${item.title}” rejected`
            : `“${item.title}” moved back to pending`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the submission.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <IdeaBankFrame>
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-14">
        <div className="grid gap-6 border-b border-border pb-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow">Idea Bank · Review</p>
            <h1 className="mt-4 font-display text-display font-medium">Review submissions.</h1>
          </div>
          <p className="text-sm leading-6 text-muted-foreground lg:col-span-5">
            Accepted ideas appear in the “From the community” section of the Idea Bank within a few minutes.
          </p>
        </div>

        {authLoading ? (
          <div className="mt-10 space-y-3">
            <Skeleton className="h-9 w-64 rounded-sm" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ) : !user ? (
          <div className="figure mt-10 max-w-md p-6">
            <p className="eyebrow">Admins only</p>
            <p className="mt-4 font-display text-xl font-medium">Sign in to review ideas.</p>
            <p className="mt-2 text-sm text-muted-foreground">Only WebSoroban admins can see submissions.</p>
            <button type="button" onClick={login} className={`${button} lit mt-5 bg-primary text-primary-foreground hover:bg-primary/90`}>
              Sign in
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 flex gap-1.5 overflow-x-auto pb-2" role="tablist" aria-label="Submission status">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={tab.id === status}
                  onClick={() => setStatus(tab.id)}
                  className={
                    tab.id === status
                      ? 'inline-flex min-h-9 shrink-0 items-center rounded-sm border border-foreground bg-card px-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                      : 'inline-flex min-h-9 shrink-0 items-center rounded-sm border border-border px-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="mt-6 space-y-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
            ) : error ? (
              <p role="alert" className="mt-8 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
                {error}
              </p>
            ) : items.length === 0 ? (
              <p className="mt-8 rounded-lg border border-dashed border-border px-6 py-10 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
                Nothing {status === 'accepted' ? 'showcased' : status} right now.
              </p>
            ) : (
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="rounded-lg border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-display text-lg font-medium">{item.title}</h2>
                        <p className="mt-1 font-mono text-[0.68rem] text-muted-foreground">
                          {item.author} · {item.contact} · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {item.status !== 'accepted' && (
                          <button
                            type="button"
                            disabled={busy === item.id}
                            onClick={() => review(item, 'accepted')}
                            className={`${button} bg-primary text-primary-foreground hover:bg-primary/90`}
                          >
                            <Check className="h-4 w-4" /> Accept
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            type="button"
                            disabled={busy === item.id}
                            onClick={() => review(item, 'rejected')}
                            className={`${button} border border-border text-foreground hover:border-destructive/60`}
                          >
                            <X className="h-4 w-4" /> {item.status === 'accepted' ? 'Remove' : 'Reject'}
                          </button>
                        )}
                        {item.status === 'rejected' && (
                          <button
                            type="button"
                            disabled={busy === item.id}
                            onClick={() => review(item, 'pending')}
                            className={`${button} border border-border text-foreground hover:border-foreground/30`}
                          >
                            <RotateCcw className="h-4 w-4" /> Back to pending
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="eyebrow mt-5">Goal</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{item.goal}</p>
                    <p className="eyebrow mt-5">Description</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{item.description}</p>
                    {item.alignment && (
                      <>
                        <p className="eyebrow mt-5">Stellar alignment</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {item.alignment}
                        </p>
                      </>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer nofollow"
                        className="mt-4 inline-flex items-center gap-1 break-all font-mono text-xs text-brand"
                      >
                        {item.link}
                        <ArrowUpRight className="h-4 w-4 shrink-0" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </IdeaBankFrame>
  )
}
