"use client"

/**
 * Billing & Usage — credit balance, ledger history (grants/purchases/usage),
 * recent AI usage, and the credit packs to buy. The fiat/credits system (Dodo).
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Coins, ShoppingCart } from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Index } from '@/components/landing/chapter'
import { useAuth } from '@/contexts/AuthContext'
import { billingApi, type CreditPack, type LedgerEntry, type UsageEntry } from '@/lib/billingApi'
import { formatModelName } from '@/lib/aiApi'
import { UpgradeModal } from '@/components/billing/upgrade-modal'
import { emitCreditsUpdated } from '@/components/billing/credit-badge'
import { cn } from '@/lib/utils'

const REASON_LABEL: Record<LedgerEntry['reason'], string> = {
  signup_grant: 'Free credits',
  purchase: 'Purchase',
  usage: 'Run',
  refund: 'Refund',
  admin: 'Adjustment',
}

const TH = 'px-4 py-3 font-mono text-[0.62rem] font-normal uppercase tracking-[0.14em] text-muted-foreground'

export default function BillingPage() {
  const { isAuthenticated, loading: authLoading, login } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [usage, setUsage] = useState<UsageEntry[]>([])
  const [plans, setPlans] = useState<CreditPack[]>([])
  const [loading, setLoading] = useState(true)
  const [buyOpen, setBuyOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const [b, l, u, p] = await Promise.all([
        billingApi.getBalance(),
        billingApi.getLedger(100),
        billingApi.getUsage(50),
        billingApi.getPlans(),
      ])
      setBalance(b.balance)
      setLedger(l.entries)
      setUsage(u.usage)
      setPlans(p.plans)
      emitCreditsUpdated(b.balance)
    } catch {
      /* offline-tolerant */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { setLoading(false); return }
    // If we returned from a checkout, reconcile the payment as a webhook fallback.
    const params = new URLSearchParams(window.location.search)
    const paymentId = params.get('payment_id') || params.get('paymentId')
    ;(async () => {
      if (paymentId) {
        try { await billingApi.reconcile(paymentId) } catch { /* webhook may have it */ }
      }
      await load()
    })()
  }, [authLoading, isAuthenticated, load])

  const totals = useMemo(() => {
    const purchased = ledger.filter((e) => e.reason === 'purchase').reduce((s, e) => s + e.delta, 0)
    const spent = ledger.filter((e) => e.reason === 'usage').reduce((s, e) => s - e.delta, 0)
    return { purchased, spent }
  }, [ledger])

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <PlaygroundNavbar />
        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-16">
          <div className="figure ticks w-full max-w-md p-8">
            <p className="eyebrow flex items-center gap-3"><Coins className="h-3.5 w-3.5 text-brand" aria-hidden /> Billing</p>
            <h1 className="mt-6 font-display text-title font-medium">Credits &amp; usage.</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Sign in to see your AI credits and buy more.</p>
            <Button className="lit mt-6" onClick={login}>Sign in</Button>
          </div>
        </main>
        <PlaygroundFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PlaygroundNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-24 pt-14 lg:pt-20">
        <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow">Billing</p>
            <h1 className="mt-4 font-display text-display-lg font-medium">Credits &amp; usage.</h1>
          </div>
          <div className="flex flex-col gap-5 lg:col-span-5 lg:items-start">
            <p className="lead text-base">AI Copilot credits, charged per run on the model&apos;s actual cost. New accounts start with 50 free credits, and credits never expire.</p>
            <Button onClick={() => setBuyOpen(true)} className="lit gap-1.5"><ShoppingCart className="h-4 w-4" /> Buy credits</Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-10 space-y-6">
            <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-background p-5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-5 h-8 w-32" />
                </div>
              ))}
            </div>
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <dl className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
              <Stat index="01" label="Current balance" value={(balance ?? 0).toLocaleString()} suffix="credits" tone="text-brand" />
              <Stat index="02" label="Total purchased" value={totals.purchased.toLocaleString()} suffix="credits" />
              <Stat index="03" label="Total spent" value={totals.spent.toLocaleString()} suffix="credits" />
            </dl>

            {/* Plans */}
            <section className="mt-16">
              <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
                <h2 className="font-display text-title font-medium">Credit packs.</h2>
                <span className="eyebrow">One-time · never expire</span>
              </div>
              <div className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-3">
                {plans.map((p, i) => (
                  <div key={p.key} className="flex flex-col bg-background p-5">
                    <div className="flex items-center justify-between">
                      <Index>{String(i + 1).padStart(2, '0')}</Index>
                      {i === 1 && <Index className="text-brand">most chosen</Index>}
                    </div>
                    <span className="mt-6 text-sm font-medium text-foreground">{p.name}</span>
                    <span className="mt-1 font-display text-3xl font-medium text-foreground">{p.priceLabel}</span>
                    <span className="mt-2 font-mono-tnum text-xs text-muted-foreground">{p.credits.toLocaleString()} credits</span>
                    <Button size="sm" variant={i === 1 ? 'default' : 'outline'} className={cn('mt-6', i === 1 && 'lit')} disabled={!p.available} onClick={() => setBuyOpen(true)}>{p.available ? 'Buy' : 'Unavailable'}</Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Ledger */}
            <section className="mt-16">
              <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
                <h2 className="font-display text-title font-medium">Credit history.</h2>
                <span className="eyebrow">{String(ledger.length).padStart(2, '0')} entries</span>
              </div>
              <div className="mt-6 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="bg-card">
                    <tr><th className={TH}>When</th><th className={TH}>Type</th><th className={cn(TH, 'text-right')}>Change</th><th className={cn(TH, 'text-right')}>Balance</th></tr>
                  </thead>
                  <tbody>
                    {ledger.length ? ledger.map((e) => (
                      <tr key={e.id} className="border-t border-border">
                        <td className="px-4 py-3 font-mono-tnum text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">{REASON_LABEL[e.reason] || e.reason}</td>
                        <td className={cn('px-4 py-3 text-right font-mono-tnum', e.delta >= 0 ? 'text-success' : 'text-foreground')}>{e.delta >= 0 ? '+' : ''}{e.delta}</td>
                        <td className="px-4 py-3 text-right font-mono-tnum text-muted-foreground">{e.balanceAfter}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-4 py-8 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">No activity yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Usage */}
            <section className="mt-16">
              <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
                <h2 className="font-display text-title font-medium">Recent runs.</h2>
                <span className="eyebrow">{String(usage.length).padStart(2, '0')} runs</span>
              </div>
              <div className="mt-6 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="bg-card">
                    <tr><th className={TH}>When</th><th className={TH}>Model</th><th className={TH}>Mode</th><th className={cn(TH, 'text-right')}>Tokens</th><th className={cn(TH, 'text-right')}>Cost</th><th className={cn(TH, 'text-right')}>Credits</th></tr>
                  </thead>
                  <tbody>
                    {usage.length ? usage.map((u) => (
                      <tr key={u.id} className="border-t border-border">
                        <td className="px-4 py-3 font-mono-tnum text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-xs">{formatModelName(u.model)}</td>
                        <td className="px-4 py-3 capitalize">{u.mode}</td>
                        <td className="px-4 py-3 text-right font-mono-tnum text-muted-foreground">{(u.tokensIn + u.tokensOut).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono-tnum text-muted-foreground">${u.costUsd.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right font-mono-tnum text-foreground">{u.creditsCharged}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="px-4 py-8 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">No runs yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
      <PlaygroundFooter />
      <UpgradeModal open={buyOpen} onOpenChange={(v) => { setBuyOpen(v); if (!v) load() }} />
    </div>
  )
}

function Stat({ index, label, value, suffix, tone }: { index: string; label: string; value: string; suffix: string; tone?: string }) {
  return (
    <div className="bg-background p-5">
      <dt className="flex items-center gap-3">
        <Index className="text-foreground">{index}</Index>
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      </dt>
      <dd className={cn('mt-5 font-mono-tnum text-3xl font-medium text-foreground', tone)}>
        {value} <span className="font-mono text-xs text-muted-foreground">{suffix}</span>
      </dd>
    </div>
  )
}
