"use client"

/**
 * Billing & Usage — credit balance, ledger history (grants/purchases/usage),
 * recent AI usage, and the credit packs to buy. The fiat/credits system (Dodo).
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Coins, Gift, Loader2, Receipt, ShoppingCart, Sparkles, Zap } from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { billingApi, type CreditPack, type LedgerEntry, type UsageEntry } from '@/lib/billingApi'
import { formatModelName } from '@/lib/aiApi'
import { UpgradeModal } from '@/components/billing/upgrade-modal'
import { emitCreditsUpdated } from '@/components/billing/credit-badge'

const REASON_LABEL: Record<LedgerEntry['reason'], string> = {
  signup_grant: 'Free credits',
  purchase: 'Purchase',
  usage: 'Run',
  refund: 'Refund',
  admin: 'Adjustment',
}

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
      <div className="flex min-h-screen flex-col bg-background">
        <PlaygroundNavbar />
        <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
          <Coins className="mb-3 h-8 w-8 text-brand" />
          <h1 className="text-lg font-semibold">Billing & Usage</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to see your AI credits and buy more.</p>
          <Button className="mt-4" onClick={login}>Sign in</Button>
        </main>
        <PlaygroundFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PlaygroundNavbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Billing & Usage</h1>
            <p className="text-sm text-muted-foreground">AI Copilot credits. Charged per run on actual model cost.</p>
          </div>
          <Button onClick={() => setBuyOpen(true)} className="gap-1.5"><ShoppingCart className="h-4 w-4" /> Buy credits</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat icon={Coins} tint="text-brand" label="Current balance" value={(balance ?? 0).toLocaleString()} suffix="credits" />
              <Stat icon={Sparkles} tint="text-success" label="Total purchased" value={totals.purchased.toLocaleString()} suffix="credits" />
              <Stat icon={Zap} tint="text-cosmic" label="Total spent" value={totals.spent.toLocaleString()} suffix="credits" />
            </div>

            {/* Onboarding note */}
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
              <Gift className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>New accounts start with <strong className="text-foreground">50 free credits</strong>. When you run low, buy a one-time credit pack — credits never expire and are charged per run based on the model's actual cost.</span>
            </div>

            {/* Plans */}
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Credit packs</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {plans.map((p, i) => (
                  <div key={p.key} className={`flex flex-col rounded-xl border p-4 ${i === 1 ? 'border-brand/50 bg-brand/5' : 'border-border bg-card/50'}`}>
                    <span className="text-sm font-semibold text-foreground">{p.name}</span>
                    <span className="mt-1 text-2xl font-bold text-foreground">{p.priceLabel}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="h-3 w-3 text-brand" /> {p.credits.toLocaleString()} credits</span>
                    <Button size="sm" className="mt-3" disabled={!p.available} onClick={() => setBuyOpen(true)}>{p.available ? 'Buy' : 'Unavailable'}</Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Ledger */}
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground"><Receipt className="h-4 w-4" /> Credit history</h2>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr><th className="px-3 py-2 font-medium">When</th><th className="px-3 py-2 font-medium">Type</th><th className="px-3 py-2 text-right font-medium">Change</th><th className="px-3 py-2 text-right font-medium">Balance</th></tr>
                  </thead>
                  <tbody>
                    {ledger.length ? ledger.map((e) => (
                      <tr key={e.id} className="border-t border-border/60">
                        <td className="px-3 py-2 text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">{REASON_LABEL[e.reason] || e.reason}</td>
                        <td className={`px-3 py-2 text-right font-medium ${e.delta >= 0 ? 'text-success' : 'text-foreground'}`}>{e.delta >= 0 ? '+' : ''}{e.delta}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{e.balanceAfter}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No activity yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Usage */}
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground"><Zap className="h-4 w-4" /> Recent runs</h2>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr><th className="px-3 py-2 font-medium">When</th><th className="px-3 py-2 font-medium">Model</th><th className="px-3 py-2 font-medium">Mode</th><th className="px-3 py-2 text-right font-medium">Tokens</th><th className="px-3 py-2 text-right font-medium">Cost</th><th className="px-3 py-2 text-right font-medium">Credits</th></tr>
                  </thead>
                  <tbody>
                    {usage.length ? usage.map((u) => (
                      <tr key={u.id} className="border-t border-border/60">
                        <td className="px-3 py-2 text-muted-foreground">{new Date(u.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2 font-mono text-[11px]">{formatModelName(u.model)}</td>
                        <td className="px-3 py-2 capitalize">{u.mode}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{(u.tokensIn + u.tokensOut).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">${u.costUsd.toFixed(4)}</td>
                        <td className="px-3 py-2 text-right font-medium">{u.creditsCharged}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No runs yet.</td></tr>
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

function Stat({ icon: Icon, tint, label, value, suffix }: { icon: any; tint: string; label: string; value: string; suffix: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className={`h-3.5 w-3.5 ${tint}`} /> {label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value} <span className="text-sm font-normal text-muted-foreground">{suffix}</span></div>
    </div>
  )
}
