'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Status = 'success' | 'error' | null

/** The build log sign-up: one hairline row, label left, form right. */
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
      <div className="grid gap-8 border-t border-border pt-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className="eyebrow">Build log</p>
          <h2 className="mt-3 font-display text-title font-medium">Follow what ships.</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">New Stellar primitives, localnet releases, templates, and product updates. Only when it matters.</p>
        </div>
        <div className="lg:col-span-6">
          <form
            aria-label="Subscribe to the WebSoroban build log"
            onSubmit={(event) => {
              event.preventDefault()
              handleSubmit()
            }}
            className="flex items-end gap-3 border-b border-input transition-colors duration-150 focus-within:border-foreground"
          >
            <label htmlFor="build-log-email" className="sr-only">Email address</label>
            <input
              id="build-log-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-describedby={status ? 'build-log-status' : undefined}
              className="h-12 min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button type="submit" disabled={isSubmitting || !email} variant="ghost" className="group h-12 gap-2 px-2 font-mono text-[0.72rem] uppercase tracking-[0.16em]">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : null}
              {isSubmitting ? 'Subscribing' : 'Subscribe'}
              {!isSubmitting && <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5" />}
            </Button>
          </form>

          <AnimatePresence initial={false}>
            {status && (
              <motion.p
                id="build-log-status"
                role={status === 'error' ? 'alert' : 'status'}
                initial={reduce ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className={cn('mt-3 font-mono text-xs', status === 'success' ? 'text-success' : 'text-destructive')}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
