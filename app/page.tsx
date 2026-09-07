'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Bot, Braces, Check, ChevronRight, CircleDollarSign,
  DatabaseZap, EyeOff, FileCode2, Fingerprint, Globe2, Layers3,
  MessageSquareText, Play, Sparkles, TerminalSquare, TestTube2, WandSparkles, Zap,
} from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import PlaygroundSubscription from '@/components/playground-subscription'
import { LoginModal } from '@/components/login-modal'
import { NovaOrbitArt, NovaOrbitBackdrop, PaymentConstellation } from '@/components/landing/nova-art'
import { WorkspaceOrbitRail } from '@/components/landing/workspace-orbit-rail'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const STELLAR_DOCS = {
  mpp: 'https://developers.stellar.org/docs/build/agentic-payments/mpp',
  x402: 'https://developers.stellar.org/docs/build/agentic-payments/x402/built-on-stellar',
  ingest: 'https://developers.stellar.org/docs/build/apps/ingest-sdk',
  privacy: 'https://developers.stellar.org/docs/build/apps/privacy',
  zk: 'https://developers.stellar.org/docs/build/apps/zk',
}

const infrastructure = [
  { index: '01', icon: CircleDollarSign, title: 'x402 facilitator', label: 'Agentic payments', copy: 'Create paid API routes, accept Freighter authorization, settle Stellar testnet USDC, and inspect the receipt.', href: '/pay', status: 'Live' },
  { index: '02', icon: Zap, title: 'MPP on Stellar', label: 'Machine payments', copy: 'Prototype per-request charges and high-frequency sessions with Soroban SAC transfers and payment channels.', href: STELLAR_DOCS.mpp, status: 'Building' },
  { index: '03', icon: DatabaseZap, title: 'Ingest pipelines', label: 'Ledger data', copy: 'Create lightweight, event-driven data services from Stellar ledger metadata without leaving the project.', href: STELLAR_DOCS.ingest, status: 'Planned' },
  { index: '04', icon: EyeOff, title: 'Privacy primitives', label: 'Private applications', copy: 'Start with privacy-pool and confidential-token patterns designed for programmable compliance.', href: STELLAR_DOCS.privacy, status: 'Planned' },
  { index: '05', icon: Fingerprint, title: 'ZK workspace', label: 'Proof-ready tooling', copy: 'Build around BN254 and Poseidon primitives, verifier contracts, and higher-level proof systems.', href: STELLAR_DOCS.zk, status: 'Planned' },
]

/* Hero entrance storyboard (absolute): 60ms eyebrow; 120ms headline; 190ms copy;
 * 240ms actions; 280ms product window; 330ms proof. Total: 430ms. */
const HERO_TIMING = { eyebrow: 0.06, headline: 0.12, copy: 0.19, actions: 0.24, product: 0.28, proof: 0.33 }
const spring = { type: 'spring' as const, stiffness: 310, damping: 29, mass: 0.82 }

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const reduce = useReducedMotion()
  const startBuilding = () => isAuthenticated ? router.push('/projects') : setLoginOpen(true)
  const enter = (delay: number, distance = 12) => ({
    initial: reduce ? false as const : { opacity: 0, y: distance, scale: 0.985 },
    animate: reduce ? undefined : { opacity: 1, y: 0, scale: 1 },
    transition: { ...spring, delay },
  })

  return (
    <main className="nova-landing min-h-screen overflow-hidden bg-background text-foreground">
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      <section className="relative pb-10 pt-4 sm:pt-8" id="product">
        <div className="nova-grid pointer-events-none absolute inset-x-0 -top-24 h-[48rem]" aria-hidden="true" />
        <div className="nova-aurora pointer-events-none absolute -right-56 top-0 h-[36rem] w-[36rem] rounded-full" aria-hidden="true" />
        <div className="nova-wash pointer-events-none absolute -left-48 top-64 h-80 w-80 rounded-full" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-16 pt-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-10 lg:pb-24 lg:pt-20">
          <div className="relative z-10 max-w-2xl">
            <motion.div {...enter(HERO_TIMING.eyebrow)}>
              <Link href="#stellar-stack" className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/15 bg-card/85 px-4 font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-foreground shadow-xs backdrop-blur-md transition-[border-color,background-color] duration-150 hover:border-brand/50 hover:bg-card">
                <span className="whitespace-nowrap">Built natively for</span>
                <span className="h-4 w-px bg-foreground/15" aria-hidden="true" />
                <Image src="/stellar-logo-black.svg" alt="Stellar" width={106} height={26} priority className="h-4 w-auto" />
                <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </motion.div>
            <motion.h1 {...enter(HERO_TIMING.headline)} className="mt-7 max-w-[12ch] font-display text-[clamp(3.35rem,7vw,6.6rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
              Idea to orbit,
              <span className="relative mt-2 block w-fit text-brand">
                on Stellar.
                <svg className="absolute -bottom-3 left-0 h-4 w-full overflow-visible text-brand/45" viewBox="0 0 300 18" fill="none" aria-hidden="true">
                  <motion.path d="M4 12C58 3 128 16 185 8C229 2 263 7 296 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={reduce ? undefined : { pathLength: 1, opacity: 1 }} transition={{ duration: 0.42, delay: 0.38, ease: [0.16, 1, 0.3, 1] }} />
                </svg>
              </span>
            </motion.h1>
            <motion.p {...enter(HERO_TIMING.copy)} className="mt-8 max-w-[36rem] text-lg leading-8 text-muted-foreground sm:text-xl">
              Describe the product. WebSoroban creates the interface, Soroban contracts, data layer, and payment rails—then opens every file in a real web IDE.
            </motion.p>
            <motion.div {...enter(HERO_TIMING.actions)} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="nova-button h-12 gap-2 rounded-full px-6 shadow-md" onClick={startBuilding}>
                <WandSparkles className="h-4 w-4" aria-hidden="true" /> {isAuthenticated ? 'Open WebSoroban' : 'Build with WebSoroban'}
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-foreground/20 bg-background/70 px-6 backdrop-blur-sm hover:bg-card">
                <Link href="/ide">Explore the IDE <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </motion.div>
            <motion.ul {...enter(HERO_TIMING.proof, 8)} className="mt-8 flex max-w-xl flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {['No local setup', 'Compile-verified', 'You own the code'].map((item) => (
                <li key={item} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-brand/10"><Check className="h-3 w-3 text-brand" aria-hidden="true" /></span>{item}</li>
              ))}
            </motion.ul>
          </div>

          <motion.div {...enter(HERO_TIMING.product, 16)} className="relative isolate mx-auto w-full max-w-3xl lg:mx-0">
            <NovaOrbitArt className="pointer-events-none absolute -inset-x-16 -inset-y-24 -z-10 hidden xl:block" />
            <NovaOrbitBackdrop className="pointer-events-none absolute left-1/2 top-[-5rem] -z-10 w-[calc(100%+4rem)] -translate-x-1/2 sm:top-[-6rem] sm:w-[calc(100%+6rem)] xl:hidden" />
            <div className="nova-float-chip absolute -left-3 top-24 z-20 hidden items-center gap-2 rounded-full border border-foreground/10 bg-card/90 px-3 py-2 font-mono text-[0.68rem] shadow-md backdrop-blur-md sm:flex lg:-left-8"><span className="h-2 w-2 rounded-full bg-success" /> contract compiled</div>
            <div className="nova-float-chip-delayed absolute -right-3 bottom-16 z-20 hidden items-center gap-2 rounded-full bg-foreground px-3 py-2 font-mono text-[0.68rem] text-background shadow-lg sm:flex lg:-right-7"><Zap className="h-3.5 w-3.5 text-brand" /> 0.01 USDC settled</div>
            <NovaBuilderPreview />
          </motion.div>
        </div>

        <motion.div {...enter(0.38, 8)} className="relative z-10 mx-auto max-w-7xl px-6">
          <WorkspaceOrbitRail />
        </motion.div>
      </section>

      <section className="relative border-b border-border/60" id="platform">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <Reveal className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div><p className="eyebrow text-brand">From sentence to software</p><h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.02] sm:text-6xl">Build visually. Drop into the code at any moment.</h2></div>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground lg:justify-self-end">The ease of a product builder with the transparency of a full IDE. WebSoroban plans in small, reviewable changes, runs the project, and keeps you in control.</p>
          </Reveal>
          <Reveal className="mt-14" delay={0.04}><BuildWorkspace /></Reveal>
        </div>
      </section>

      <section className="py-8 sm:py-12" id="payments">
        <div className="mx-auto max-w-7xl px-6">
          <div className="nova-dark-island relative overflow-hidden rounded-3xl bg-foreground px-5 py-8 text-background shadow-xl sm:px-9 sm:py-12 lg:px-14 lg:py-16">
            <div className="nova-dark-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            <Reveal className="relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div><p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.2em] text-brand">Agentic payments</p><h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.02] sm:text-6xl">Give software a native way to pay.</h2><p className="mt-6 max-w-lg text-base leading-7 text-background/65">Design, generate, and test paid endpoints where agents and services settle on Stellar. The payment layer belongs in the product workflow—not in a second dashboard.</p><Button asChild className="mt-7 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"><Link href="/pay">Open WebSoroban Pay <ArrowRight className="h-4 w-4" /></Link></Button></div>
              <PaymentConstellation className="mx-auto w-full max-w-2xl" />
            </Reveal>
            <Reveal className="relative mt-12 grid gap-4 lg:grid-cols-2" delay={0.06}>
              <PaymentRow number="01" title="x402 facilitator" copy="Protect an endpoint, verify its payment, and settle Stellar USDC from one guided flow." tag="HTTP 402" href={STELLAR_DOCS.x402} />
              <PaymentRow number="02" title="MPP charge + session" copy="Create single charges or high-frequency agent sessions using Soroban assets and channels." tag="@stellar/mpp" href={STELLAR_DOCS.mpp} />
            </Reveal>
            <Reveal className="relative mt-7 flex flex-col gap-5 rounded-2xl border border-background/15 bg-background/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between" delay={0.08}>
              <p className="max-w-lg font-display text-xl">From payment policy to a locally verified request.</p>
              <ol className="flex flex-wrap gap-x-6 gap-y-3">{['Define', 'Generate', 'Verify'].map((title, index) => <li key={title} className="flex items-center gap-2 font-mono text-xs text-background/60"><span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-[0.62rem] text-brand-foreground">{index + 1}</span>{title}</li>)}</ol>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative border-b border-border/60" id="stellar-local">
        <div className="nova-wash pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-full opacity-70" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:py-32">
          <Reveal>
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-brand"><TerminalSquare className="h-4 w-4" aria-hidden="true" /> Now building</div>
            <h2 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-[1.02] sm:text-6xl">A local Stellar that keeps up with you.</h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">WebSoroban Local is our Surfpool-inspired development network: a fast, drop-in environment built for repeatable Stellar application testing.</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{['Snapshots + instant resets', 'Funded test fixtures', 'Readable transaction traces', 'WebSoroban and terminal workflows'].map((item) => <li key={item} className="flex items-center gap-3 text-sm"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-foreground text-background"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>{item}</li>)}</ul>
          </Reveal>
          <Reveal delay={0.06}><LocalnetTerminal /></Reveal>
        </div>
      </section>

      <section className="border-b border-border/60" id="stellar-stack">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <Reveal className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <div><p className="eyebrow text-brand">The Stellar-native layer</p><h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.02] sm:text-6xl">The edges of the network, inside one workspace.</h2></div>
            <p className="max-w-xl text-base leading-7 text-muted-foreground lg:justify-self-end">Explore the infrastructure WebSoroban is bringing into the builder. “Live” is ready to use today; “Planned” describes product direction.</p>
          </Reveal>
          <div className="mt-14 rounded-3xl border border-foreground/15 bg-card/70 p-2 shadow-sm backdrop-blur-sm sm:p-3">
            {infrastructure.map((item) => { const Icon = item.icon; const external = item.href.startsWith('http'); return <Reveal key={item.title}><a href={item.href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="group grid gap-5 rounded-2xl px-4 py-6 transition-[background-color,transform] duration-150 hover:bg-background hover:shadow-sm sm:px-5 md:grid-cols-[3rem_1fr_1.35fr_auto] md:items-center"><span className="font-mono text-xs text-muted-foreground">{item.index}</span><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand transition-transform duration-200 group-hover:-rotate-3"><Icon className="h-4 w-4" aria-hidden="true" /></span><div><h3 className="font-display text-xl font-medium">{item.title}</h3><p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p></div></div><p className="max-w-xl text-sm leading-6 text-muted-foreground">{item.copy}</p><div className="flex items-center justify-between gap-5 md:justify-end"><span className={cn('rounded-full px-3 py-1.5 font-mono text-[0.65rem]', item.status === 'Live' ? 'bg-success/10 text-success' : item.status === 'Building' ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground')}>{item.status}</span><ArrowUpRight className="h-5 w-5 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></div></a></Reveal>})}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <Reveal>
          <div className="nova-cta relative overflow-hidden rounded-3xl bg-brand px-6 py-14 text-brand-foreground shadow-xl sm:px-10 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:px-14 lg:py-16">
            <div className="nova-cta-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" /><div className="nova-cta-orbit pointer-events-none absolute -right-28 -top-40 h-96 w-96 rounded-full border border-brand-foreground/25" aria-hidden="true" />
            <div className="relative"><p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.2em] text-brand-foreground/70">WebSoroban / public beta</p><h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.02] sm:text-6xl">Bring the idea. Leave with a Stellar product.</h2><p className="mt-5 max-w-xl text-base leading-7 text-brand-foreground/80">Generate the app, inspect the code, run the contracts, and deploy—without giving up control of the engineering workflow.</p></div>
            <Button size="lg" variant="secondary" className="relative mt-8 h-12 rounded-full bg-foreground px-6 text-background shadow-md hover:bg-foreground/90 lg:mt-0" onClick={startBuilding}>{isAuthenticated ? 'Open WebSoroban' : 'Start building'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
          </div>
        </Reveal>
      </section>

      <PlaygroundSubscription />
      <PlaygroundFooter />
    </main>
  )
}

function NovaBuilderPreview() {
  const [mode, setMode] = useState<'preview' | 'code'>('preview')
  const reduce = useReducedMotion()
  return (
    <div className="nova-product-window overflow-hidden rounded-3xl border border-foreground/15 bg-card/90 shadow-xl backdrop-blur-xl">
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border/70 px-4 sm:px-5"><div className="flex items-center gap-2.5"><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-brand-foreground"><Sparkles className="h-3.5 w-3.5" /></span><div><p className="font-display text-sm font-semibold">payments-app</p><p className="hidden font-mono text-[0.58rem] text-muted-foreground sm:block">WebSoroban workspace · live</p></div></div><div className="flex items-center gap-1 rounded-xl bg-muted p-1" role="group" aria-label="Preview mode">{(['preview', 'code'] as const).map((value) => <button key={value} type="button" onClick={() => setMode(value)} className={cn('min-h-9 rounded-lg px-3 font-mono text-[0.68rem] capitalize transition-[background-color,color,box-shadow] duration-150', mode === value ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')} aria-pressed={mode === value}>{value}</button>)}</div></div>
      <div className="grid min-h-[25rem] md:grid-cols-[9rem_1fr]">
        <div className="hidden border-r border-border/70 bg-muted/45 p-3 md:block"><p className="px-2 pt-2 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">Project</p><div className="mt-4 space-y-1 font-mono text-[0.68rem]">{[['app', Layers3], ['api/pay', Zap], ['contracts', Braces], ['schema.ts', FileCode2]].map(([label, RawIcon], index) => { const Icon = RawIcon as typeof Layers3; return <div key={label as string} className={cn('flex h-9 items-center gap-2 rounded-lg px-2 transition-colors duration-150', index === 1 && 'bg-card text-foreground shadow-xs')}><Icon className={cn('h-3.5 w-3.5', index === 1 ? 'text-brand' : 'text-muted-foreground')} aria-hidden="true" />{label as string}</div> })}</div><div className="mt-7 rounded-xl border border-border/70 bg-card/70 p-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" /><span className="font-mono text-[0.6rem]">Preview live</span></div><p className="mt-2 text-[0.62rem] leading-4 text-muted-foreground">Stellar testnet synced</p></div></div>
        <div className="relative min-w-0 bg-background/55">
          <AnimatePresence mode="wait" initial={false}>{mode === 'preview' ? <motion.div key="preview" initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -3 }} transition={{ duration: reduce ? 0 : 0.14 }} className="p-4 sm:p-6"><div className="mx-auto max-w-md rounded-2xl border border-border/75 bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">AI research endpoint</p><p className="mt-2 font-display text-2xl font-semibold">Generate market brief</p></div><span className="rounded-full bg-foreground px-2.5 py-1.5 font-mono text-[0.62rem] text-background">x402</span></div><div className="mt-8 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.58rem] text-muted-foreground">PRICE / REQUEST</p><p className="mt-1 font-mono text-xl font-medium">0.01 USDC</p></div><button type="button" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground shadow-sm transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-brand/90"><Play className="h-4 w-4" aria-hidden="true" /> Run endpoint</button></div></div><div className="mt-4 rounded-2xl bg-foreground p-4 font-mono text-[0.68rem] text-background shadow-sm"><p><span className="text-brand">websoroban</span> generated 8 files</p><div className="mt-2 space-y-1 text-background/60"><p>✓ payment middleware attached</p><p>✓ contract compiled · 0 warnings</p><p>✓ preview running on Stellar Testnet</p></div></div></motion.div> : <motion.pre key="code" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: reduce ? 0 : 0.12 }} className="absolute inset-0 overflow-auto bg-foreground p-5 font-mono text-xs leading-6 text-background sm:p-7"><code><span className="text-brand">import</span> {'{'} facilitator {'}'} <span className="text-brand">from</span> &apos;@websoroban/x402&apos;{`\n\n`}<span className="text-brand">export const</span> POST = facilitator({'{'}{`\n  `}network: &apos;stellar-testnet&apos;,{`\n  `}asset: &apos;USDC&apos;,{`\n  `}amount: &apos;0.01&apos;,{`\n  `}handler: generateBrief,{`\n`}{'}'})</code></motion.pre>}</AnimatePresence>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-4 py-3 font-mono text-[0.65rem] text-muted-foreground sm:px-5"><span className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="nova-pulse absolute inset-0 rounded-full bg-success/30" /><span className="relative h-2 w-2 rounded-full bg-success" /></span> Changes saved</span><span>main · Stellar testnet</span></div>
    </div>
  )
}

function BuildWorkspace() {
  const reduce = useReducedMotion()
  const steps = [
    { icon: MessageSquareText, title: 'Describe', copy: 'A payment-gated research app with a private results view.', tone: 'bg-card' },
    { icon: Sparkles, title: 'Generate', copy: 'Frontend, API route, Soroban contract, and data model.', tone: 'bg-brand text-brand-foreground lg:mt-12' },
    { icon: TestTube2, title: 'Verify', copy: 'Compile, test, simulate, and inspect each proposed change.', tone: 'bg-foreground text-background lg:mt-4' },
    { icon: Globe2, title: 'Ship', copy: 'Preview instantly, then deploy to testnet or mainnet.', tone: 'bg-card lg:mt-16' },
  ]
  return (
    <div className="nova-workspace relative overflow-hidden rounded-3xl border border-foreground/15 bg-card/70 p-3 shadow-lg backdrop-blur-sm sm:p-5 lg:p-7">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/85 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><MessageSquareText className="h-4 w-4" /></span><p className="truncate text-sm text-muted-foreground"><span className="font-medium text-foreground">You:</span> Build an agent research app that charges per brief…</p></div><span className="flex shrink-0 items-center gap-2 rounded-full bg-foreground px-3 py-2 font-mono text-[0.65rem] text-background"><span className="h-1.5 w-1.5 rounded-full bg-success" /> WebSoroban is planning</span></div>
      <div className="relative mt-5 grid gap-4 lg:grid-cols-[1fr_0.94fr_1.04fr_0.92fr] lg:gap-5 lg:pb-16"><svg className="pointer-events-none absolute left-[7%] top-24 hidden h-32 w-[86%] overflow-visible text-brand/35 lg:block" viewBox="0 0 1000 150" preserveAspectRatio="none" aria-hidden="true"><motion.path d="M0 32 C120 32 135 120 285 112 C435 104 430 22 585 28 C740 35 770 126 1000 120" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="7 8" initial={reduce ? false : { pathLength: 0, opacity: 0 }} whileInView={reduce ? undefined : { pathLength: 1, opacity: 1 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }} /></svg>{steps.map((step, index) => { const Icon = step.icon; const inverted = index === 1 || index === 2; return <motion.div key={step.title} initial={reduce ? false : { opacity: 0, y: 10 }} whileInView={reduce ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ ...spring, delay: 0.06 * index }} className={cn('group relative min-h-52 rounded-2xl border p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1', step.tone, inverted ? 'border-transparent' : 'border-border/75')}><div className="flex items-center justify-between"><span className={cn('grid h-10 w-10 place-items-center rounded-xl', inverted ? 'bg-background/10' : 'bg-brand/10 text-brand')}><Icon className="h-4 w-4" aria-hidden="true" /></span><span className={cn('font-mono text-[0.65rem]', inverted ? 'text-current opacity-55' : 'text-muted-foreground')}>0{index + 1}</span></div><h3 className="mt-9 font-display text-2xl font-medium">{step.title}</h3><p className={cn('mt-3 text-sm leading-6', inverted ? 'text-current opacity-65' : 'text-muted-foreground')}>{step.copy}</p></motion.div>})}</div>
      <div className="flex flex-col gap-4 rounded-2xl bg-foreground px-5 py-4 text-background sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Bot className="h-5 w-5 text-brand" aria-hidden="true" /><p className="font-mono text-xs sm:text-sm">WebSoroban works in diffs. You choose what reaches the codebase.</p></div><div className="flex gap-1 rounded-xl bg-background/10 p-1">{['Agent', 'Plan', 'Debug'].map((mode, index) => <span key={mode} className={cn('rounded-lg px-3 py-2 font-mono text-[0.62rem]', index === 0 ? 'bg-background text-foreground' : 'text-background/55')}>{mode}</span>)}</div></div>
    </div>
  )
}

function PaymentRow({ number, title, copy, tag, href }: { number: string; title: string; copy: string; tag: string; href: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="group flex min-h-56 flex-col rounded-2xl border border-background/15 bg-background/[0.045] p-5 transition-[background-color,transform,border-color] duration-200 hover:-translate-y-1 hover:border-brand/35 hover:bg-background/[0.07] sm:p-6"><div className="flex items-center justify-between"><span className="font-mono text-xs text-brand">{number}</span><span className="rounded-full border border-background/15 px-2.5 py-1.5 font-mono text-[0.62rem] text-background/65">{tag}</span></div><h3 className="mt-8 font-display text-2xl font-medium">{title}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-background/60">{copy}</p><div className="mt-auto flex items-center justify-between pt-6 font-mono text-[0.65rem] text-background/45"><span>Open Stellar docs</span><span className="grid h-9 w-9 place-items-center rounded-full bg-background/10 text-background transition-[background-color,transform] duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-brand"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span></div></a>
}

function LocalnetTerminal() {
  return <div className="nova-terminal-shell relative"><div className="absolute -inset-3 -z-10 rotate-2 rounded-3xl border border-brand/20 bg-brand/10" aria-hidden="true" /><div className="overflow-hidden rounded-3xl border border-foreground/15 bg-foreground text-background shadow-xl"><div className="flex h-14 items-center justify-between border-b border-background/15 px-5"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-background/20" /><span className="h-2.5 w-2.5 rounded-full bg-background/20" /><span className="h-2.5 w-2.5 rounded-full bg-brand" /></div><span className="font-mono text-[0.65rem] text-background/45">websoroban-local — zsh</span></div><div className="min-h-80 p-5 font-mono text-sm leading-7 sm:p-7"><p><span className="text-brand">$</span> websoroban local</p><div className="mt-5 space-y-1 text-background/55"><p>booting Stellar development network…</p><p>rpc&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;http://127.0.0.1:8000</p><p>network&nbsp;&nbsp;&nbsp;&nbsp;local / standalone</p><p>accounts&nbsp;&nbsp;&nbsp;3 funded</p><p>contracts&nbsp;&nbsp;4 restored</p></div><p className="mt-5 text-background"><span className="text-success">✓</span> ready in 1.8s</p><p className="mt-5"><span className="text-brand">$</span> websoroban test --watch</p><p className="mt-2 text-background/55">4 passed · watching src/**/*.rs</p></div><div className="grid grid-cols-3 gap-px border-t border-background/15 bg-background/15 text-center font-mono text-[0.65rem] text-background/45"><span className="bg-foreground py-4">ledger 128</span><span className="bg-foreground py-4">3 accounts</span><span className="bg-foreground py-4">0 errors</span></div></div></div>
}
