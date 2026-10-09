'use client'

import { FormEvent, useState } from 'react'
import { Bell, Loader2, ShieldCheck, Wallet2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PayOverview, payApi } from '@/lib/payApi'

const EVENTS = ['payment.settled', 'payment.failed', 'wallet.spend_limit_exceeded'] as const

export function TestnetControls({ overview, onChange }: { overview: PayOverview; onChange: () => void }) {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [events, setEvents] = useState<string[]>(['payment.settled', 'payment.failed'])
  const [secret, setSecret] = useState('')
  const [agentName, setAgentName] = useState('Research agent')
  const [agentKey, setAgentKey] = useState('')
  const [spendLimit, setSpendLimit] = useState('1')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function createWebhook(event: FormEvent) {
    event.preventDefault()
    setBusy('webhook')
    setError('')
    try {
      const result = await payApi.createWebhook({ url: webhookUrl, events })
      setSecret(result.secret)
      setWebhookUrl('')
      onChange()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not register the webhook.')
    } finally {
      setBusy('')
    }
  }

  async function createAgent(event: FormEvent) {
    event.preventDefault()
    setBusy('agent')
    setError('')
    try {
      await payApi.createAgentWallet({ name: agentName, publicKey: agentKey, spendLimit })
      setAgentKey('')
      onChange()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not register the agent wallet.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="space-y-6">
      {error ? <p role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={createWebhook} className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">Delivery</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Payment webhooks</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">WebSoroban signs each delivery. Verify <span className="font-mono">X-WebSoroban-Signature</span> before you trust the body.</p>
          <div className="mt-6">
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input id="webhook-url" required type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://example.com/webhooks/pay" className="mt-2 h-11 rounded-xl" />
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm font-medium">Events</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {EVENTS.map((name) => {
                const selected = events.includes(name)
                return (
                  <label key={name} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-border px-3 text-xs">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => setEvents((current) => selected ? current.filter((item) => item !== name) : [...current, name])}
                    />
                    <span className="font-mono">{name}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
          <Button type="submit" disabled={busy === 'webhook' || events.length === 0} className="mt-6 h-11 rounded-full">
            {busy === 'webhook' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} Register webhook
          </Button>
          {secret ? <p className="mt-4 break-all rounded-xl border border-brand/25 bg-brand-muted/45 p-3 font-mono text-xs">Signing secret, shown once: {secret}</p> : null}
          <ul className="mt-5 space-y-2">
            {(overview.webhooks || []).map((webhook) => (
              <li key={webhook.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-xs">
                <span className="min-w-0 truncate font-mono">{webhook.url}</span>
                <button type="button" className="min-h-10 shrink-0 rounded-lg px-2 text-muted-foreground hover:text-foreground" onClick={async () => { await payApi.deleteWebhook(webhook.id); onChange() }}>Remove</button>
              </li>
            ))}
          </ul>
        </form>

        <form onSubmit={createAgent} className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">Agents</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Daily spend cap</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">A signer over its USDC cap is rejected before the facilitator is called. The window is one day, about 17,280 ledgers.</p>
          <div className="mt-6 grid gap-4">
            <div>
              <Label htmlFor="agent-name">Wallet name</Label>
              <Input id="agent-name" required minLength={2} value={agentName} onChange={(e) => setAgentName(e.target.value)} className="mt-2 h-11 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="agent-key">Signer address</Label>
              <Input id="agent-key" required value={agentKey} onChange={(e) => setAgentKey(e.target.value)} placeholder="G…" className="mt-2 h-11 rounded-xl font-mono text-xs" />
            </div>
            <div>
              <Label htmlFor="agent-limit">Daily USDC cap</Label>
              <Input id="agent-limit" required inputMode="decimal" value={spendLimit} onChange={(e) => setSpendLimit(e.target.value)} className="mt-2 h-11 rounded-xl font-mono" />
            </div>
          </div>
          <Button type="submit" disabled={busy === 'agent'} className="mt-6 h-11 rounded-full">
            {busy === 'agent' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet2 className="h-4 w-4" />} Register agent wallet
          </Button>
          <ul className="mt-5 space-y-2">
            {(overview.agentWallets || []).map((wallet) => (
              <li key={wallet.id} className="rounded-xl border border-border px-3 py-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{wallet.name}</p>
                  <button type="button" className="min-h-10 rounded-lg px-2 text-muted-foreground hover:text-foreground" onClick={async () => { await payApi.setAgentWalletActive(wallet.id, !wallet.active); onChange() }}>{wallet.active ? 'Pause' : 'Resume'}</button>
                </div>
                <p className="mt-1 font-mono text-muted-foreground">{wallet.spentUsdc} / {wallet.spendLimitUsdc} USDC today</p>
              </li>
            ))}
          </ul>
        </form>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand"><Wallet2 className="h-4 w-4" /> Auth-entry wallets</div>
          <ul className="mt-5 space-y-3">
            {(overview.wallets || []).map((wallet) => (
              <li key={wallet.id} className="text-sm">
                <p className="font-medium">{wallet.name} <span className="font-mono text-xs text-muted-foreground">{wallet.platform}</span></p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{wallet.guidance}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand"><ShieldCheck className="h-4 w-4" /> Failure catalog</div>
          <ul className="mt-5 space-y-4">
            {(overview.errors || []).map((item) => (
              <li key={item.code}>
                <p className="font-mono text-xs text-brand">{item.code}</p>
                <p className="mt-1 text-sm">{item.message}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.fix}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
