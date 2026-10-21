'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Bell, Check, Clipboard, Loader2, Send, ShieldCheck, Wallet2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PayOverview, PayWebhook, payApi } from '@/lib/payApi'
import { cn } from '@/lib/utils'

const EVENTS = ['payment.settled', 'payment.failed', 'wallet.spend_limit_exceeded'] as const

const selectClass = 'mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function PayControls({ overview, onChange }: { overview: PayOverview; onChange: () => void }) {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookEndpoint, setWebhookEndpoint] = useState('')
  const [events, setEvents] = useState<string[]>(['payment.settled', 'payment.failed'])
  const [secret, setSecret] = useState('')
  const [copied, setCopied] = useState(false)
  const [agentName, setAgentName] = useState('Research agent')
  const [agentKey, setAgentKey] = useState('')
  const [agentEndpoint, setAgentEndpoint] = useState('')
  const [spendLimit, setSpendLimit] = useState('1')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function run(key: string, action: () => Promise<unknown>, fallback: string) {
    setBusy(key)
    setError('')
    setNotice('')
    try {
      await action()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : fallback)
    } finally {
      setBusy('')
    }
  }

  function createWebhook(event: FormEvent) {
    event.preventDefault()
    void run('webhook', async () => {
      const result = await payApi.createWebhook({ url: webhookUrl, events, endpointId: webhookEndpoint || undefined })
      setSecret(result.secret)
      setCopied(false)
      setWebhookUrl('')
      onChange()
    }, 'Could not register the webhook.')
  }

  function createAgent(event: FormEvent) {
    event.preventDefault()
    void run('agent', async () => {
      await payApi.createAgentWallet({ name: agentName, publicKey: agentKey.trim(), spendLimit, endpointId: agentEndpoint || undefined })
      setAgentKey('')
      onChange()
    }, 'Could not register the agent wallet.')
  }

  function sendTest(webhook: PayWebhook) {
    void run(`test-${webhook.id}`, async () => {
      const result = await payApi.testWebhook(webhook.id)
      const delivery = result.delivery
      setNotice(delivery?.status === 'delivered'
        ? `Test delivered to ${webhook.url} (HTTP ${delivery.lastStatusCode}).`
        : `Test not delivered yet: ${delivery?.lastError || 'the receiver did not return 2xx'}. It will retry automatically.`)
      onChange()
    }, 'Could not send the test delivery.')
  }

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
    } catch {
      setError('Copy failed. Select the secret and copy it manually.')
    }
  }

  const endpoints = overview.endpoints || []

  return (
    <div className="space-y-6">
      {error ? <p role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : null}
      {notice ? <p role="status" className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">{notice}</p> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={createWebhook} className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">Delivery</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Payment webhooks</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Every delivery is signed and retried for about two hours. Verify <span className="font-mono">X-WebSoroban-Signature</span> with <span className="font-mono">constructWebhookEvent</span> from <span className="font-mono">@web-soroban/pay</span> before you trust the body.</p>
          <div className="mt-6">
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input id="webhook-url" required type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://example.com/webhooks/pay" className="mt-2 h-11 rounded-xl" />
          </div>
          <div className="mt-4">
            <Label htmlFor="webhook-endpoint">Scope</Label>
            <select id="webhook-endpoint" value={webhookEndpoint} onChange={(e) => setWebhookEndpoint(e.target.value)} className={selectClass}>
              <option value="">All endpoints</option>
              {endpoints.map((endpoint) => <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>)}
            </select>
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm font-medium">Events</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {EVENTS.map((name) => {
                const selected = events.includes(name)
                return (
                  <label key={name} className={cn('inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs', selected ? 'border-brand/40 bg-brand/5' : 'border-border')}>
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
          {secret ? (
            <div className="mt-4 rounded-xl border border-brand/25 bg-brand-muted/45 p-3">
              <p className="text-xs text-muted-foreground">Signing secret, shown once</p>
              <button type="button" onClick={copySecret} className="mt-1 flex w-full items-center justify-between gap-3 text-left font-mono text-xs">
                <span className="break-all">{secret}</span>
                {copied ? <Check className="h-4 w-4 shrink-0 text-success" /> : <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </button>
            </div>
          ) : null}
          <ul className="mt-5 space-y-2">
            {(overview.webhooks || []).map((webhook) => (
              <WebhookRow
                key={webhook.id}
                webhook={webhook}
                busy={busy}
                onTest={() => sendTest(webhook)}
                onToggle={() => run(`toggle-${webhook.id}`, async () => { await payApi.setWebhookActive(webhook.id, !webhook.active); onChange() }, 'Could not update the webhook.')}
                onRemove={() => run(`remove-${webhook.id}`, async () => { await payApi.deleteWebhook(webhook.id); onChange() }, 'Could not remove the webhook.')}
              />
            ))}
          </ul>
        </form>

        <form onSubmit={createAgent} className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">Agents</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Daily spend cap</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">A signer over its USDC cap is rejected before the facilitator is called. The payer is read from the signed transfer, and the window is one day, about 17,280 ledgers.</p>
          <div className="mt-6 grid gap-4">
            <div>
              <Label htmlFor="agent-name">Wallet name</Label>
              <Input id="agent-name" required minLength={2} value={agentName} onChange={(e) => setAgentName(e.target.value)} className="mt-2 h-11 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="agent-key">Signer address</Label>
              <Input id="agent-key" required value={agentKey} onChange={(e) => setAgentKey(e.target.value)} placeholder="G… or C…" className="mt-2 h-11 rounded-xl font-mono text-xs" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="agent-limit">Daily USDC cap</Label>
                <Input id="agent-limit" required inputMode="decimal" value={spendLimit} onChange={(e) => setSpendLimit(e.target.value)} className="mt-2 h-11 rounded-xl font-mono" />
              </div>
              <div>
                <Label htmlFor="agent-endpoint">Applies to</Label>
                <select id="agent-endpoint" value={agentEndpoint} onChange={(e) => setAgentEndpoint(e.target.value)} className={selectClass}>
                  <option value="">All endpoints</option>
                  {endpoints.map((endpoint) => <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <Button type="submit" disabled={busy === 'agent'} className="mt-6 h-11 rounded-full">
            {busy === 'agent' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet2 className="h-4 w-4" />} Register agent wallet
          </Button>
          <ul className="mt-5 space-y-2">
            {(overview.agentWallets || []).map((wallet) => {
              const ratio = Math.min(1, Number(wallet.spentUsdc) / Number(wallet.spendLimitUsdc || 1))
              return (
                <li key={wallet.id} className="rounded-xl border border-border px-3 py-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{wallet.name} {!wallet.active ? <span className="font-mono text-muted-foreground">· paused</span> : null}</p>
                    <button type="button" disabled={busy === `agent-${wallet.id}`} className="min-h-10 rounded-lg px-2 text-muted-foreground hover:text-foreground" onClick={() => run(`agent-${wallet.id}`, async () => { await payApi.setAgentWalletActive(wallet.id, !wallet.active); onChange() }, 'Could not update the agent wallet.')}>{wallet.active ? 'Pause' : 'Resume'}</button>
                  </div>
                  <p className="mt-1 truncate font-mono text-muted-foreground">{wallet.publicKey}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)} aria-label={`${wallet.name} daily spend`}>
                    <div className={cn('h-full rounded-full', ratio >= 1 ? 'bg-destructive' : 'bg-brand')} style={{ width: `${ratio * 100}%` }} />
                  </div>
                  <p className="mt-1 font-mono text-muted-foreground">{wallet.spentUsdc} / {wallet.spendLimitUsdc} USDC today</p>
                </li>
              )
            })}
          </ul>
        </form>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand"><Wallet2 className="h-4 w-4" /> Auth-entry wallets</div>
          <ul className="mt-5 space-y-3">
            {(overview.wallets || []).map((wallet) => (
              <li key={wallet.id} className="text-sm">
                <p className="font-medium">{wallet.name} <span className="font-mono text-xs text-muted-foreground">{wallet.platform}{wallet.checkout ? ' · hosted checkout' : ''}</span></p>
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

function WebhookRow({ webhook, busy, onTest, onToggle, onRemove }: { webhook: PayWebhook; busy: string; onTest: () => void; onToggle: () => void; onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    if (!confirming) return
    const timer = window.setTimeout(() => setConfirming(false), 4000)
    return () => window.clearTimeout(timer)
  }, [confirming])
  const last = webhook.lastDelivery
  const tone = !last ? 'text-muted-foreground' : last.status === 'delivered' ? 'text-success' : last.status === 'failed' ? 'text-destructive' : 'text-warning'
  return (
    <li className="rounded-xl border border-border px-3 py-2 text-xs">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate font-mono">{webhook.url}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" disabled={!webhook.active || busy === `test-${webhook.id}`} onClick={onTest} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-muted-foreground hover:text-foreground disabled:opacity-50">{busy === `test-${webhook.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Test</button>
          <button type="button" disabled={busy === `toggle-${webhook.id}`} onClick={onToggle} className="min-h-10 rounded-lg px-2 text-muted-foreground hover:text-foreground">{webhook.active ? 'Pause' : 'Resume'}</button>
          <button type="button" disabled={busy === `remove-${webhook.id}`} onClick={() => { if (confirming) onRemove(); else setConfirming(true) }} className={cn('min-h-10 rounded-lg px-2', confirming ? 'text-destructive' : 'text-muted-foreground hover:text-foreground')}>{confirming ? 'Confirm remove' : 'Remove'}</button>
        </div>
      </div>
      <p className={cn('mt-1 font-mono', tone)}>
        {!webhook.active ? 'Paused · ' : ''}
        {last ? `${last.eventType} · ${last.status}${last.lastStatusCode ? ` · HTTP ${last.lastStatusCode}` : ''}${last.status !== 'delivered' && last.lastError ? ` · ${last.lastError}` : ''}` : 'No deliveries yet'}
      </p>
    </li>
  )
}
