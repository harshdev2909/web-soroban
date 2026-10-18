'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, Check, Loader2, RotateCcw, X } from 'lucide-react'
import { toast } from 'sonner'
import { IdeaBankFrame } from '@/components/ideas/frame'
import { useAuth } from '@/contexts/AuthContext'
import { ideasApi } from '@/lib/ideasApi'
import type { IdeaSubmission } from '@/lib/ideas'

type Status = IdeaSubmission['status']

const tabs: { id: Status; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Showcased' },
  { id: 'rejected', label: 'Rejected' },
]

const pill =
  'inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60'

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
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-12">
        <p className="eyebrow text-brand">Idea Bank</p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">Review submissions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accepted ideas appear in the “From the community” section of the Idea Bank within a few minutes.
        </p>

        {authLoading ? (
          <Loader2 className="mt-10 h-5 w-5 animate-spin text-muted-foreground" />
        ) : !user ? (
          <div className="mt-10 rounded-xl border border-border bg-card px-6 py-10 text-center">
            <p className="font-display text-lg font-semibold">Sign in to review ideas</p>
            <p className="mt-2 text-sm text-muted-foreground">Only WebSoroban admins can see submissions.</p>
            <button type="button" onClick={login} className={`${pill} mt-5 bg-brand text-brand-foreground hover:bg-brand/90`}>
              Sign in
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Submission status">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={tab.id === status}
                  onClick={() => setStatus(tab.id)}
                  className={
                    tab.id === status
                      ? `${pill} bg-brand text-brand-foreground`
                      : `${pill} border border-border font-normal text-muted-foreground hover:text-foreground`
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <Loader2 className="mt-10 h-5 w-5 animate-spin text-muted-foreground" />
            ) : error ? (
              <p role="alert" className="mt-8 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
                {error}
              </p>
            ) : items.length === 0 ? (
              <p className="mt-10 rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
                Nothing {status === 'accepted' ? 'showcased' : status} right now.
              </p>
            ) : (
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-display text-lg font-semibold">{item.title}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.author} · {item.contact} · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {item.status !== 'accepted' && (
                          <button
                            type="button"
                            disabled={busy === item.id}
                            onClick={() => review(item, 'accepted')}
                            className={`${pill} bg-brand text-brand-foreground hover:bg-brand/90`}
                          >
                            <Check className="h-4 w-4" /> Accept
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            type="button"
                            disabled={busy === item.id}
                            onClick={() => review(item, 'rejected')}
                            className={`${pill} border border-border text-foreground hover:border-destructive/60`}
                          >
                            <X className="h-4 w-4" /> {item.status === 'accepted' ? 'Remove' : 'Reject'}
                          </button>
                        )}
                        {item.status === 'rejected' && (
                          <button
                            type="button"
                            disabled={busy === item.id}
                            onClick={() => review(item, 'pending')}
                            className={`${pill} border border-border text-foreground hover:border-brand/50`}
                          >
                            <RotateCcw className="h-4 w-4" /> Back to pending
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium">Goal</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{item.goal}</p>
                    <p className="mt-4 text-sm font-medium">Description</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    {item.alignment && (
                      <>
                        <p className="mt-4 text-sm font-medium">Stellar alignment</p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                          {item.alignment}
                        </p>
                      </>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer nofollow"
                        className="mt-4 inline-flex items-center gap-1 break-all text-sm text-brand"
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
