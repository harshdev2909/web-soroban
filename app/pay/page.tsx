'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity, AlertTriangle, ArrowRight, Check, CheckCircle2, CircleDollarSign, Clipboard, Code2,
  ExternalLink, Gauge, KeyRound, Loader2, Play, Plus, RefreshCw, RotateCw, Route, ShieldCheck,
  Sparkles, TerminalSquare, Wallet2, XCircle, Zap,
} from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { LoginModal } from '@/components/login-modal'
import { PaymentConstellation } from '@/components/landing/nova-art'
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

const emptyForm = {
  name: 'Research brief', slug: 'research-brief', price: '0.01', payTo: '',
  responseMessage: 'Your paid research brief is ready.', network: 'stellar:testnet' as PayNetwork,
}
type EndpointForm = typeof emptyForm

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

  const snippet = created ? `import { createWebSorobanPay } from '@websoroban/pay'\n\nconst pay = createWebSorobanPay({\n  apiUrl: '${apiOrigin(created.endpoint.resourceUrl)}',\n  apiKey: process.env.WEBSOROBAN_PAY_KEY, // ${created.endpoint.network}\n  endpointId: '${created.endpoint.id}',\n  payTo: '${created.endpoint.payTo}',\n})\n\napp.use(pay.protect('GET /brief', '${created.endpoint.price}'))` : ''

  return (
    <main className="nova-landing min-h-screen overflow-hidden bg-background text-foreground">
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} returnTo="/pay" />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      <section className="relative border-b border-border/60">
        <div className="nova-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="nova-wash pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-28 lg:pt-24">
          <Reveal>
            <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[0.98] tracking-tight sm:text-7xl">Price an endpoint. Watch it settle.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Create an HTTP 402 paywall that settles USDC on Stellar, then inspect every challenge, verification, and settlement from one WebSoroban workflow.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 rounded-full px-6" onClick={() => isAuthenticated ? document.getElementById('pay-studio')?.scrollIntoView({ behavior: 'smooth' }) : setLoginOpen(true)}>{isAuthenticated ? 'Open payment studio' : 'Start on testnet'} <ArrowRight className="h-4 w-4" /></Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6"><Link href="/docs/payments">Read the guide <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-border/70 pt-6">{['Official x402 v2', 'Testnet and mainnet', 'USDC exact scheme'].map((item, index) => <div key={item}><span className="font-mono text-[0.62rem] text-brand">0{index + 1}</span><p className="mt-1 text-xs text-muted-foreground sm:text-sm">{item}</p></div>)}</div>
          </Reveal>
          <Reveal delay={0.07}><PaymentConstellation className="mx-auto w-full max-w-2xl" /></Reveal>
        </div>
      </section>

      <section className="border-b border-border/60" id="pay-studio">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow text-brand">WebSoroban Pay</p><h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Your payment studio.</h2><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">One asset, one reliable path from 402 challenge to Stellar settlement, with the failure reason and fix for anything that does not settle.</p></div>
            {overview ? <div className="flex flex-wrap gap-2 self-start sm:self-auto">{(overview.networks || []).filter((item) => item.enabled).map((item) => <span key={item.network} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 font-mono text-xs text-muted-foreground"><ShieldCheck className={cn('h-4 w-4', payNetwork(item.network).textClass)} /> {item.facilitator?.name} · {payNetwork(item.network).label}</span>)}</div> : null}
          </Reveal>

          {authLoading || loading ? <StudioSkeleton /> : !isAuthenticated ? <SignedOut onSignIn={() => setLoginOpen(true)} /> : (
            <div className="mt-12 space-y-6">
              {error && <div role="alert" className="flex items-start justify-between gap-4 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"><span className="flex gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</span><button type="button" onClick={() => setError('')} className="rounded-lg px-2 py-1 hover:bg-destructive/10">Dismiss</button></div>}
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28"><Reveal className="grid gap-5 md:grid-cols-3">{[
        { icon: Route, number: '01', title: 'Define', copy: 'Choose the network, route, price, response, and a payout address that holds a USDC trustline.' },
        { icon: ShieldCheck, number: '02', title: 'Verify', copy: 'The official x402 server scheme validates the signed Stellar payment payload.' },
        { icon: CheckCircle2, number: '03', title: 'Settle', copy: 'The facilitator submits the authorized USDC transfer and returns the proof.' },
      ].map(({ icon: Icon, number, title, copy }) => <div key={title} className="rounded-3xl border border-foreground/15 bg-card p-6 shadow-sm"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand"><Icon className="h-5 w-5" /></span><span className="font-mono text-xs text-muted-foreground">{number}</span></div><h3 className="mt-8 font-display text-2xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p></div>)}</Reveal></section>
      <PlaygroundFooter />
    </main>
  )
}

function SignedOut({ onSignIn }: { onSignIn: () => void }) {
  return <Reveal className="mt-12"><div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-14 text-background shadow-xl sm:px-10 lg:px-14"><div className="nova-dark-grid pointer-events-none absolute inset-0" /><div className="relative max-w-2xl"><Sparkles className="h-8 w-8 text-brand" /><h3 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">Sign in to create your first paid endpoint.</h3><p className="mt-4 max-w-xl leading-7 text-background/60">WebSoroban provisions the testnet workspace and keeps facilitator credentials on the server. You receive a scoped endpoint key for your app.</p><Button size="lg" className="mt-8 rounded-full" onClick={onSignIn}>Sign in and build <ArrowRight className="h-4 w-4" /></Button></div></div></Reveal>
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

function EndpointFormCard({ form, setForm, creating, onSubmit, overview }: { form: EndpointForm; setForm: (form: EndpointForm) => void; creating: boolean; onSubmit: (event: FormEvent) => void; overview: PayOverview | null }) {
  const payout = usePayoutTrustline(form.payTo, form.network)
  const networks = overview?.networks?.length ? overview.networks : [{ network: 'stellar:testnet' as PayNetwork, label: 'Stellar Testnet', enabled: true, facilitator: null }]
  const mainnet = form.network === 'stellar:pubnet'
  const payoutBlocked = Boolean(payout.report && !payout.report.ready && payout.report.status !== 'unknown')
  return <form onSubmit={onSubmit} className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">New endpoint</p><h3 className="mt-2 font-display text-2xl font-semibold">Define the payment rule</h3></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand"><Plus className="h-5 w-5" /></span></div><div className="mt-7 grid gap-5">
    <fieldset>
      <legend className="text-sm font-medium">Network</legend>
      <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-2">
        {networks.map((item) => {
          const config = payNetwork(item.network)
          const selected = form.network === item.network
          return <button key={item.network} type="button" role="radio" aria-checked={selected} disabled={!item.enabled} onClick={() => setForm({ ...form, network: item.network })} className={cn('min-h-11 rounded-xl border px-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', selected ? 'border-brand bg-brand/10' : 'border-border hover:bg-muted')}>
            <span className="flex items-center gap-2 font-medium"><span className={cn('h-2 w-2 rounded-full', config.dotClass)} />{config.label}</span>
            {!item.enabled ? <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">Not enabled on this server</span> : null}
          </button>
        })}
      </div>
      {mainnet ? <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-warning"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Mainnet endpoints settle real USDC and get a wsp_live_ key.</p> : null}
    </fieldset>
    <Field label="Endpoint name" htmlFor="pay-name" hint="Shown in the 402 challenge."><Input id="pay-name" required minLength={3} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-xl" /></Field>
    <div className="grid gap-5 sm:grid-cols-[1fr_9rem]"><Field label="URL slug" htmlFor="pay-slug" hint="Letters, numbers, hyphens."><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">/</span><Input id="pay-slug" required minLength={3} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-11 rounded-xl pl-6 font-mono" /></div></Field><Field label="Price" htmlFor="pay-price" hint="USDC"><Input id="pay-price" required inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-11 rounded-xl font-mono" /></Field></div>
    <Field label="Payout address" htmlFor="pay-wallet" hint={mainnet ? 'A Stellar address you control on mainnet, with a USDC trustline.' : 'A Stellar address with a USDC trustline. Your testnet wallet is prefilled when available.'}>
      <Input id="pay-wallet" required value={form.payTo} onChange={(e) => setForm({ ...form, payTo: e.target.value.trim() })} placeholder="G…" aria-describedby="pay-wallet-status" className="h-11 rounded-xl font-mono text-xs" />
      <PayoutStatus id="pay-wallet-status" checking={payout.checking} report={payout.report} />
    </Field>
    <Field label="Paid response" htmlFor="pay-response" hint="Returned only after successful settlement."><Textarea id="pay-response" required value={form.responseMessage} onChange={(e) => setForm({ ...form, responseMessage: e.target.value })} className="min-h-24 resize-none rounded-xl" /></Field>
  </div><Button type="submit" size="lg" disabled={creating || payoutBlocked} className="mt-7 h-12 w-full rounded-full">{creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating endpoint…</> : <><Zap className="h-4 w-4" /> Create paid endpoint</>}</Button></form>
}

function PayoutStatus({ id, checking, report }: { id: string; checking: boolean; report: TrustlineReport | null }) {
  if (checking) return <p id={id} className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking USDC trustline…</p>
  if (!report) return null
  if (report.ready) return <p id={id} className="mt-2 flex items-center gap-1.5 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Can receive USDC</p>
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
  return <div className="grid gap-px overflow-hidden rounded-3xl border border-foreground/15 bg-border sm:grid-cols-2 lg:grid-cols-5">{metrics.map(({ label, value, icon: Icon, detail }) => <div key={label} className="bg-card p-5 sm:p-6"><div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground"><Icon className="h-4 w-4 text-brand" />{label}</div><p className="mt-4 font-display text-3xl font-semibold">{value}</p>{detail ? <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">{detail}</p> : null}</div>)}</div>
}

function EndpointPanel({ overview, busyEndpoint, challenge, onToggle, onTest, onRotate }: { overview: PayOverview | null; busyEndpoint: string | null; challenge: { endpointId: string; header: boolean } | null; onToggle: (endpoint: PayEndpoint, active: boolean) => void; onTest: (endpoint: PayEndpoint) => void; onRotate: (endpoint: PayEndpoint) => void }) {
  const endpoints = overview?.endpoints || []
  return <div className="min-h-full rounded-3xl bg-foreground p-5 text-background shadow-xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">Live routes</p><h3 className="mt-2 font-display text-2xl font-semibold">Payment endpoints</h3></div></div>
    {!endpoints.length ? <div className="mt-8 grid min-h-72 place-items-center rounded-2xl border border-dashed border-background/20 bg-background/[0.035] p-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-background/10 text-brand"><TerminalSquare className="h-5 w-5" /></span><p className="mt-4 font-display text-xl">No payment routes yet</p><p className="mt-2 max-w-xs text-sm leading-6 text-background/50">Define the first route. Its test URL and scoped developer key appear here.</p></div></div> : <div className="mt-7 space-y-3">{endpoints.map((endpoint) => {
      const network = payNetwork(endpoint.network)
      const busy = busyEndpoint === endpoint.id
      return <div key={endpoint.id} className="rounded-2xl border border-background/15 bg-background/[0.045] p-4 sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-display text-lg font-semibold">{endpoint.name}</p><span className="rounded-full bg-brand/15 px-2.5 py-1 font-mono text-[0.6rem] text-brand">{endpoint.price.replace(/^\$/, '')} USDC</span><span className={cn('rounded-full border px-2.5 py-1 font-mono text-[0.6rem] uppercase', network.badgeClass)}>{network.label}</span></div><p className="mt-2 truncate font-mono text-[0.65rem] text-background/45">GET /{endpoint.slug} · {endpoint.apiKeyPrefix}</p></div><div className="flex items-center gap-2"><span className="text-xs text-background/45">{endpoint.active ? 'Active' : 'Paused'}</span><Switch checked={endpoint.active} disabled={busy} onCheckedChange={(active) => onToggle(endpoint, active)} aria-label={`${endpoint.active ? 'Pause' : 'Activate'} ${endpoint.name}`} className="data-[state=checked]:bg-brand data-[state=unchecked]:bg-background/20" /></div></div><div className="mt-4 flex flex-wrap gap-2">
        {endpoint.active ? <Button asChild size="sm" className="rounded-xl"><Link href={`/pay/checkout?resource=${encodeURIComponent(endpoint.resourceUrl)}`}><Wallet2 className="h-4 w-4" /> Open checkout</Link></Button> : <Button size="sm" disabled className="rounded-xl"><Wallet2 className="h-4 w-4" /> Open checkout</Button>}
        <Button type="button" size="sm" variant="secondary" disabled={!endpoint.active || busy} onClick={() => onTest(endpoint)} className="rounded-xl bg-background text-foreground hover:bg-background/90">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Inspect 402</Button>
        <RotateKeyButton endpoint={endpoint} disabled={busy} onConfirm={onRotate} />
        <a href={endpoint.resourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-background/15 px-3 text-xs text-background/55 transition-colors hover:bg-background/10 hover:text-background">Raw endpoint <ExternalLink className="h-3.5 w-3.5" /></a>
      </div>{challenge?.endpointId === endpoint.id && <div className="mt-4 rounded-xl border border-success/25 bg-success/10 p-3 text-sm"><p className="flex items-center gap-2 font-medium text-success"><Check className="h-4 w-4" /> HTTP 402 received</p><p className="mt-1.5 text-xs leading-5 text-background/55">{challenge.header ? 'PAYMENT-REQUIRED header is present and ready for an x402 client.' : 'Challenge received, but the PAYMENT-REQUIRED header was not exposed.'}</p></div>}</div>
    })}</div>}
  </div>
}

/** Two-step confirm: rotating invalidates the key every deployed server uses. */
function RotateKeyButton({ endpoint, disabled, onConfirm }: { endpoint: PayEndpoint; disabled: boolean; onConfirm: (endpoint: PayEndpoint) => void }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const timer = window.setTimeout(() => setArmed(false), 4000)
    return () => window.clearTimeout(timer)
  }, [armed])
  return <button type="button" disabled={disabled} onClick={() => { if (armed) { setArmed(false); onConfirm(endpoint) } else setArmed(true) }} className={cn('inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-xs transition-colors disabled:opacity-50', armed ? 'border-warning/50 bg-warning/15 text-warning' : 'border-background/15 text-background/55 hover:bg-background/10 hover:text-background')}><RotateCw className="h-3.5 w-3.5" /> {armed ? 'Click again to rotate' : 'Rotate key'}</button>
}

function CredentialReveal({ created, snippet, copied, onCopy }: { created: CreatedPayEndpoint; snippet: string; copied: string; onCopy: (label: string, value: string) => void }) {
  return <div id="pay-credential" className="grid overflow-hidden rounded-3xl border border-brand/25 bg-brand-muted/45 lg:grid-cols-[0.74fr_1.26fr]"><div className="p-6 sm:p-8"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-brand-foreground"><KeyRound className="h-5 w-5" /></span><p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand">Copy once</p><h3 className="mt-2 font-display text-3xl font-semibold">Your endpoint key</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{created.warning} Put it in your app’s server-side environment, never in browser code.</p><button type="button" onClick={() => onCopy('key', created.apiKey)} className="mt-5 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-foreground/15 bg-card px-4 text-left font-mono text-xs shadow-sm"><span className="truncate">{created.apiKey}</span>{copied === 'key' ? <Check className="h-4 w-4 shrink-0 text-success" /> : <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground" />}</button><dl className="mt-4 grid gap-1 font-mono text-[0.68rem] text-muted-foreground"><div className="flex gap-2"><dt>Endpoint id</dt><dd className="truncate text-foreground">{created.endpoint.id}</dd></div><div className="flex gap-2"><dt>Network</dt><dd className="text-foreground">{created.endpoint.network}</dd></div></dl></div><div className="bg-foreground p-6 text-background sm:p-8"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2 font-mono text-[0.65rem] text-background/55"><Code2 className="h-4 w-4 text-brand" /> EXPRESS / TYPESCRIPT</div><button type="button" onClick={() => onCopy('snippet', snippet)} className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs text-background/55 hover:bg-background/10 hover:text-background">{copied === 'snippet' ? <Check className="h-4 w-4 text-success" /> : <Clipboard className="h-4 w-4" />} {copied === 'snippet' ? 'Copied' : 'Copy'}</button></div><pre className="mt-5 overflow-x-auto text-xs leading-6 text-background/70"><code>{snippet}</code></pre></div></div>
}

function FailureReasons({ reasons }: { reasons: PayFailureReason[] }) {
  if (!reasons.length) return null
  const total = reasons.reduce((sum, reason) => sum + reason.count, 0)
  return <div className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7"><p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">Last 7 days</p><h3 className="mt-2 font-display text-2xl font-semibold">Why payments failed</h3><ul className="mt-6 divide-y divide-border">{reasons.map((reason) => <li key={reason.code} className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,14rem)_1fr_auto] sm:items-start sm:gap-6"><div><p className="font-mono text-xs text-destructive">{reason.code}</p><p className="mt-1 text-sm">{reason.message}</p></div><p className="text-xs leading-5 text-muted-foreground"><span className="text-foreground">Fix:</span> {reason.fix}</p><p className="font-mono text-xs text-muted-foreground sm:text-right">{reason.count} · {Math.round((reason.count / total) * 100)}%</p></li>)}</ul></div>
}

function ActivityPanel({ events, onRefresh }: { events: PayEvent[]; onRefresh: () => void }) {
  return <div className="rounded-3xl border border-foreground/15 bg-card p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand">Observability</p><h3 className="mt-2 font-display text-2xl font-semibold">Payment activity</h3></div><Button type="button" variant="outline" size="sm" onClick={onRefresh} className="rounded-xl"><RefreshCw className="h-4 w-4" /> Refresh</Button></div>{!events.length ? <div className="mt-7 rounded-2xl border border-dashed border-border p-8 text-center"><Activity className="mx-auto h-5 w-5 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">No requests yet. Send a 402 test request to create the first trace.</p></div> : <div className="mt-7 overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="border-b border-border font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground"><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Endpoint</th><th className="pb-3 font-medium">Stage</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Receipt</th><th className="pb-3 text-right font-medium">Time</th></tr></thead><tbody>{events.map((event) => {
    const network = payNetwork(event.network)
    return <tr key={event.id} className="border-b border-border/60 align-top last:border-0"><td className="py-4"><StatusBadge status={event.status} />{event.status === 'failed' ? <div className="mt-2 max-w-xs text-xs leading-5"><p className="font-mono text-destructive">{event.errorCode}</p>{event.errorMessage ? <p className="text-muted-foreground">{event.errorMessage}</p> : null}{event.errorFix ? <p className="mt-1 text-foreground">Fix: {event.errorFix}</p> : null}</div> : null}</td><td className="py-4"><p className="text-sm font-medium">{event.endpointName}</p><p className="mt-0.5 font-mono text-[0.62rem] text-muted-foreground">/{event.endpointSlug} · <span className={network.textClass}>{network.label}</span></p></td><td className="py-4 text-sm capitalize text-muted-foreground">{event.type}</td><td className="py-4 font-mono text-xs">{event.amount ? `${event.amount.replace(/^\$/, '')} USDC` : '—'}</td><td className="py-4">{event.status === 'settled' && event.transaction ? <a href={explorerTx(network.id, event.transaction)} target="_blank" rel="noreferrer" title={event.transaction} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 font-mono text-xs text-brand transition-colors hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">View receipt <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a> : <span className="font-mono text-xs text-muted-foreground">—</span>}</td><td className="py-4 text-right text-xs text-muted-foreground">{formatTime(event.createdAt)}</td></tr>
  })}</tbody></table></div>}</div>
}

function StatusBadge({ status }: { status: PayEvent['status'] }) { const successful = status === 'settled' || status === 'verified'; const failed = status === 'failed'; const Icon = successful ? CheckCircle2 : failed ? XCircle : status === 'payment_required' ? CircleDollarSign : Activity; return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-[0.62rem]', successful ? 'bg-success/10 text-success' : failed ? 'bg-destructive/10 text-destructive' : 'bg-brand/10 text-brand')}><Icon className="h-3.5 w-3.5" />{status.replace(/_/g, ' ')}</span> }
function StudioSkeleton() { return <div className="mt-12 space-y-6"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-3xl" />)}</div><div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]"><Skeleton className="h-[42rem] rounded-3xl" /><Skeleton className="h-[42rem] rounded-3xl" /></div></div> }
function formatTime(value: string) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) }
function apiOrigin(resourceUrl: string) { return resourceUrl.replace(/\/pay\/(live\/)?resource\/.*$/, '') || 'https://your-api.example/api' }
function messageOf(error: unknown, fallback: string) {
  if (error instanceof PayApiError && error.fix) return `${error.message} ${error.fix}`
  return error instanceof Error ? error.message : fallback
}
