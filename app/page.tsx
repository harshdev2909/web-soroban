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
  Globe,
  Rocket,
  KeyRound,
  Check,
  Sparkles,
  Bot,
  Bug,
  Layers,
  ListChecks,
  MessageCircleQuestion,
  Command,
  AtSign,
  ShieldCheck,
  GitCompareArrows,
  FileCode2,
  Hammer,
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

// The five Copilot modes, shown on the showcase + bento.
const MODES = [
  { icon: Bot, label: 'Agent', desc: 'Generates & edits, then self-corrects against compile + tests' },
  { icon: MessageCircleQuestion, label: 'Ask', desc: 'Read-only answers about your contract' },
  { icon: ListChecks, label: 'Plan', desc: 'Researches, then writes an editable build plan' },
  { icon: Bug, label: 'Debug', desc: 'Finds the root cause, proposes a minimal fix' },
  { icon: Layers, label: 'Multitask', desc: 'Runs several agents in parallel' },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const reduce = useReducedMotion()

  const startBuilding = () => {
    if (isAuthenticated) router.push('/projects')
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
            {/* Live-on-mainnet announcement (amber, to match the IDE's mainnet treatment) */}
            <motion.div variants={reduce ? undefined : item}>
              <Link
                href="/docs/networks"
                className="group inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning backdrop-blur transition-colors hover:bg-warning/15"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warning" />
                </span>
                Now live on Stellar Mainnet
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.span
              variants={reduce ? undefined : item}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 backdrop-blur"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              <span className="eyebrow flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-brand" /> AI Copilot for Soroban
              </span>
            </motion.span>

            <motion.h1
              variants={reduce ? undefined : item}
              className="font-display mt-6 text-display-lg font-semibold"
            >
              Generate, debug, and deploy
              <br />
              <span className="text-brand">Soroban contracts</span> with AI.
            </motion.h1>

            <motion.p variants={reduce ? undefined : item} className="lead mt-6 max-w-xl text-base md:text-lg">
              A web IDE with a Cursor-style Copilot for Stellar. Describe a contract in plain English and
              it writes the Rust, compiles to WASM, fixes its own errors, and deploys to testnet (or
              mainnet with your connected wallet). Every edit is validated against the real build and
              security pipeline.
            </motion.p>

            <motion.div
              variants={reduce ? undefined : item}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
            >
              <motion.div whileTap={reduce ? undefined : { scale: 0.98 }}>
                <Button size="lg" className="gap-2" onClick={startBuilding}>
                  {isAuthenticated ? 'Open your projects' : 'Start building free'}
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
              {['No install', 'Testnet + Mainnet', 'Every edit compiled + audited'].map((t) => (
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

      {/* AI Copilot showcase */}
      <section className="relative overflow-hidden border-t border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade opacity-60" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand" /> The Copilot
            </p>
            <h2 className="font-display mt-3 text-title font-semibold">An agent that actually builds</h2>
            <p className="lead mt-3 max-w-md">
              Not autocomplete. A real tool-using agent: it reads your project, writes diffs you review,
              runs the compiler, reads the errors, and fixes them, looping until it builds clean and the
              tests pass.
            </p>
            <ul className="mt-7 space-y-2.5">
              {MODES.map((m) => {
                const Icon = m.icon
                return (
                  <li key={m.label} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-card text-brand">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{m.label}.</span> {m.desc}
                    </p>
                  </li>
                )
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <CopilotPreview reduce={reduce} />
          </Reveal>
        </div>
      </section>

      {/* Features (asymmetric bento) */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Everything in one tab</p>
          <h2 className="font-display mt-3 text-title font-semibold">
            From a prompt to a deployed contract
          </h2>
          <p className="lead mt-3 max-w-lg">
            The Copilot and the toolchain share one workspace. Generate, compile, audit, and ship
            without a local setup or a context switch.
          </p>
        </Reveal>

        <div className="mt-10 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-3 md:grid-cols-6">
          {/* Wide: Copilot / five modes */}
          <BentoCard className="md:col-span-4" icon={Sparkles} title="AI Copilot, five real modes" reduce={reduce}>
            <p className="lead max-w-md text-sm">
              Ask, Agent, Plan, Debug, and Multitask, enforced by tool permissions, not labels. Agent
              writes diffs you review and self-corrects against the compiler.
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {MODES.map((m) => {
                const Icon = m.icon
                return (
                  <span
                    key={m.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    <Icon className="h-3 w-3 text-brand" /> {m.label}
                  </span>
                )
              })}
            </div>
          </BentoCard>

          {/* Model switching */}
          <BentoCard className="md:col-span-2" icon={Bot} title="Bring any model" reduce={reduce}>
            <p className="lead text-sm">
              Claude, GPT, Gemini, DeepSeek. Switch per chat or let Auto route, and MAX Mode dials up
              reasoning.
            </p>
            <div className="mt-5 space-y-1.5 rounded-lg border border-border bg-background/70 p-3">
              {[
                ['Claude Opus 4.8', 'High'],
                ['GPT-5.1', 'High'],
                ['Auto', 'Routing'],
              ].map(([m, tag]) => (
                <div key={m} className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-foreground/90">{m}</span>
                  <span className="rounded bg-brand/12 px-1.5 py-0.5 font-mono text-[9px] text-brand">{tag}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Row 2 */}
          <BentoCard className="md:col-span-2" icon={Command} title="Slash commands & @-context" reduce={reduce}>
            <p className="lead text-sm">
              <span className="font-mono text-foreground/90">/generate</span>,{' '}
              <span className="font-mono text-foreground/90">/fix</span>,{' '}
              <span className="font-mono text-foreground/90">/audit</span>. Attach{' '}
              <span className="inline-flex items-center gap-0.5 font-mono text-foreground/90"><AtSign className="h-3 w-3" />file</span>,{' '}
              <span className="font-mono text-foreground/90">@errors</span>, or your selection as context.
            </p>
          </BentoCard>
          <BentoCard className="md:col-span-2" icon={Hammer} title="Validated, not hallucinated" reduce={reduce}>
            <p className="lead text-sm">
              Every generation runs the real pipeline (compile, clippy, tests) and loops on the
              errors until it builds for the testnet WASM target.
            </p>
          </BentoCard>
          <BentoCard className="md:col-span-2" icon={ShieldCheck} title="Security audit built in" reduce={reduce}>
            <p className="lead text-sm">
              A Soroban rule check flags missing{' '}
              <span className="font-mono text-foreground/90">require_auth</span>, unchecked math, risky
              storage TTL, and reachable panics, each with a fix.
            </p>
          </BentoCard>

          {/* Wide platform strip */}
          <BentoCard className="md:col-span-6" icon={Rocket} title="A real Stellar workflow underneath" reduce={reduce}>
            <p className="lead max-w-2xl text-sm">
              Server-side WASM builds, a funded testnet wallet provisioned on first login, and one-click
              deploy with the contract id inline. Ship on testnet with the faucet, or connect your own
              wallet to deploy and invoke on <span className="text-warning">mainnet</span>. Your key
              never leaves the browser.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Globe, label: 'Testnet & Mainnet', sub: 'Faucet on testnet · connect for mainnet' },
                { icon: Wallet, label: 'Funded testnet wallet', sub: '10,000 XLM on first login' },
                { icon: KeyRound, label: 'Keys encrypted · exportable', sub: 'Self-custody anytime' },
              ].map((x) => {
                const Icon = x.icon
                return (
                  <div key={x.label} className="flex items-center gap-3 rounded-lg border border-border bg-background/70 p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand/12 text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{x.label}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{x.sub}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </BentoCard>
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
                  Describe it. The Copilot builds it.
                </h2>
                <p className="lead mt-3 max-w-md">
                  Sign in, get a funded testnet wallet, and let the Copilot generate, fix, and deploy
                  your first Soroban contract on testnet, in minutes.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <motion.div whileTap={reduce ? undefined : { scale: 0.98 }}>
                    <Button size="lg" className="gap-2" onClick={startBuilding}>
                      {isAuthenticated ? 'Open your projects' : 'Start building free'}
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

/** Animated mock of the docked Copilot (the showcase centerpiece). */
const PREVIEW_STEPS: { icon: React.ComponentType<{ className?: string }>; label: string; tone: string }[] = [
  { icon: FileCode2, label: 'Read lib.rs', tone: 'muted' },
  { icon: Hammer, label: 'Ran compile · 2 errors', tone: 'error' },
  { icon: GitCompareArrows, label: 'Edited storage.rs', tone: 'brand' },
  { icon: Hammer, label: 'Ran compile · clean', tone: 'success' },
  { icon: ShieldCheck, label: 'Security audit · 0 findings', tone: 'success' },
]
const TONE: Record<string, string> = {
  muted: 'text-muted-foreground',
  error: 'text-destructive',
  brand: 'text-brand',
  success: 'text-success',
}
const DOT: Record<string, string> = {
  muted: 'bg-muted-foreground/50',
  error: 'bg-destructive',
  brand: 'bg-brand',
  success: 'bg-success',
}

function CopilotPreview({ reduce }: { reduce: boolean | null }) {
  const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }
  const stepItem: Variants = {
    hidden: { opacity: 0, x: -8 },
    show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
  }
  const listMotion = reduce
    ? {}
    : {
        variants: list,
        initial: 'hidden' as const,
        whileInView: 'show' as const,
        viewport: { once: true, margin: '-60px' },
      }

  return (
    <div className="relative">
      {/* soft brand glow */}
      <div
        className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand/20 via-cosmic/10 to-transparent blur-2xl"
        aria-hidden
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* dock header: segmented + mode + model */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="flex items-center gap-1.5 rounded-md bg-background px-2 py-1 text-xs font-medium text-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand" /> Copilot
          </span>
          <span className="rounded-md px-2 py-1 text-xs text-muted-foreground">Contract</span>
          <span className="ml-auto flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground">
            <Bot className="h-3 w-3 text-brand" /> Agent
          </span>
          <span className="hidden items-center rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground sm:flex">
            Claude · Auto
          </span>
        </div>

        <div className="space-y-3 p-3.5">
          {/* user turn */}
          <div className="flex justify-end">
            <div className="max-w-[88%] rounded-2xl rounded-br-md border border-brand/20 bg-gradient-to-br from-brand/15 to-brand/5 px-3 py-2 text-[13px] leading-relaxed text-foreground">
              Make the token pausable by an admin, and write tests.
            </div>
          </div>

          {/* assistant */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-brand/15 text-brand">
              <Bot className="h-3 w-3" />
            </span>
            <span className="font-medium text-foreground/80">Assistant</span>
          </div>

          {/* tool-step timeline (staggers in on view) */}
          <motion.ul className="space-y-1.5" {...listMotion}>
            {PREVIEW_STEPS.map((s) => {
              const Icon = s.icon
              return (
                <motion.li
                  key={s.label}
                  variants={reduce ? undefined : stepItem}
                  className="flex items-center gap-2 rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5"
                >
                  <Icon className={`h-3.5 w-3.5 ${TONE[s.tone]}`} />
                  <span className="text-[12px] text-foreground/90">{s.label}</span>
                  <span className={`ml-auto h-1.5 w-1.5 rounded-full ${DOT[s.tone]}`} />
                </motion.li>
              )
            })}
          </motion.ul>

          {/* summary with blinking caret */}
          <p className="text-[13px] leading-relaxed text-foreground/90">
            Added a{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-brand">paused</code> flag gated by{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-brand">admin.require_auth()</code>, plus
            4 tests. Builds clean.
            {!reduce && (
              <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] animate-pulse bg-brand align-middle" aria-hidden />
            )}
          </p>

          {/* diff */}
          <div className="overflow-hidden rounded-lg border border-border bg-background/70">
            <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
              <span className="font-mono text-[10px] text-muted-foreground">src/storage.rs</span>
              <span className="font-mono text-[10px]">
                <span className="text-success">+18</span> <span className="text-destructive">−2</span>
              </span>
            </div>
            <pre className="overflow-x-auto px-3 py-2 font-mono text-[11px] leading-[1.6]">
              <div className="text-destructive"><span className="select-none opacity-60">- </span>pub fn set_paused(e: Env, p: bool) {'{'}</div>
              <div className="text-success"><span className="select-none opacity-60">+ </span>pub fn set_paused(e: Env, p: bool) {'{'}</div>
              <div className="text-success"><span className="select-none opacity-60">+ </span>{'  '}admin(&e).require_auth();</div>
              <div className="text-muted-foreground"><span className="select-none opacity-60">{'  '}</span>{'  '}e.storage().instance().set(&PAUSED, &p);</div>
            </pre>
          </div>

          {/* apply bar */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2">
            <span className="text-[11px] text-muted-foreground">1 file changed · review as a diff</span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-[11px] font-medium text-white">
              <Check className="h-3 w-3" /> Apply
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
