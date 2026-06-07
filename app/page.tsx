'use client'

/* ─────────────────────────────────────────────────────────
 * LANDING ENTRANCE STORYBOARD
 *
 * Nav is static and interactive immediately (never held blank).
 *    60ms   eyebrow fades in
 *  140ms   headline lines rise
 *  240ms   subhead rises
 *  320ms   CTAs rise (primary actionable)
 *  400ms   trust row rises
 *  520ms   IDE preview rises + settles
 * Below the fold: sections reveal on scroll (Reveal).
 * ───────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import PlaygroundSubscription from '@/components/playground-subscription'
import { LoginModal } from '@/components/login-modal'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  ArrowRight,
  Wallet,
  Cpu,
  Rocket,
  TerminalSquare,
  KeyRound,
  Gauge,
  Check,
  Copy,
} from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

const steps = [
  { n: '01', title: 'Spin up a project', desc: 'Start from a template or a blank contract in one click.' },
  { n: '02', title: 'Compile to WASM', desc: 'Builds run on managed workers with streamed, readable logs.' },
  { n: '03', title: 'Simulate and test', desc: 'Invoke functions against testnet and inspect return values.' },
  { n: '04', title: 'Deploy in one click', desc: 'Sign with your testnet wallet and get the contract id inline.' },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const reduce = useReducedMotion()

  const startBuilding = () => {
    if (isAuthenticated) router.push('/ide')
    else setLoginOpen(true)
  }

  const motionProps = reduce
    ? {}
    : { variants: container, initial: 'hidden' as const, animate: 'show' as const }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
        {/* hairline grid wash */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-[0.5] [mask-image:linear-gradient(to_bottom,black,transparent)]"
          aria-hidden
        >
          <div className="h-full w-full bg-grid-faint [background-size:64px_64px]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pb-24 md:pt-28">
          <motion.div className="mx-auto flex max-w-3xl flex-col items-center text-center" {...motionProps}>
            <motion.span
              variants={reduce ? undefined : item}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 backdrop-blur"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              <span className="eyebrow">Stellar · Soroban IDE</span>
            </motion.span>

            <motion.h1
              variants={reduce ? undefined : item}
              className="font-display mt-6 text-display-lg font-semibold"
            >
              Write, compile and deploy
              <br />
              <span className="text-brand">Soroban contracts</span> in the browser.
            </motion.h1>

            <motion.p variants={reduce ? undefined : item} className="lead mt-6 max-w-xl text-base md:text-lg">
              A modern web IDE for Stellar smart contracts. Skip the toolchain, write Rust, build WASM,
              and deploy to testnet from a wallet we provision for you.
            </motion.p>

            <motion.div
              variants={reduce ? undefined : item}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
            >
              <motion.div whileTap={reduce ? undefined : { scale: 0.98 }}>
                <Button size="lg" className="gap-2" onClick={startBuilding}>
                  {isAuthenticated ? 'Open the IDE' : 'Start building free'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
              <Button asChild size="lg" variant="outline">
                <Link href="/marketplace">Browse templates</Link>
              </Button>
            </motion.div>

            <motion.ul
              variants={reduce ? undefined : item}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
            >
              {['No install', 'Free testnet wallet', 'First deploy under 90s'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" /> {t}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 24 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="mt-16"
          >
            <IdePreview />
          </motion.div>
        </div>
      </section>

      {/* Trusted stack strip */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-7 sm:flex-row sm:justify-between">
          <p className="eyebrow">Built on the Stellar network</p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {['Stellar', 'Soroban', 'Rust', 'WebAssembly', 'Freighter'].map((name) => (
              <span key={name} className="font-display text-sm font-medium text-muted-foreground/80">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features — asymmetric bento */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Everything in one tab</p>
          <h2 className="font-display mt-3 text-title font-semibold">
            The full loop from author to deploy
          </h2>
          <p className="lead mt-3 max-w-lg">
            Authoring, building, testing and shipping, without a local toolchain and without
            leaving the editor.
          </p>
        </Reveal>

        <div className="mt-10 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-3 md:grid-cols-6">
          {/* Wide: editor */}
          <BentoCard className="md:col-span-4" icon={TerminalSquare} title="Zero setup editor" reduce={reduce}>
            <p className="lead max-w-md text-sm">
              A full Rust and Soroban environment in the browser. No cargo, no Docker, no toolchain.
              Open a file and start writing.
            </p>
            <div className="mt-5 overflow-hidden rounded-lg border border-border bg-background/70">
              <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">lib.rs</span>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-muted-foreground">
                <code>
                  <span className="text-cosmic">pub fn</span> <span className="text-brand">hello</span>(env: Env) {'->'} Symbol {'{'}
                  {'\n'}  symbol_short!(<span className="text-success">"Hello"</span>)
                  {'\n'}{'}'}
                </code>
              </pre>
            </div>
          </BentoCard>

          {/* Tall-ish: wallet */}
          <BentoCard className="md:col-span-2" icon={Wallet} title="Your own testnet wallet" reduce={reduce}>
            <p className="lead text-sm">
              A Stellar testnet keypair is created and funded for you on first login. Deploys are
              signed server side.
            </p>
            <div className="mt-5 rounded-lg border border-border bg-background/70 p-3">
              <p className="eyebrow">Public key</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <code className="truncate font-mono text-xs text-foreground">GBZX…Q4WM</code>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="font-mono-tnum text-xl font-semibold">10,000 <span className="text-xs font-normal text-muted-foreground">XLM</span></span>
                <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                  Funded
                </span>
              </div>
            </div>
          </BentoCard>

          {/* Row 2 */}
          <BentoCard className="md:col-span-2" icon={Cpu} title="Server side WASM builds" reduce={reduce}>
            <p className="lead text-sm">
              Compile to optimized WASM on managed build workers with streamed logs, so your laptop
              stays cool.
            </p>
          </BentoCard>
          <BentoCard className="md:col-span-2" icon={Rocket} title="One click deploy" reduce={reduce}>
            <p className="lead text-sm">
              Push a contract to Stellar testnet and get the contract id back inline, no external
              explorer hop.
            </p>
          </BentoCard>
          <BentoCard className="md:col-span-2" icon={KeyRound} title="Keys stay encrypted" reduce={reduce}>
            <p className="lead text-sm">
              Your secret key is AES 256 GCM encrypted at rest and never shown, logged, or sent to
              the browser.
            </p>
          </BentoCard>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-card/20">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="font-display mt-3 text-title font-semibold">From blank editor to live contract</h2>
            <p className="lead mt-3 max-w-lg">
              Watch the whole workflow happen in the browser, with no installs and no context switches.
            </p>
          </Reveal>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-5">
            <Reveal delay={0.1} className="lg:col-span-3">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="block h-auto w-full"
                  aria-label="WebSoroban workflow demo"
                >
                  <source src="/howitworks.mp4" type="video/mp4" />
                  <source src="/howitworks.mov" type="video/quicktime" />
                </video>
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-success/30 bg-background/80 px-2.5 py-1 font-mono text-[11px] text-success backdrop-blur">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> LIVE
                </div>
              </div>
            </Reveal>

            <ol className="space-y-3 lg:col-span-2">
              {steps.map((s, i) => (
                <Reveal as="li" key={s.n} delay={0.15 + i * 0.06}>
                  <div className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:border-brand/40">
                    <span className="font-mono text-sm font-semibold text-brand">{s.n}</span>
                    <div>
                      <h3 className="font-display text-sm font-semibold">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA panel (intentional, not a flat gradient slab) */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
            <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ background: 'hsl(var(--brand))' }}
              aria-hidden
            />
            <div className="relative grid items-center gap-8 p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
              <div>
                <p className="eyebrow">Ready when you are</p>
                <h2 className="font-display mt-3 text-title font-semibold">
                  Ship your first Soroban contract today
                </h2>
                <p className="lead mt-3 max-w-md">
                  Sign in, get a funded testnet wallet, and deploy in under two minutes.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <motion.div whileTap={reduce ? undefined : { scale: 0.98 }}>
                    <Button size="lg" className="gap-2" onClick={startBuilding}>
                      {isAuthenticated ? 'Open the IDE' : 'Start building free'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/docs">Read the docs</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-auto w-full max-w-xs rounded-xl border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">Deploy</span>
                    <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                      Testnet
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-success">
                    <Check className="h-4 w-4" /> Deployed in 1.2s
                  </div>
                  <code className="mt-2 block truncate rounded bg-muted px-2 py-1 font-mono text-xs">CDLZ…F7QK</code>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <PlaygroundSubscription />
      <PlaygroundFooter />
    </main>
  )
}

function BentoCard({
  className = '',
  icon: Icon,
  title,
  children,
  reduce,
}: {
  className?: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
  reduce: boolean | null
}) {
  return (
    <Reveal className={`${className} h-full`}>
      <motion.div
        whileHover={reduce ? undefined : { y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 hover:border-brand/40"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/12 text-brand transition-colors duration-200 group-hover:bg-brand/20">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="font-display text-base font-semibold">{title}</h3>
        </div>
        <div className="mt-3 flex-1">{children}</div>
      </motion.div>
    </Reveal>
  )
}

/** Static, "live-looking" IDE mock used in the hero. */
function IdePreview() {
  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-destructive/60" />
        <span className="h-3 w-3 rounded-full bg-warning/60" />
        <span className="h-3 w-3 rounded-full bg-success/60" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">websoroban / ide</span>
        <span className="ml-auto rounded border border-success/30 bg-success/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-success">
          testnet
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
        <div className="hidden border-r border-border bg-background/40 p-3 md:block">
          <p className="eyebrow px-1">Explorer</p>
          <ul className="mt-2 space-y-0.5 text-sm">
            {['lib.rs', 'Cargo.toml', '.cargo/config.toml'].map((f, i) => (
              <li
                key={f}
                className={`flex items-center gap-2 rounded px-2 py-1 font-mono text-xs ${
                  i === 0 ? 'bg-brand/10 text-foreground' : 'text-muted-foreground'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-brand' : 'bg-border'}`} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-background/60">
          <div className="flex items-center gap-1 border-b border-border px-3 py-1.5">
            <span className="rounded-t-md border-x border-t border-border bg-card px-3 py-1 font-mono text-xs text-foreground">
              lib.rs
            </span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed">
            <code>
              <span className="text-muted-foreground">{'#![no_std]'}</span>{'\n'}
              <span className="text-cosmic">use</span> soroban_sdk::{'{'}contract, contractimpl, Env, Symbol, symbol_short{'}'};{'\n\n'}
              <span className="text-cosmic">#[contract]</span>{'\n'}
              <span className="text-cosmic">pub struct</span> <span className="text-brand">HelloContract</span>;{'\n\n'}
              <span className="text-cosmic">#[contractimpl]</span>{'\n'}
              <span className="text-cosmic">impl</span> <span className="text-brand">HelloContract</span> {'{'}{'\n'}
              {'  '}<span className="text-cosmic">pub fn</span> <span className="text-success">hello</span>(env: Env, to: Symbol) {'->'} Symbol {'{'}{'\n'}
              {'    '}symbol_short!(<span className="text-warning">"Hello"</span>){'\n'}
              {'  '}{'}'}{'\n'}
              {'}'}
            </code>
          </pre>
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-success">
              <Check className="h-3.5 w-3.5" /> Deployed
            </span>
            <span className="text-muted-foreground">contract</span>
            <code className="rounded bg-muted px-2 py-0.5 font-mono text-foreground">CDLZ…F7QK</code>
            <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" /> GBZX…Q4WM
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
