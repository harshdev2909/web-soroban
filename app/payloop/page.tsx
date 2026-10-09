'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, CircleDollarSign, Clock3, Coins, ExternalLink, Loader2, Pause, Play,
  RefreshCw, Repeat, ShieldCheck, Wallet2, XCircle,
} from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useWalletKit } from '@/contexts/WalletKitContext'
import { getNetwork } from '@/lib/networks'
import {
  PayLoopCharge, PayLoopConfig, PayLoopPolicy, WalletFunds, explainPayLoopError, formatInterval,
  payloopApi, readFunds, toStroops,
} from '@/lib/payloop'

/** The Stellar SDK loads only when the user signs something. */
const chain = () => import('@/lib/payloop-chain')
import { cn, truncateAddress } from '@/lib/utils'

const INTERVALS = [
  { label: '1 minute (demo)', seconds: 60 },
  { label: '1 hour', seconds: 3_600 },
  { label: '1 day', seconds: 86_400 },
  { label: '30 days', seconds: 30 * 86_400 },
]

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
  revoked: 'bg-muted text-muted-foreground',
  completed: 'bg-brand/10 text-brand',
}

export default function PayLoopPage() {
  const { address, connect, connecting, disconnect, signTransaction, isInitialized } = useWalletKit()
  const [config, setConfig] = useState<PayLoopConfig | null>(null)
  const [configError, setConfigError] = useState('')
  const [funds, setFunds] = useState<WalletFunds | null>(null)
  const [policies, setPolicies] = useState<PayLoopPolicy[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<{ text: string; hash?: string } | null>(null)
  const [form, setForm] = useState({ merchant: '', amount: '0.1', interval: 60, cap: '2' })

  const network = config ? getNetwork(config.network) : null
  const wallet = useMemo(() => address ? { address, signTransaction } : null, [address, signTransaction])

  useEffect(() => {
    payloopApi.config()
      .then((value) => {
        setConfig(value)
        if (value.demoMerchant) setForm((current) => current.merchant ? current : { ...current, merchant: value.demoMerchant! })
      })
      .catch((cause) => setConfigError(explainPayLoopError(cause)))
  }, [])

  const refresh = useCallback(async () => {
    if (!config || !address) return
    const [nextFunds, list] = await Promise.all([
      readFunds(config.network, address).catch(() => null),
      payloopApi.policies(address).then((result) => result.policies).catch(() => []),
    ])
    if (nextFunds) setFunds(nextFunds)
    setPolicies(list)
  }, [config, address])

  // The relayer charges on its own schedule; keep the view current.
  useEffect(() => {
    void refresh()
    if (!address) return
    const timer = window.setInterval(() => void refresh(), 10_000)
    return () => window.clearInterval(timer)
  }, [refresh, address])

  async function run(key: string, action: () => Promise<{ text: string; hash?: string } | void>) {
    setBusy(key)
    setError('')
    setNotice(null)
    try {
      const result = await action()
      if (result) setNotice(result)
      await refresh()
    } catch (cause) {
      setError(explainPayLoopError(cause))
    } finally {
      setBusy('')
    }
  }

  const fund = () => run('fund', async () => {
    if (!wallet || !funds || !config) return
    const { fundTestnetWallet } = await chain()
    await fundTestnetWallet(wallet, funds)
    return { text: 'Wallet funded with test USDC.' }
  })

  const create = (event: FormEvent) => {
    event.preventDefault()
    void run('create', async () => {
      if (!wallet || !config) return
      const { allowanceLiveUntil, invokePayLoop, scv } = await chain()
      const amount = toStroops(form.amount)
      const cap = toStroops(form.cap)
      if (cap < amount) throw new Error('The safety cap must cover at least one charge.')
      const result = await invokePayLoop(config, wallet, 'create_policy', [
        scv.address(wallet.address), scv.address(form.merchant.trim()), scv.i128(amount),
        scv.u64(BigInt(form.interval)), scv.i128(cap), scv.u32(await allowanceLiveUntil(config)),
      ])
      return { text: `Policy ${String(result.simulated ?? '')} created and the first ${form.amount} USDC charge settled.`, hash: result.hash }
    })
  }

  const act = (policy: PayLoopPolicy, method: 'pause' | 'resume' | 'revoke') => run(`${method}-${policy.policyId}`, async () => {
    if (!wallet || !config) return
    const { invokePayLoop, scv } = await chain()
    const result = await invokePayLoop(config, wallet, method, [scv.u64(policy.policyId)])
    const verb = method === 'pause' ? 'paused' : method === 'resume' ? 'resumed' : 'revoked'
    const trim = method === 'revoke' ? ' It can never charge again; use Renew allowance to trim what it had left.' : ''
    return { text: `Policy ${policy.policyId} ${verb}.${trim}`, hash: result.hash }
  })

  // Re-grant exactly what live policies may still charge, with a fresh ~100-day expiry.
  const renewAllowance = () => run('renew', async () => {
    if (!wallet || !config) return
    const { allowanceLiveUntil, invokePayLoop, scv } = await chain()
    const result = await invokePayLoop(config, wallet, 'refresh_allowance', [scv.address(wallet.address), scv.u32(await allowanceLiveUntil(config))])
    return { text: 'Allowance renewed and trimmed to what your live policies may still charge.', hash: result.hash }
  })

  const disabledReason = !config?.enabled ? 'PayLoop is not deployed on this server.' : null

  return (
    <main className="nova-landing min-h-screen overflow-hidden bg-background text-foreground">
      <PlaygroundNavbar />
      <section className="relative border-b border-border/60">
        <div className="nova-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 lg:pb-20 lg:pt-24">
          <Reveal>
            <p className="eyebrow text-brand">PayLoop</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">Subscriptions that never take custody.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Sign one USDC policy: merchant, amount, interval, and a safety cap. The first charge settles atomically, the relayer charges on schedule, and you can pause or revoke from your wallet at any time. Funds stay in your wallet until a charge is due.</p>
            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: 'Non-custodial', copy: 'An allowance equal to what your policies may still charge. Nothing is pre-funded.' },
                { icon: Repeat, title: 'On schedule', copy: 'Anyone may trigger a due charge, but only to your merchant, for your amount.' },
                { icon: XCircle, title: 'Yours to stop', copy: 'Pause, resume, or revoke on-chain. Revoking shrinks the allowance.' },
              ].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="rounded-2xl border border-foreground/10 bg-card/80 p-4">
                  <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        {configError ? <p role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">{configError}</p> : null}
        {!config && !configError ? <Skeleton className="h-96 rounded-3xl" /> : null}
        {config ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className={cn('rounded-full border px-3 py-1.5 uppercase', network?.badgeClass)}>{network?.label}</span>
                {config.contractId ? <a href={`${config.explorerBase}/contract/${config.contractId}`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 hover:bg-muted">Contract {truncateAddress(config.contractId, 4, 4)} <ExternalLink className="h-3.5 w-3.5" /></a> : null}
              </div>
              {address ? <div className="flex items-center gap-2 text-sm"><span className="font-mono text-xs text-muted-foreground">{truncateAddress(address)}</span><Button type="button" size="sm" variant="ghost" onClick={disconnect}>Disconnect</Button></div> : null}
            </div>

            {error ? <p role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : null}
            {notice ? <p role="status" className="flex flex-wrap items-center gap-2 rounded-2xl border border-success/25 bg-success/10 p-4 text-sm"><CheckCircle2 className="h-4 w-4 text-success" />{notice.text}{notice.hash && network ? <a href={`${network.explorerBase}/tx/${notice.hash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand underline-offset-4 hover:underline">Receipt <ExternalLink className="h-3.5 w-3.5" /></a> : null}</p> : null}

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-6">
                <Step number="01" title="Connect a wallet" done={Boolean(address)}>
                  {address ? <p className="text-sm text-muted-foreground">Connected. Your wallet signs every policy action; WebSoroban never holds a key.</p> : (
                    <Button type="button" disabled={!isInitialized || connecting} onClick={() => connect().catch(() => undefined)} className="rounded-full">
                      {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet2 className="h-4 w-4" />} Connect wallet
                    </Button>
                  )}
                </Step>

                <Step number="02" title="Fund it with USDC" done={Boolean(funds?.usdc && funds.usdc > 0)}>
                  {!address ? <p className="text-sm text-muted-foreground">Connect first.</p> : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                        <Balance label="XLM" value={funds ? funds.xlm.toFixed(2) : '—'} />
                        <Balance label="USDC" value={funds?.usdc === null ? 'no trustline' : funds ? funds.usdc.toFixed(2) : '—'} />
                      </div>
                      {config.network === 'testnet' ? (
                        <Button type="button" variant="outline" disabled={busy === 'fund'} onClick={fund} className="rounded-full">
                          {busy === 'fund' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />} {funds?.exists ? 'Swap 50 test XLM for USDC' : 'Get test XLM and USDC'}
                        </Button>
                      ) : <p className="text-xs text-muted-foreground">Add USDC to this wallet from an exchange or on-ramp.</p>}
                    </div>
                  )}
                </Step>

                <Step number="03" title="Sign a policy" done={policies.length > 0}>
                  <form onSubmit={create} className="grid gap-4">
                    <div>
                      <Label htmlFor="pl-merchant">Merchant address</Label>
                      <Input id="pl-merchant" required value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder="G…" className="mt-2 h-11 rounded-xl font-mono text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pl-amount">Amount per charge</Label>
                        <Input id="pl-amount" required inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-2 h-11 rounded-xl font-mono" />
                      </div>
                      <div>
                        <Label htmlFor="pl-cap">Safety cap (total)</Label>
                        <Input id="pl-cap" required inputMode="decimal" value={form.cap} onChange={(e) => setForm({ ...form, cap: e.target.value })} className="mt-2 h-11 rounded-xl font-mono" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pl-interval">Every</Label>
                      <select id="pl-interval" value={form.interval} onChange={(e) => setForm({ ...form, interval: Number(e.target.value) })} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {INTERVALS.map((option) => <option key={option.seconds} value={option.seconds}>{option.label}</option>)}
                      </select>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">Signing charges the first {form.amount || '0'} USDC now and allows at most {form.cap || '0'} USDC in total. If the first charge fails, nothing is created.</p>
                    <Button type="submit" disabled={!address || busy === 'create' || Boolean(disabledReason)} className="h-11 rounded-full">
                      {busy === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleDollarSign className="h-4 w-4" />} Sign policy and pay first charge
                    </Button>
                    {disabledReason ? <p className="text-xs text-destructive">{disabledReason}</p> : null}
                  </form>
                </Step>
              </div>

              <div className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div><p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">04 · Live</p><h2 className="mt-2 font-display text-2xl font-semibold">Your policies</h2></div>
                  <div className="flex flex-wrap gap-2">
                    {policies.length ? <Button type="button" variant="outline" size="sm" disabled={Boolean(busy)} onClick={renewAllowance} className="rounded-xl">{busy === 'renew' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Renew allowance</Button> : null}
                    <Button type="button" variant="outline" size="sm" disabled={!address} onClick={() => void refresh()} className="rounded-xl"><RefreshCw className="h-4 w-4" /> Refresh</Button>
                  </div>
                </div>
                {!policies.length ? <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{address ? 'No policies yet. Sign one to see charges arrive here.' : 'Connect a wallet to see its policies.'}</p> : (
                  <ul className="mt-6 space-y-4">
                    {policies.map((policy) => <PolicyCard key={policy.policyId} policy={policy} busy={busy} explorerBase={config.explorerBase} onAct={act} />)}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-foreground p-6 text-background sm:p-10">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">For merchants</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold">Accept PayLoop subscriptions in your app.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-background/60">Read policies by merchant from the PayLoop API, grant access while a policy is active, and react to charges as they land. The contract and relayer do the rest.</p>
          <Button asChild className="mt-6 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"><Link href="/docs/payloop">Read the integration guide <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
      <PlaygroundFooter />
    </main>
  )
}

function Step({ number, title, done, children }: { number: string; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className={cn('grid h-8 w-8 place-items-center rounded-full font-mono text-xs', done ? 'bg-success/15 text-success' : 'bg-brand/10 text-brand')}>{done ? <CheckCircle2 className="h-4 w-4" /> : number}</span>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Balance({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-muted/40 p-3"><p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-1 truncate">{value}</p></div>
}

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])
  const seconds = Math.round((new Date(target).getTime() - now) / 1000)
  if (seconds <= 0) return 'due now'
  if (seconds < 120) return `in ${seconds}s`
  if (seconds < 7_200) return `in ${Math.round(seconds / 60)} min`
  if (seconds < 172_800) return `in ${Math.round(seconds / 3_600)} h`
  return `in ${Math.round(seconds / 86_400)} days`
}

function PolicyCard({ policy, busy, explorerBase, onAct }: { policy: PayLoopPolicy; busy: string; explorerBase: string; onAct: (policy: PayLoopPolicy, method: 'pause' | 'resume' | 'revoke') => void }) {
  const [charges, setCharges] = useState<PayLoopCharge[]>([])
  const countdown = useCountdown(policy.nextChargeAt)
  useEffect(() => {
    payloopApi.policy(policy.policyId).then((result) => setCharges(result.charges)).catch(() => undefined)
  }, [policy.policyId, policy.charges, policy.failedAttempts])
  const live = policy.status === 'active' || policy.status === 'paused'
  const used = Math.min(100, Math.round((Number(policy.spent) / Number(policy.cap)) * 100))
  return (
    <li className="rounded-2xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">{policy.amountUsdc} USDC every {formatInterval(policy.intervalSeconds)}</p>
          <p className="mt-1 font-mono text-[0.68rem] text-muted-foreground">#{policy.policyId} · to {truncateAddress(policy.merchant)}</p>
        </div>
        <span className={cn('rounded-full px-2.5 py-1 font-mono text-[0.65rem] capitalize', STATUS_STYLE[policy.status])}>{policy.status}</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={100} aria-label="Share of the safety cap used"><div className="h-full rounded-full bg-brand" style={{ width: `${used}%` }} /></div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-[0.68rem] text-muted-foreground">
        <span>{policy.spentUsdc} of {policy.capUsdc} USDC · {policy.charges} charges</span>
        {policy.status === 'active' ? <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> next {countdown}</span> : null}
      </div>
      {policy.failedAttempts > 0 ? <p className="mt-2 text-xs text-destructive">Last {policy.failedAttempts} charge{policy.failedAttempts === 1 ? '' : 's'} could not be covered ({policy.lastAttemptError?.replace(/_/g, ' ') || 'insufficient funds'}). {policy.lastAttemptError === 'insufficient_allowance' ? 'Use Renew allowance' : 'Add USDC'} and the relayer retries.</p> : null}
      {live ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {policy.status === 'active'
            ? <Button type="button" size="sm" variant="outline" disabled={Boolean(busy)} onClick={() => onAct(policy, 'pause')} className="rounded-xl">{busy === `pause-${policy.policyId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />} Pause</Button>
            : <Button type="button" size="sm" variant="outline" disabled={Boolean(busy)} onClick={() => onAct(policy, 'resume')} className="rounded-xl">{busy === `resume-${policy.policyId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Resume</Button>}
          <Button type="button" size="sm" variant="outline" disabled={Boolean(busy)} onClick={() => onAct(policy, 'revoke')} className="rounded-xl text-destructive hover:text-destructive">{busy === `revoke-${policy.policyId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Revoke</Button>
        </div>
      ) : null}
      {charges.length ? (
        <ul className="mt-4 space-y-1.5 border-t border-border pt-3 font-mono text-[0.68rem]">
          {charges.slice(0, 6).map((charge) => (
            <li key={charge.eventId} className="flex items-center justify-between gap-3">
              <span className={charge.outcome === 'charged' ? 'text-success' : 'text-destructive'}>{charge.outcome === 'charged' ? `#${charge.chargeNumber} charged ${charge.amountUsdc} USDC` : charge.outcome.replace(/_/g, ' ')}</span>
              <a href={`${explorerBase}/tx/${charge.txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">{new Date(charge.at).toLocaleTimeString()} <ExternalLink className="h-3 w-3" /></a>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}
