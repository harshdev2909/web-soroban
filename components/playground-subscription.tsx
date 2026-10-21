'use client'

import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Status = 'success' | 'error' | null

export default function PlaygroundSubscription() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [message, setMessage] = useState('')
  const reduce = useReducedMotion()

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
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-9 shadow-lg shadow-foreground/5 sm:px-8 md:px-12 md:py-11">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 text-brand/20"
          viewBox="0 0 260 260"
          fill="none"
        >
          <path d="M19 148c29-66 82-105 143-105 52 0 85 28 80 70-6 49-59 96-119 105-53 8-96-15-107-55-2-5-1-10 3-15Z" stroke="currentColor" />
          <path d="M55 148c22-43 60-68 102-68 35 0 55 19 50 47-6 33-43 63-83 68-36 4-65-12-72-39-1-3 0-6 3-8Z" stroke="currentColor" />
          <circle cx="206" cy="78" r="6" fill="currentColor" />
          <circle cx="51" cy="185" r="3" fill="currentColor" />
        </svg>

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
          <div>
            <p className="eyebrow">Stay in the loop</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Follow the WebSoroban build log.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              New Stellar primitives, localnet releases, templates, and product updates. Only when it matters.
            </p>
          </div>
          <div className="w-full lg:w-[31rem]">
            <form
              aria-label="Subscribe to the WebSoroban build log"
              onSubmit={(event) => {
                event.preventDefault()
                handleSubmit()
              }}
              className="flex w-full flex-col gap-2 rounded-2xl border border-input bg-background p-1.5 shadow-sm transition-[border-color,box-shadow] duration-150 focus-within:border-brand focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card sm:flex-row"
            >
              <label htmlFor="nova-subscription-email" className="sr-only">Email address</label>
              <div className="relative min-w-0 flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="nova-subscription-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  aria-describedby={status ? 'nova-subscription-status' : undefined}
                  className="h-11 w-full rounded-xl bg-transparent pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !email} size="lg" className="h-11 gap-2 rounded-xl px-5">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
                {isSubmitting ? 'Subscribing' : 'Subscribe'}
              </Button>
            </form>

            <AnimatePresence initial={false}>
              {status && (
                <motion.div
                  id="nova-subscription-status"
                  role={status === 'error' ? 'alert' : 'status'}
                  initial={reduce ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    'mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm',
                    status === 'success'
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-destructive/30 bg-destructive/10 text-destructive',
                  )}
                >
                  {status === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
