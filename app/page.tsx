'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Boxes,
  Check,
} from 'lucide-react'

const features = [
  {
    icon: TerminalSquare,
    title: 'Zero-setup editor',
    desc: 'A full Rust + Soroban environment in the browser. No cargo, no Docker, no toolchain — just open a file and write.',
  },
  {
    icon: Cpu,
    title: 'Server-side WASM builds',
    desc: 'Compile to optimized WASM on managed build workers with streamed logs, so your laptop stays cool.',
  },
  {
    icon: Wallet,
    title: 'Your own testnet wallet',
    desc: 'A Stellar testnet keypair is created and funded for you on first login. Deploys are signed server-side.',
  },
  {
    icon: Rocket,
    title: 'One-click deploy',
    desc: 'Push a contract to Stellar testnet and get the contract id back inline — no external explorer hop.',
  },
  {
    icon: KeyRound,
    title: 'Keys stay encrypted',
    desc: 'Your secret key is AES-256-GCM encrypted at rest and never shown, logged, or sent to the browser.',
  },
  {
    icon: Gauge,
    title: 'Live job feedback',
    desc: 'Compile and deploy run as tracked jobs with real-time status over websockets and clear error states.',
  },
]

const steps = [
  { n: '01', title: 'Spin up a project', desc: 'Start from a template or a blank contract in one click.' },
  { n: '02', title: 'Compile to WASM', desc: 'Build on managed workers with streamed, readable logs.' },
  { n: '03', title: 'Simulate & test', desc: 'Invoke functions against testnet and inspect return values.' },
  { n: '04', title: 'Deploy in one click', desc: 'Sign with your testnet wallet and get the contract id inline.' },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const startBuilding = () => {
    if (isAuthenticated) router.push('/ide')
    else setLoginOpen(true)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pb-24 md:pt-24">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
              Stellar · Soroban smart-contract IDE
            </span>
            <h1 className="mt-6 font-display text-display-lg font-semibold">
              Write, compile &amp; deploy
              <br />
              <span className="text-gradient-brand">Soroban contracts</span> in the browser.
            </h1>
            <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
              A modern web IDE for Stellar smart contracts. Skip the toolchain — write Rust, build
              WASM, and ship to testnet from a wallet we provision for you.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button size="lg" className="gap-2" onClick={startBuilding}>
                {isAuthenticated ? 'Open the IDE' : 'Start building free'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/marketplace">Browse templates</Link>
              </Button>
            </div>
            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> No install</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Free testnet wallet</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> First deploy in &lt; 90s</span>
            </p>
          </Reveal>

          {/* Live-looking IDE preview */}
          <Reveal delay={0.15} className="mt-14">
            <IdePreview />
          </Reveal>
        </div>
      </section>

      {/* Social proof slot */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Built on the Stellar network
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 opacity-70">
            {['Stellar', 'Soroban', 'Rust', 'WASM', 'Freighter'].map((name) => (
              <span key={name} className="font-display text-sm font-medium text-muted-foreground">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-title font-semibold">Everything you need to ship a contract</h2>
          <p className="mt-3 text-muted-foreground">
            The full loop — author, build, test, deploy — without leaving the tab.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand/12 text-brand transition-colors group-hover:bg-brand/20">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-card/20">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">How it works</span>
            <h2 className="mt-4 font-display text-title font-semibold">From blank editor to live contract</h2>
            <p className="mt-3 text-muted-foreground">
              Watch the whole workflow happen in the browser — no installs, no context switches.
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

            <div className="space-y-3 lg:col-span-2">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={0.15 + i * 0.06}>
                  <div className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40">
                    <span className="font-mono text-sm font-semibold text-brand">{s.n}</span>
                    <div>
                      <h4 className="font-display text-sm font-semibold">{s.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-brand-gradient p-10 text-center md:p-16">
            <div className="absolute inset-0 grain" aria-hidden />
            <div className="relative">
              <Boxes className="mx-auto h-8 w-8 text-primary-foreground/90" />
              <h2 className="mt-4 font-display text-title font-semibold text-primary-foreground">
                Ship your first Soroban contract today
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/80">
                Sign in, get a funded testnet wallet, and deploy in under two minutes.
              </p>
              <Button
                size="lg"
                onClick={startBuilding}
                className="mt-7 bg-background text-foreground hover:bg-background/90"
              >
                {isAuthenticated ? 'Open the IDE' : 'Start building free'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <PlaygroundSubscription />
      <PlaygroundFooter />
    </main>
  )
}

/** Static, "live-looking" IDE mock used in the hero. */
function IdePreview() {
  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-destructive/70" />
        <span className="h-3 w-3 rounded-full bg-warning/70" />
        <span className="h-3 w-3 rounded-full bg-success/70" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">websoroban — /ide</span>
        <span className="ml-auto rounded border border-success/30 bg-success/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-success">
          testnet
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
        {/* file tree */}
        <div className="hidden border-r border-border bg-background/40 p-3 md:block">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Explorer</p>
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

        {/* editor */}
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
              {'  '}<span className="text-cosmic">pub fn</span> <span className="text-success">hello</span>(env: Env, to: Symbol) -&gt; Symbol {'{'}{'\n'}
              {'    '}symbol_short!(<span className="text-warning">"Hello"</span>){'\n'}
              {'  '}{'}'}{'\n'}
              {'}'}
            </code>
          </pre>
          {/* deploy result chip */}
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
