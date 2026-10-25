'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, CheckCircle2, CircleDollarSign, Clock3, Coins, ExternalLink, Loader2, Pause, Play,
  RefreshCw, ShieldCheck, Wallet2, XCircle,
} from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { Chapter, ChapterHeading, Index } from '@/components/landing/chapter'
import { PolicyFigure } from '@/components/landing/figures'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useWalletKit } from '@/contexts/WalletKitContext'
import { getNetwork, type NetworkId } from '@/lib/networks'
import {
  PayLoopCharge, PayLoopConfig, PayLoopPolicy, WalletFunds, explainPayLoopError, formatInterval,
  payloopApi, readFunds, toStroops,
} from '@/lib/payloop'

/** The Stellar SDK loads only when the user signs something. */
const chain = () => import('@/lib/payloop-chain')
import { cn, truncateAddress } from '@/lib/utils'

const DEFAULT_FORM: Record<NetworkId, { amount: string; interval: number; cap: string }> = {
  testnet: { amount: '0.1', interval: 60, cap: '2' },
  // Real money: a monthly plan by default, never the one-minute demo.
  mainnet: { amount: '1', interval: 30 * 86_400, cap: '12' },
}

const INTERVALS = [
  { label: '1 minute (demo)', seconds: 60 },
  { label: '1 hour', seconds: 3_600 },
  { label: '1 day', seconds: 86_400 },
  { label: '30 days', seconds: 30 * 86_400 },
]

const STATUS_STYLE: Record<string, string> = {
  active: 'border-success/40 bg-success/10 text-success',
  paused: 'border-warning/40 bg-warning/10 text-warning',
  revoked: 'border-border bg-muted text-muted-foreground',
  completed: 'border-brand/40 bg-brand/10 text-brand',
}

const FACTS = [
  { title: 'Non-custodial', copy: 'An allowance equal to what your policies may still charge. Nothing is pre-funded.' },
  { title: 'On schedule', copy: 'Anyone may trigger a due charge, but only to your merchant, for your amount.' },
  { title: 'Yours to stop', copy: 'Pause, resume, or revoke on-chain. Revoking shrinks the allowance.' },
]

export default function PayLoopPage() {
  const { address, connect, connecting, disconnect, signTransaction, isInitialized, getWalletNetwork } = useWalletKit()
  const [selected, setSelected] = useState<NetworkId>('testnet')
  const [config, setConfig] = useState<PayLoopConfig | null>(null)
  const [configError, setConfigError] = useState('')
  const [funds, setFunds] = useState<WalletFunds | null>(null)
  const [policies, setPolicies] = useState<PayLoopPolicy[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<{ text: string; hash?: string } | null>(null)
  const [form, setForm] = useState({ merchant: '', ...DEFAULT_FORM.testnet })

  const network = config ? getNetwork(config.network) : null
  const wallet = useMemo(() => address ? { address, signTransaction } : null, [address, signTransaction])

  // ?network=mainnet opens the mainnet view directly.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('network') === 'mainnet') setSelected('mainnet')
  }, [])

  useEffect(() => {
    setConfig(null)
    setConfigError('')
    setPolicies([])
    setFunds(null)
    setNotice(null)
    setError('')
    payloopApi.config(selected)
      .then((value) => {
        setConfig(value)
        setForm({ merchant: value.demoMerchant || '', ...DEFAULT_FORM[selected] })
      })
      .catch((cause) => setConfigError(explainPayLoopError(cause)))
  }, [selected])

  const mainnetAvailable = Boolean(config?.networks?.find((item) => item.network === 'mainnet')?.enabled)

  /** Signing on the wrong network would fail on-chain; stop before the wallet prompt. */
  async function assertWalletNetwork() {
    if (!network) return
    const current = await getWalletNetwork().catch(() => null)
    if (current?.networkPassphrase && current.networkPassphrase !== network.passphrase) {
      throw new Error(`Your wallet is on a different network. Switch it to Stellar ${network.label}, then try again.`)
    }
  }

  const refresh = useCallback(async () => {
    if (!config || !address) return
    const [nextFunds, list] = await Promise.all([
      readFunds(config.network, address).catch(() => null),
      payloopApi.policies(address, config.network).then((result) => result.policies).catch(() => []),
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
      await assertWalletNetwork()
      const { allowanceLiveUntil, invokePayLoop, scv } = await chain()
      const amount = toStroops(form.amount)
      const cap = toStroops(form.cap)
      if (cap < amount) throw new Error('The safety cap must cover at least one charge.')
      const retryNotice = () => setNotice({ text: 'The network was busy and nothing was charged. Approve once more in your wallet.' })
      const result = await invokePayLoop(config, wallet, 'create_policy', [
        scv.address(wallet.address), scv.address(form.merchant.trim()), scv.i128(amount),
        scv.u64(BigInt(form.interval)), scv.i128(cap), scv.u32(await allowanceLiveUntil(config)),
      ], retryNotice)
      return { text: `Policy ${String(result.simulated ?? '')} created and the first ${form.amount} USDC charge settled.`, hash: result.hash }
    })
  }

  const act = (policy: PayLoopPolicy, method: 'pause' | 'resume' | 'revoke') => run(`${method}-${policy.policyId}`, async () => {
    if (!wallet || !config) return
    await assertWalletNetwork()
    const { invokePayLoop, scv } = await chain()
    const result = await invokePayLoop(config, wallet, method, [scv.u64(policy.policyId)])
    const verb = method === 'pause' ? 'paused' : method === 'resume' ? 'resumed' : 'revoked'
    const trim = method === 'revoke' ? ' It can never charge again; use Renew allowance to trim what it had left.' : ''
    return { text: `Policy ${policy.policyId} ${verb}.${trim}`, hash: result.hash }
  })

  // Re-grant exactly what live policies may still charge, with a fresh ~100-day expiry.
  const renewAllowance = () => run('renew', async () => {
    if (!wallet || !config) return
    await assertWalletNetwork()
    const { allowanceLiveUntil, invokePayLoop, scv } = await chain()
    const result = await invokePayLoop(config, wallet, 'refresh_allowance', [scv.address(wallet.address), scv.u32(await allowanceLiveUntil(config))])
    return { text: 'Allowance renewed and trimmed to what your live policies may still charge.', hash: result.hash }
  })

  const disabledReason = !config?.enabled ? 'PayLoop is not deployed on this server.' : null

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <PlaygroundNavbar />

      {/* 00 · Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-16 lg:pb-20 lg:pt-24">
          <Reveal className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"><Link href="/" className="transition-colors duration-150 hover:text-foreground">WebSoroban</Link><span className="mx-2 text-border">/</span><span className="text-foreground">PayLoop</span></p>
              <h1 className="mt-8 font-display text-display-lg font-medium">Subscriptions that never take custody.</h1>
              <p className="lead mt-8 text-lg sm:text-xl">Sign one USDC policy: merchant, amount, interval, and a safety cap. The first charge settles atomically, the relayer charges on schedule, and you can pause or revoke from your wallet at any time.</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="lit group h-12 gap-2 px-6" onClick={() => document.getElementById('payloop-studio')?.scrollIntoView({ behavior: 'smooth' })}>
                  Sign a policy
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
                </Button>
                <Link href="/docs/payloop" className="group inline-flex min-h-12 items-center gap-2 rounded-md px-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-150 hover:text-foreground">
                  Read the guide
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="mb-4 flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
                <span>fig. 01 · a policy, as the contract sees it</span>
              </div>
              <PolicyFigure />
            </div>
          </Reveal>
          <Reveal className="mt-14 grid gap-px border border-border bg-border md:grid-cols-3 lg:mt-20" delay={0.06}>
            {FACTS.map((fact, index) => (
              <div key={fact.title} className="bg-background p-5">
                <Index>0{index + 1}</Index>
                <h2 className="mt-3 text-sm font-medium text-foreground">{fact.title}</h2>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{fact.copy}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 01 · Subscribe */}
      <Chapter index="01" label="Subscribe" figure="fig. 02 · your wallet, your policies" id="payloop-studio" className="pt-10 lg:pt-16">
        <ChapterHeading
          title="Connect, fund, sign."
          lead="Every action is signed by your wallet. WebSoroban never holds a key, and funds stay in your wallet until a charge is due."
        />
        <div className="mt-14 lg:mt-20">
          {configError ? <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{configError}</p> : null}
          {!config && !configError ? <div className="space-y-6"><div className="flex gap-2"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-40" /></div><div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><Skeleton className="h-96" /><Skeleton className="h-96" /></div></div> : null}
          {config ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
                  <div role="radiogroup" aria-label="Network" className="inline-flex rounded-md border border-border bg-card p-0.5">
                    {(['testnet', 'mainnet'] as NetworkId[]).map((id) => {
                      const item = getNetwork(id)
                      const disabled = id === 'mainnet' && !mainnetAvailable && selected !== 'mainnet'
                      return (
                        <button key={id} type="button" role="radio" aria-checked={selected === id} disabled={disabled || Boolean(busy)} onClick={() => setSelected(id)} title={disabled ? 'PayLoop is not deployed on mainnet yet' : undefined} className={cn('min-h-9 rounded-sm px-3 uppercase transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40', selected === id ? item.badgeClass + ' border' : 'text-muted-foreground hover:text-foreground')}>
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                  {config.contractId ? <a href={`${config.explorerBase}/contract/${config.contractId}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-border px-3 transition-colors duration-150 hover:border-foreground/30 hover:text-foreground">Contract {truncateAddress(config.contractId, 4, 4)} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a> : null}
                </div>
                {address ? <div className="flex items-center gap-2 text-sm"><span className="font-mono text-xs text-muted-foreground">{truncateAddress(address)}</span><Button type="button" size="sm" variant="ghost" onClick={disconnect}>Disconnect</Button></div> : null}
              </div>

              {config.network === 'mainnet' ? (
                <p role="note" className="rounded-md border border-warning/40 bg-warning/10 p-4 text-sm leading-6 text-warning">
                  <strong>Mainnet: real USDC.</strong> Every charge moves real money from your wallet to the merchant.
                  {config.audited === false ? ' This contract has not yet completed an independent security review; only commit amounts you are prepared to risk.' : ''}
                  {!config.enabled ? ' PayLoop is not deployed on mainnet yet.' : ''}
                </p>
              ) : null}

              {error ? <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</p> : null}
              {notice ? <p role="status" className="flex flex-wrap items-center gap-2 rounded-md border border-success/40 bg-success/10 p-4 text-sm"><CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />{notice.text}{notice.hash && network ? <a href={`${network.explorerBase}/tx/${notice.hash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-brand underline-offset-4 hover:underline">Receipt <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a> : null}</p> : null}

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-6">
                  <Step number="01" title="Connect a wallet" done={Boolean(address)}>
                    {address ? <p className="text-sm text-muted-foreground">Connected. Your wallet signs every policy action; WebSoroban never holds a key.</p> : (
                      <Button type="button" disabled={!isInitialized || connecting} onClick={() => connect().catch(() => undefined)} className="gap-2">
                        {connecting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wallet2 className="h-4 w-4" aria-hidden="true" />} Connect wallet
                      </Button>
                    )}
                  </Step>

                  <Step number="02" title="Fund it with USDC" done={Boolean(funds?.usdc && funds.usdc > 0)}>
                    {!address ? <p className="text-sm text-muted-foreground">Connect first.</p> : (
                      <div className="space-y-3">
                        <dl className="grid grid-cols-2 gap-px border border-border bg-border font-mono text-sm">
                          <Balance label="XLM" value={funds ? funds.xlm.toFixed(2) : '—'} />
                          <Balance label="USDC" value={funds?.usdc === null ? 'no trustline' : funds ? funds.usdc.toFixed(2) : '—'} />
                        </dl>
                        {config.network === 'testnet' ? (
                          <Button type="button" variant="outline" disabled={busy === 'fund'} onClick={fund} className="gap-2">
                            {busy === 'fund' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Coins className="h-4 w-4" aria-hidden="true" />} {funds?.exists ? 'Swap 50 test XLM for USDC' : 'Get test XLM and USDC'}
                          </Button>
                        ) : <p className="text-xs text-muted-foreground">Add USDC to this wallet from an exchange or on-ramp.</p>}
                      </div>
                    )}
                  </Step>

                  <Step number="03" title="Sign a policy" done={policies.length > 0}>
                    <form onSubmit={create} className="grid gap-4">
                      <div>
                        <Label htmlFor="pl-merchant">Merchant address</Label>
                        <Input id="pl-merchant" required value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder="G…" className="mt-2 h-11 rounded-md font-mono text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pl-amount">Amount per charge</Label>
                          <Input id="pl-amount" required inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-2 h-11 rounded-md font-mono-tnum" />
                        </div>
                        <div>
                          <Label htmlFor="pl-cap">Safety cap (total)</Label>
                          <Input id="pl-cap" required inputMode="decimal" value={form.cap} onChange={(e) => setForm({ ...form, cap: e.target.value })} className="mt-2 h-11 rounded-md font-mono-tnum" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="pl-interval">Every</Label>
                        <select id="pl-interval" value={form.interval} onChange={(e) => setForm({ ...form, interval: Number(e.target.value) })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {INTERVALS.map((option) => <option key={option.seconds} value={option.seconds}>{option.label}</option>)}
                        </select>
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">Signing charges the first {form.amount || '0'} USDC now and allows at most {form.cap || '0'} USDC in total. If the first charge fails, nothing is created.</p>
                      <Button type="submit" disabled={!address || busy === 'create' || Boolean(disabledReason)} className="h-11 gap-2">
                        {busy === 'create' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CircleDollarSign className="h-4 w-4" aria-hidden="true" />} Sign policy and pay first charge
                      </Button>
                      {disabledReason ? <p className="text-xs text-destructive">{disabledReason}</p> : null}
                    </form>
                  </Step>
                </div>

                <div className="figure ticks">
                  <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                    <div>
                      <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"><span className="text-foreground">04</span><span aria-hidden="true" className="h-px w-4 bg-border" />Live</p>
                      <h2 className="mt-2 font-display text-xl font-medium">Your policies</h2>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {policies.length ? <Button type="button" variant="outline" size="sm" disabled={Boolean(busy)} onClick={renewAllowance}>{busy === 'renew' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />} Renew allowance</Button> : null}
                      <Button type="button" variant="outline" size="sm" disabled={!address} onClick={() => void refresh()}><RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh</Button>
                    </div>
                  </div>
                  {!policies.length ? <p className="m-5 border border-dashed border-border p-8 text-center text-sm text-muted-foreground sm:m-6">{address ? 'No policies yet. Sign one to see charges arrive here.' : 'Connect a wallet to see its policies.'}</p> : (
                    <ul className="divide-y divide-border">
                      {policies.map((policy) => <PolicyCard key={`${config.network}-${policy.policyId}`} policy={policy} network={config.network} busy={busy} explorerBase={config.explorerBase} onAct={act} />)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Chapter>

      {/* 02 · Merchants */}
      <Chapter index="02" label="Merchants" figure="fig. 03 · integration" className="pb-24 pt-24 lg:pb-32 lg:pt-32">
        <ChapterHeading
          title="Accept PayLoop subscriptions in your app."
          lead="Read policies by merchant from the PayLoop API, grant access while a policy is active, and react to charges as they land. The contract and relayer do the rest."
          aside={
            <Button asChild variant="outline" size="sm">
              <Link href="/docs/payloop">Read the integration guide <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </Button>
          }
        />
        <Reveal className="mt-10 figure ticks overflow-hidden" delay={0.05}>
          <div className="flex h-11 items-center justify-between border-b border-border px-4 font-mono text-[0.68rem] text-muted-foreground">
            <span className="text-foreground">server.ts</span>
            <span>@web-soroban/payloop</span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[0.72rem] leading-6 text-muted-foreground"><code><span className="text-foreground">import</span> {'{'} createPayLoopClient, verifyWalletSignature {'}'} <span className="text-foreground">from</span> <span className="text-brand">&apos;@web-soroban/payloop&apos;</span>{'\n\n'}<span className="text-foreground">const</span> payloop = createPayLoopClient({'{'} network: <span className="text-brand">&apos;mainnet&apos;</span> {'}'}){'\n\n'}<span className="text-foreground">const</span> plan = <span className="text-foreground">await</span> payloop.activeSubscription({'{'} subscriber, merchant, amount: <span className="text-brand">&apos;9.99&apos;</span>, intervalSeconds: 2592000 {'}'})</code></pre>
        </Reveal>
      </Chapter>
      <PlaygroundFooter />
    </main>
  )
}

function Step({ number, title, done, children }: { number: string; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="figure ticks">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
        <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-sm border font-mono text-[0.68rem]', done ? 'border-success/40 bg-success/10 text-success' : 'border-border text-muted-foreground')}>{done ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : number}</span>
        <h2 className="font-display text-lg font-medium">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}

function Balance({ label, value }: { label: string; value: string }) {
  return <div className="bg-card p-3"><dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt><dd className="mt-1 truncate font-mono-tnum">{value}</dd></div>
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

function PolicyCard({ policy, network, busy, explorerBase, onAct }: { policy: PayLoopPolicy; network: NetworkId; busy: string; explorerBase: string; onAct: (policy: PayLoopPolicy, method: 'pause' | 'resume' | 'revoke') => void }) {
  const [charges, setCharges] = useState<PayLoopCharge[]>([])
  const countdown = useCountdown(policy.nextChargeAt)
  useEffect(() => {
    payloopApi.policy(policy.policyId, network).then((result) => setCharges(result.charges)).catch(() => undefined)
  }, [policy.policyId, policy.charges, policy.failedAttempts, network])
  const live = policy.status === 'active' || policy.status === 'paused'
  const used = Math.min(100, Math.round((Number(policy.spent) / Number(policy.cap)) * 100))
  return (
    <li className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-medium">{policy.amountUsdc} USDC every {formatInterval(policy.intervalSeconds)}</p>
          <p className="mt-1 font-mono text-[0.68rem] text-muted-foreground">#{policy.policyId} · to {truncateAddress(policy.merchant)}</p>
        </div>
        <span className={cn('rounded-sm border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.12em]', STATUS_STYLE[policy.status])}>{policy.status}</span>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-sm bg-muted" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={100} aria-label="Share of the safety cap used"><div className="h-full rounded-sm bg-brand" style={{ width: `${used}%` }} /></div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-[0.68rem] text-muted-foreground">
        <span>{policy.spentUsdc} of {policy.capUsdc} USDC · {policy.charges} charges</span>
        {policy.status === 'active' ? <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> next {countdown}</span> : null}
      </div>
      {policy.failedAttempts > 0 ? <p className="mt-2 text-xs text-destructive">Last {policy.failedAttempts} charge{policy.failedAttempts === 1 ? '' : 's'} could not be covered ({policy.lastAttemptError?.replace(/_/g, ' ') || 'insufficient funds'}). {policy.lastAttemptError === 'insufficient_allowance' ? 'Use Renew allowance' : 'Add USDC'} and the relayer retries.</p> : null}
      {live ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {policy.status === 'active'
            ? <Button type="button" size="sm" variant="outline" disabled={Boolean(busy)} onClick={() => onAct(policy, 'pause')}>{busy === `pause-${policy.policyId}` ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />} Pause</Button>
            : <Button type="button" size="sm" variant="outline" disabled={Boolean(busy)} onClick={() => onAct(policy, 'resume')}>{busy === `resume-${policy.policyId}` ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />} Resume</Button>}
          <Button type="button" size="sm" variant="outline" disabled={Boolean(busy)} onClick={() => onAct(policy, 'revoke')} className="text-destructive hover:text-destructive">{busy === `revoke-${policy.policyId}` ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />} Revoke</Button>
        </div>
      ) : null}
      {charges.length ? (
        <ul className="mt-4 border-t border-border pt-3 font-mono text-[0.68rem]">
          {charges.slice(0, 6).map((charge) => (
            <li key={charge.eventId} className="flex items-center justify-between gap-3 py-1">
              <span className={charge.outcome === 'charged' ? 'text-success' : 'text-destructive'}>{charge.outcome === 'charged' ? `#${charge.chargeNumber} charged ${charge.amountUsdc} USDC` : charge.outcome.replace(/_/g, ' ')}</span>
              <a href={`${explorerBase}/tx/${charge.txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground transition-colors duration-150 hover:text-foreground">{new Date(charge.at).toLocaleTimeString()} <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}
