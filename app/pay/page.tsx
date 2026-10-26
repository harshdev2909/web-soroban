'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, Check, CheckCircle2, CircleDollarSign, Clipboard, Code2,
  ExternalLink, Gauge, KeyRound, Loader2, Play, RefreshCw, RotateCw, Route, ShieldCheck,
  TerminalSquare, Wallet2, XCircle, Zap,
} from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { LoginModal } from '@/components/login-modal'
import { Chapter, ChapterHeading, Index } from '@/components/landing/chapter'
import { PaymentFlowFigure } from '@/components/landing/figures'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { walletApi } from '@/lib/api'
import { PayControls } from '@/components/pay/pay-controls'
import {
  CreatedPayEndpoint, PayApiError, PayEndpoint, PayEvent, PayFailureReason, PayNetwork, PayOverview,
  TrustlineReport, payApi, payNetwork,
} from '@/lib/payApi'
import { explorerTx } from '@/lib/networks'
import { cn } from '@/lib/utils'
import { useSiteLink } from '@/lib/hosts'

const emptyForm = {
  name: 'Research brief', slug: 'research-brief', price: '0.01', payTo: '',
  responseMessage: 'Your paid research brief is ready.', network: 'stellar:testnet' as PayNetwork,
}
type EndpointForm = typeof emptyForm

const FACTS = [
  { title: 'Official x402 v2', copy: 'The exact scheme on Stellar, verified and settled by the OpenZeppelin facilitator.' },
  { title: 'Testnet and mainnet', copy: 'A wsp_test_ key can never guard a mainnet route. The network comes from the key.' },
  { title: 'USDC, one authorization', copy: 'The wallet signs a single Soroban auth entry. The facilitator pays the network fee.' },
]

const STAGES = [
  { icon: Route, title: 'Define', copy: 'Choose the network, route, price, response, and a payout address that holds a USDC trustline.' },
  { icon: ShieldCheck, title: 'Verify', copy: 'The official x402 server scheme validates the signed Stellar payment payload.' },
  { icon: CheckCircle2, title: 'Settle', copy: 'The facilitator submits the authorized USDC transfer and returns the proof.' },
]

export default function PayPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [overview, setOverview] = useState<PayOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<CreatedPayEndpoint | null>(null)
  const [busyEndpoint, setBusyEndpoint] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<{ endpointId: string; header: boolean } | null>(null)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    void walletApi.me().then((wallet) => {
      setForm((current) => current.payTo ? current : { ...current, payTo: wallet.publicKey })
    }).catch(() => undefined)
  }, [isAuthenticated])

  const loadOverview = async () => {
    if (!isAuthenticated) { setLoading(false); setOverview(null); return }
    setLoading(true); setError('')
    try { setOverview(await payApi.getOverview()) }
    catch (requestError) { setError(messageOf(requestError, 'Could not load WebSoroban Pay.')) }
    finally { setLoading(false) }
  }

  useEffect(() => { void loadOverview() }, [isAuthenticated])

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setCreating(true); setCreated(null); setError('')
    try { const result = await payApi.createEndpoint(form); setCreated(result); await loadOverview() }
    catch (requestError) { setError(messageOf(requestError, 'Could not create the endpoint.')) }
    finally { setCreating(false) }
  }

  const toggleEndpoint = async (endpoint: PayEndpoint, active: boolean) => {
    setBusyEndpoint(endpoint.id); setError('')
    try {
      const result = await payApi.setEndpointActive(endpoint.id, active)
      setOverview((current) => current ? { ...current, endpoints: current.endpoints.map((item) => item.id === endpoint.id ? result.endpoint : item) } : current)
    } catch (requestError) { setError(messageOf(requestError, 'Could not update the endpoint.')) }
    finally { setBusyEndpoint(null) }
  }

  const rotateKey = async (endpoint: PayEndpoint) => {
    setBusyEndpoint(endpoint.id); setError('')
    try {
      const result = await payApi.rotateEndpointKey(endpoint.id)
      setCreated(result)
      await loadOverview()
      document.getElementById('pay-credential')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch (requestError) { setError(messageOf(requestError, 'Could not rotate the key.')) }
    finally { setBusyEndpoint(null) }
  }

  const testChallenge = async (endpoint: PayEndpoint) => {
    setBusyEndpoint(endpoint.id); setChallenge(null); setError('')
    try {
      const result = await payApi.requestChallenge(endpoint.resourceUrl)
      setChallenge({ endpointId: endpoint.id, header: Boolean(result.paymentRequired) })
      await loadOverview()
    } catch (requestError) { setError(messageOf(requestError, 'The challenge request failed.')) }
    finally { setBusyEndpoint(null) }
  }

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value); setCopied(label)
      window.setTimeout(() => setCopied(''), 1800)
    } catch { setError('Copy failed. Select the text and copy it manually.') }
  }

  const snippet = created ? `import { createWebSorobanPay } from '@web-soroban/pay'\n\nconst pay = createWebSorobanPay({\n  apiUrl: '${apiOrigin(created.endpoint.resourceUrl)}',\n  apiKey: process.env.WEBSOROBAN_PAY_KEY, // ${created.endpoint.network}\n  endpointId: '${created.endpoint.id}',\n  payTo: '${created.endpoint.payTo}',\n})\n\napp.use(pay.protect('GET /brief', '${created.endpoint.price}'))` : ''

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} returnTo="/pay" />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      {/* 00 · Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-16 lg:pb-20 lg:pt-24">
          <Reveal className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"><Link href="/" className="transition-colors duration-150 hover:text-foreground">WebSoroban</Link><span className="mx-2 text-border">/</span><span className="text-foreground">Pay</span></p>
              <h1 className="mt-8 font-display text-display-lg font-medium">Price an endpoint. Watch it settle.</h1>
              <p className="lead mt-8 text-lg sm:text-xl">Create an HTTP 402 paywall that settles USDC on Stellar, then inspect every challenge, verification, and settlement from one workflow.</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="lit group h-12 gap-2 px-6" onClick={() => isAuthenticated ? document.getElementById('pay-studio')?.scrollIntoView({ behavior: 'smooth' }) : setLoginOpen(true)}>
                  {isAuthenticated ? 'Open payment studio' : 'Start on testnet'}
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
                </Button>
                <Link href="/docs/payments" className="group inline-flex min-h-12 items-center gap-2 rounded-md px-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-150 hover:text-foreground">
                  Read the guide
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <ul className="lg:col-span-5">
              {FACTS.map((fact, index) => (
                <li key={fact.title} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-border py-4 last:border-b">
                  <Index className="pt-0.5">0{index + 1}</Index>
                  <div>
                    <p className="text-sm font-medium text-foreground">{fact.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{fact.copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="mt-14 lg:mt-20" delay={0.06}>
            <div className="mb-4 flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
              <span>fig. 01 · one paid request</span>
              <span className="hidden sm:inline">402 → sign → settle → 200</span>
            </div>
            <PaymentFlowFigure />
          </Reveal>
        </div>
      </section>

      {/* 01 · Studio */}
      <Chapter index="01" label="Studio" figure="fig. 02 · payment studio" id="pay-studio" className="pt-10 lg:pt-16">
        <ChapterHeading
          title="Your payment studio."
          lead="One asset, one reliable path from 402 challenge to Stellar settlement, with the failure reason and fix for anything that does not settle."
          aside={overview ? (
            <div className="flex flex-wrap gap-2">
              {(overview.networks || []).filter((item) => item.enabled).map((item) => (
                <span key={item.network} className="inline-flex min-h-9 items-center gap-2 rounded-sm border border-border px-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
                  <ShieldCheck className={cn('h-3.5 w-3.5', payNetwork(item.network).textClass)} aria-hidden="true" /> {item.facilitator?.name} · {payNetwork(item.network).label}
                </span>
              ))}
            </div>
          ) : undefined}
        />

        {authLoading || loading ? <StudioSkeleton /> : !isAuthenticated ? <SignedOut onSignIn={() => setLoginOpen(true)} /> : (
          <div className="mt-14 space-y-6 lg:mt-20">
            {error && <div role="alert" className="flex items-start justify-between gap-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"><span className="flex gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{error}</span><button type="button" onClick={() => setError('')} className="rounded-md px-2 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors duration-150 hover:bg-destructive/15">Dismiss</button></div>}
            <MetricStrip overview={overview} />
            <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
              <Reveal><EndpointFormCard form={form} setForm={setForm} creating={creating} onSubmit={submit} overview={overview} /></Reveal>
              <Reveal delay={0.05}><EndpointPanel overview={overview} busyEndpoint={busyEndpoint} challenge={challenge} onToggle={toggleEndpoint} onTest={testChallenge} onRotate={rotateKey} /></Reveal>
            </div>
            {created && <Reveal><CredentialReveal created={created} snippet={snippet} copied={copied} onCopy={copy} /></Reveal>}
            <Reveal><FailureReasons reasons={overview?.failureReasons || []} /></Reveal>
            <Reveal><ActivityPanel events={overview?.events || []} onRefresh={loadOverview} /></Reveal>
            {overview ? <Reveal><PayControls overview={overview} onChange={loadOverview} /></Reveal> : null}
          </div>
        )}
      </Chapter>

      {/* 02 · How it settles */}
      <Chapter index="02" label="Settlement" figure="fig. 03 · three stages" className="pb-24 pt-24 lg:pb-32 lg:pt-32">
        <Reveal className="mt-10 grid gap-px border border-border bg-border md:grid-cols-3">
          {STAGES.map(({ icon: Icon, title, copy }, index) => (
            <div key={title} className="bg-background p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <Index>0{index + 1}</Index>
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="mt-8 font-display text-xl font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </Reveal>
      </Chapter>
      <PlaygroundFooter />
    </main>
  )
}

function SignedOut({ onSignIn }: { onSignIn: () => void }) {
  return (
    <Reveal className="mt-14 lg:mt-20">
      <div className="figure ticks grid gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:items-end lg:p-10">
        <div className="lg:col-span-8">
          <p className="eyebrow">Sign in</p>
          <h3 className="mt-4 font-display text-display font-medium">Create your first paid endpoint.</h3>
          <p className="lead mt-5 text-base">WebSoroban provisions the testnet workspace and keeps facilitator credentials on the server. You receive a scoped endpoint key for your app.</p>
        </div>
        <div className="lg:col-span-4 lg:justify-self-end">
          <Button size="lg" className="group h-12 gap-2 px-6" onClick={onSignIn}>Sign in and build <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" /></Button>
        </div>
      </div>
    </Reveal>
  )
}

/** Debounced USDC trustline check for the payout address as the user types. */
function usePayoutTrustline(address: string, network: PayNetwork) {
  const [report, setReport] = useState<TrustlineReport | null>(null)
  const [checking, setChecking] = useState(false)
  useEffect(() => {
    const value = address.trim()
    setReport(null)
    if (!/^[GMC][A-Z2-7]{55,}$/.test(value)) { setChecking(false); return }
    const controller = new AbortController()
    setChecking(true)
    const timer = window.setTimeout(() => {
      payApi.checkTrustline(value, network, controller.signal)
        .then(setReport)
        .catch(() => setReport(null))
        .finally(() => { if (!controller.signal.aborted) setChecking(false) })
    }, 450)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [address, network])
  return { report, checking }
}

function PanelHeader({ index, label, title, action }: { index: string; label: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
      <div>
        <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"><span className="text-foreground">{index}</span><span aria-hidden="true" className="h-px w-4 bg-border" />{label}</p>
        <h3 className="mt-2 font-display text-xl font-medium">{title}</h3>
      </div>
      {action}
    </div>
  )
}

function EndpointFormCard({ form, setForm, creating, onSubmit, overview }: { form: EndpointForm; setForm: (form: EndpointForm) => void; creating: boolean; onSubmit: (event: FormEvent) => void; overview: PayOverview | null }) {
  const payout = usePayoutTrustline(form.payTo, form.network)
  const networks = overview?.networks?.length ? overview.networks : [{ network: 'stellar:testnet' as PayNetwork, label: 'Stellar Testnet', enabled: true, facilitator: null }]
  const mainnet = form.network === 'stellar:pubnet'
  const payoutBlocked = Boolean(payout.report && !payout.report.ready && payout.report.status !== 'unknown')
  return (
    <form onSubmit={onSubmit} className="figure ticks">
      <PanelHeader index="01" label="New endpoint" title="Define the payment rule" />
      <div className="grid gap-5 p-5 sm:p-6">
        <fieldset>
          <legend className="text-sm font-medium">Network</legend>
          <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-2">
            {networks.map((item) => {
              const config = payNetwork(item.network)
              const selected = form.network === item.network
              return <button key={item.network} type="button" role="radio" aria-checked={selected} disabled={!item.enabled} onClick={() => setForm({ ...form, network: item.network })} className={cn('min-h-11 rounded-md border px-3 text-left text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', selected ? 'border-brand bg-brand/10 text-foreground' : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground')}>
                <span className="flex items-center gap-2 font-medium"><span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} aria-hidden="true" />{config.label}</span>
                {!item.enabled ? <span className="mt-0.5 block font-mono text-[0.62rem] text-muted-foreground">Not enabled on this server</span> : null}
              </button>
            })}
          </div>
          {mainnet ? <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-warning"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Mainnet endpoints settle real USDC and get a wsp_live_ key.</p> : null}
        </fieldset>
        <Field label="Endpoint name" htmlFor="pay-name" hint="Shown in the 402 challenge."><Input id="pay-name" required minLength={3} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-md" /></Field>
        <div className="grid gap-5 sm:grid-cols-[1fr_9rem]"><Field label="URL slug" htmlFor="pay-slug" hint="Letters, numbers, hyphens."><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">/</span><Input id="pay-slug" required minLength={3} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-11 rounded-md pl-6 font-mono" /></div></Field><Field label="Price" htmlFor="pay-price" hint="USDC"><Input id="pay-price" required inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-11 rounded-md font-mono-tnum" /></Field></div>
        <Field label="Payout address" htmlFor="pay-wallet" hint={mainnet ? 'A Stellar address you control on mainnet, with a USDC trustline.' : 'A Stellar address with a USDC trustline. Your testnet wallet is prefilled when available.'}>
          <Input id="pay-wallet" required value={form.payTo} onChange={(e) => setForm({ ...form, payTo: e.target.value.trim() })} placeholder="G…" aria-describedby="pay-wallet-status" className="h-11 rounded-md font-mono text-xs" />
          <PayoutStatus id="pay-wallet-status" checking={payout.checking} report={payout.report} />
        </Field>
        <Field label="Paid response" htmlFor="pay-response" hint="Returned only after successful settlement."><Textarea id="pay-response" required value={form.responseMessage} onChange={(e) => setForm({ ...form, responseMessage: e.target.value })} className="min-h-24 resize-none rounded-md" /></Field>
        <Button type="submit" size="lg" disabled={creating || payoutBlocked} className="mt-2 h-12 w-full gap-2">{creating ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Creating endpoint…</> : <><Zap className="h-4 w-4" aria-hidden="true" /> Create paid endpoint</>}</Button>
      </div>
    </form>
  )
}

function PayoutStatus({ id, checking, report }: { id: string; checking: boolean; report: TrustlineReport | null }) {
  if (checking) return <p id={id} className="mt-2 flex items-center gap-1.5 font-mono text-[0.68rem] text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Checking USDC trustline…</p>
  if (!report) return null
  if (report.ready) return <p id={id} className="mt-2 flex items-center gap-1.5 font-mono text-[0.68rem] text-success"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Can receive USDC</p>
  return <div id={id} role="status" className={cn('mt-2 text-xs leading-5', report.status === 'unknown' ? 'text-muted-foreground' : 'text-destructive')}><p>{report.message}</p>{report.fix ? <p className="mt-0.5 text-foreground">{report.fix}</p> : null}</div>
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint: string; children: React.ReactNode }) { return <div><Label htmlFor={htmlFor}>{label}</Label><div className="mt-2">{children}</div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{hint}</p></div> }

function formatRate(rate: number | null | undefined) {
  return rate === null || rate === undefined ? '—' : `${(rate * 100).toFixed(rate === 1 ? 0 : 1)}%`
}

function MetricStrip({ overview }: { overview: PayOverview | null }) {
  const windows = overview?.metrics.settlement || []
  const day = windows.find((window) => window.label === '24h')
  const week = windows.find((window) => window.label === '7d')
  const metrics = [
    { label: 'Endpoints', value: String(overview?.metrics.endpoints ?? 0), icon: Route, detail: null },
    { label: 'Challenges', value: String(overview?.metrics.requests ?? 0), icon: Activity, detail: null },
    { label: 'Settled', value: String(overview?.metrics.settled ?? 0), icon: CheckCircle2, detail: overview?.metrics.failed ? `${overview.metrics.failed} failed` : null },
    { label: 'Success 24h', value: formatRate(day?.successRate), icon: Gauge, detail: week ? `7d ${formatRate(week.successRate)} · ${week.attempts} attempts` : null },
    { label: 'Revenue', value: `${overview?.metrics.revenueUsdc ?? '0'} USDC`, icon: CircleDollarSign, detail: null },
  ]
  return (
    <dl className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map(({ label, value, icon: Icon, detail }) => (
        <div key={label} className="bg-card p-5">
          <dt className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</dt>
          <dd className="mt-4 font-display text-3xl font-medium tabular-nums">{value}</dd>
          {detail ? <dd className="mt-1 font-mono text-[0.65rem] text-muted-foreground">{detail}</dd> : null}
        </div>
      ))}
    </dl>
  )
}

function EndpointPanel({ overview, busyEndpoint, challenge, onToggle, onTest, onRotate }: { overview: PayOverview | null; busyEndpoint: string | null; challenge: { endpointId: string; header: boolean } | null; onToggle: (endpoint: PayEndpoint, active: boolean) => void; onTest: (endpoint: PayEndpoint) => void; onRotate: (endpoint: PayEndpoint) => void }) {
  const site = useSiteLink()
  const endpoints = overview?.endpoints || []
  return (
    <div className="figure ticks min-h-full">
      <PanelHeader index="02" label="Live routes" title="Payment endpoints" action={<span className="font-mono text-[0.68rem] text-muted-foreground">{endpoints.length} route{endpoints.length === 1 ? '' : 's'}</span>} />
      {!endpoints.length ? (
        <div className="m-5 grid min-h-72 place-items-center border border-dashed border-border p-8 text-center sm:m-6">
          <div>
            <TerminalSquare className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-display text-xl font-medium">No payment routes yet</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Define the first route. Its test URL and scoped developer key appear here.</p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {endpoints.map((endpoint) => {
            const network = payNetwork(endpoint.network)
            const busy = busyEndpoint === endpoint.id
            return (
              <li key={endpoint.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-medium">{endpoint.name}</p>
                      <span className="rounded-sm border border-brand/40 px-2 py-0.5 font-mono text-[0.62rem] text-brand">{endpoint.price.replace(/^\$/, '')} USDC</span>
                      <span className={cn('rounded-sm border px-2 py-0.5 font-mono text-[0.62rem] uppercase', network.badgeClass)}>{network.label}</span>
                    </div>
                    <p className="mt-2 truncate font-mono text-[0.68rem] text-muted-foreground">GET /{endpoint.slug} · {endpoint.apiKeyPrefix}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">{endpoint.active ? 'Active' : 'Paused'}</span>
                    <Switch checked={endpoint.active} disabled={busy} onCheckedChange={(active) => onToggle(endpoint, active)} aria-label={`${endpoint.active ? 'Pause' : 'Activate'} ${endpoint.name}`} className="data-[state=checked]:bg-brand data-[state=unchecked]:bg-muted" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {endpoint.active ? <Button asChild size="sm"><Link {...site(`/pay/checkout?resource=${encodeURIComponent(endpoint.resourceUrl)}`)}><Wallet2 className="h-4 w-4" aria-hidden="true" /> Open checkout</Link></Button> : <Button size="sm" disabled><Wallet2 className="h-4 w-4" aria-hidden="true" /> Open checkout</Button>}
                  <Button type="button" size="sm" variant="outline" disabled={!endpoint.active || busy} onClick={() => onTest(endpoint)}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />} Inspect 402</Button>
                  <RotateKeyButton endpoint={endpoint} disabled={busy} onConfirm={onRotate} />
                  <a href={endpoint.resourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-md px-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground">Raw endpoint <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
                </div>
                {challenge?.endpointId === endpoint.id && (
                  <div className="mt-4 rounded-md border border-success/40 bg-success/10 p-3 text-sm">
                    <p className="flex items-center gap-2 font-medium text-success"><Check className="h-4 w-4" aria-hidden="true" /> HTTP 402 received</p>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{challenge.header ? 'PAYMENT-REQUIRED header is present and ready for an x402 client.' : 'Challenge received, but the PAYMENT-REQUIRED header was not exposed.'}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Two-step confirm: rotating invalidates the key every deployed server uses. */
function RotateKeyButton({ endpoint, disabled, onConfirm }: { endpoint: PayEndpoint; disabled: boolean; onConfirm: (endpoint: PayEndpoint) => void }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const timer = window.setTimeout(() => setArmed(false), 4000)
    return () => window.clearTimeout(timer)
  }, [armed])
  return <button type="button" disabled={disabled} onClick={() => { if (armed) { setArmed(false); onConfirm(endpoint) } else setArmed(true) }} className={cn('inline-flex min-h-9 items-center gap-2 rounded-md border px-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors duration-150 disabled:opacity-50', armed ? 'border-warning/50 bg-warning/15 text-warning' : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground')}><RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> {armed ? 'Click again to rotate' : 'Rotate key'}</button>
}

function CredentialReveal({ created, snippet, copied, onCopy }: { created: CreatedPayEndpoint; snippet: string; copied: string; onCopy: (label: string, value: string) => void }) {
  return (
    <div id="pay-credential" className="figure ticks grid overflow-hidden border-brand/40 lg:grid-cols-[0.74fr_1.26fr]">
      <div className="p-5 sm:p-6">
        <p className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-brand"><KeyRound className="h-3.5 w-3.5" aria-hidden="true" /> Copy once</p>
        <h3 className="mt-3 font-display text-2xl font-medium">Your endpoint key</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{created.warning} Put it in your app’s server-side environment, never in browser code.</p>
        <button type="button" onClick={() => onCopy('key', created.apiKey)} className="mt-5 flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-border bg-background px-4 text-left font-mono text-xs transition-colors duration-150 hover:border-foreground/30"><span className="truncate">{created.apiKey}</span>{copied === 'key' ? <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" /> : <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}</button>
        <dl className="mt-4 font-mono text-[0.68rem] text-muted-foreground">
          <div className="flex gap-3 border-t border-border py-2"><dt className="w-24 shrink-0 uppercase tracking-[0.12em]">Endpoint id</dt><dd className="truncate text-foreground">{created.endpoint.id}</dd></div>
          <div className="flex gap-3 border-t border-border py-2"><dt className="w-24 shrink-0 uppercase tracking-[0.12em]">Network</dt><dd className="text-foreground">{created.endpoint.network}</dd></div>
        </dl>
      </div>
      <div className="border-t border-border bg-background p-5 sm:p-6 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground"><Code2 className="h-3.5 w-3.5" aria-hidden="true" /> Express / TypeScript</div>
          <button type="button" onClick={() => onCopy('snippet', snippet)} className="inline-flex min-h-9 items-center gap-2 rounded-md px-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground">{copied === 'snippet' ? <Check className="h-4 w-4 text-success" aria-hidden="true" /> : <Clipboard className="h-4 w-4" aria-hidden="true" />} {copied === 'snippet' ? 'Copied' : 'Copy'}</button>
        </div>
        <pre className="mt-5 overflow-x-auto font-mono text-[0.72rem] leading-6 text-muted-foreground"><code>{snippet}</code></pre>
      </div>
    </div>
  )
}

function FailureReasons({ reasons }: { reasons: PayFailureReason[] }) {
  if (!reasons.length) return null
  const total = reasons.reduce((sum, reason) => sum + reason.count, 0)
  return (
    <div className="figure ticks">
      <PanelHeader index="03" label="Last 7 days" title="Why payments failed" />
      <ul className="divide-y divide-border">
        {reasons.map((reason) => (
          <li key={reason.code} className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,14rem)_1fr_auto] sm:items-start sm:gap-6 sm:px-6">
            <div><p className="font-mono text-xs text-destructive">{reason.code}</p><p className="mt-1 text-sm">{reason.message}</p></div>
            <p className="text-xs leading-5 text-muted-foreground"><span className="text-foreground">Fix:</span> {reason.fix}</p>
            <p className="font-mono text-xs tabular-nums text-muted-foreground sm:text-right">{reason.count} · {Math.round((reason.count / total) * 100)}%</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ActivityPanel({ events, onRefresh }: { events: PayEvent[]; onRefresh: () => void }) {
  return (
    <div className="figure ticks">
      <PanelHeader index="04" label="Observability" title="Payment activity" action={<Button type="button" variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh</Button>} />
      {!events.length ? (
        <div className="m-5 border border-dashed border-border p-8 text-center sm:m-6"><Activity className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" /><p className="mt-3 text-sm text-muted-foreground">No requests yet. Send a 402 test request to create the first trace.</p></div>
      ) : (
        <div className="overflow-x-auto px-5 pb-2 sm:px-6">
          <table className="w-full min-w-[820px] text-left">
            <thead><tr className="border-b border-border font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground"><th className="py-3 font-medium">Status</th><th className="py-3 font-medium">Endpoint</th><th className="py-3 font-medium">Stage</th><th className="py-3 font-medium">Amount</th><th className="py-3 font-medium">Receipt</th><th className="py-3 text-right font-medium">Time</th></tr></thead>
            <tbody>
              {events.map((event) => {
                const network = payNetwork(event.network)
                return (
                  <tr key={event.id} className="border-b border-border align-top last:border-0">
                    <td className="py-4"><StatusBadge status={event.status} />{event.status === 'failed' ? <div className="mt-2 max-w-xs text-xs leading-5"><p className="font-mono text-destructive">{event.errorCode}</p>{event.errorMessage ? <p className="text-muted-foreground">{event.errorMessage}</p> : null}{event.errorFix ? <p className="mt-1 text-foreground">Fix: {event.errorFix}</p> : null}</div> : null}</td>
                    <td className="py-4"><p className="text-sm font-medium">{event.endpointName}</p><p className="mt-0.5 font-mono text-[0.62rem] text-muted-foreground">/{event.endpointSlug} · <span className={network.textClass}>{network.label}</span></p></td>
                    <td className="py-4 font-mono text-xs capitalize text-muted-foreground">{event.type}</td>
                    <td className="py-4 font-mono-tnum text-xs">{event.amount ? `${event.amount.replace(/^\$/, '')} USDC` : '—'}</td>
                    <td className="py-4">{event.status === 'settled' && event.transaction ? <a href={explorerTx(network.id, event.transaction)} target="_blank" rel="noreferrer" title={event.transaction} className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 font-mono text-xs text-brand transition-colors duration-150 hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">View receipt <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a> : <span className="font-mono text-xs text-muted-foreground">—</span>}</td>
                    <td className="py-4 text-right font-mono text-[0.68rem] text-muted-foreground">{formatTime(event.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: PayEvent['status'] }) { const successful = status === 'settled' || status === 'verified'; const failed = status === 'failed'; const Icon = successful ? CheckCircle2 : failed ? XCircle : status === 'payment_required' ? CircleDollarSign : Activity; return <span className={cn('inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[0.62rem]', successful ? 'border-success/40 bg-success/10 text-success' : failed ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-brand/40 bg-brand/10 text-brand')}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{status.replace(/_/g, ' ')}</span> }
function StudioSkeleton() { return <div className="mt-14 space-y-6 lg:mt-20"><div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="bg-card p-5"><Skeleton className="h-3 w-20" /><Skeleton className="mt-4 h-8 w-16" /></div>)}</div><div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]"><Skeleton className="h-[42rem] rounded-lg" /><Skeleton className="h-[42rem] rounded-lg" /></div></div> }
function formatTime(value: string) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) }
function apiOrigin(resourceUrl: string) { return resourceUrl.replace(/\/pay\/(live\/)?resource\/.*$/, '') || 'https://your-api.example/api' }
function messageOf(error: unknown, fallback: string) {
  if (error instanceof PayApiError && error.fix) return `${error.message} ${error.fix}`
  return error instanceof Error ? error.message : fallback
}
