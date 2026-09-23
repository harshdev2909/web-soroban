'use client'

import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Status = 'success' | 'error' | null

export default function PlaygroundSubscription() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    if (!email || isSubmitting) return
    setIsSubmitting(true)
    setStatus(null)
    setMessage('')
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) {
        setStatus('success')
        setMessage('Subscribed. Check your inbox for confirmation.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(
          data.details && data.details.title === 'Member Exists'
            ? 'This email is already subscribed.'
            : data.error || 'Subscription failed. Please try again.',
        )
      }
    } catch (err) {
      setStatus('error')
      setMessage(`Network error. ${err instanceof Error ? err.message : 'Please try again.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 px-6 py-10 md:px-12">
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
        <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
          <p className="eyebrow">Stay in the loop</p>
          <h2 className="font-display mt-3 text-title font-semibold">Product updates, no noise</h2>
          <p className="lead mt-2 text-sm">
            New templates, network changes, and shipping notes. One email when it matters.
          </p>

          <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground transition-colors duration-200 placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              />
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting || !email} size="lg" className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Subscribing' : 'Subscribe'}
            </Button>
          </div>

          {status && (
            <div
              className={cn(
                'mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                status === 'success'
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-destructive/30 bg-destructive/10 text-destructive',
              )}
            >
              {status === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
