'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import PlaygroundSubscription from '@/components/playground-subscription'
import { LoginModal } from '@/components/login-modal'
import { HeroSculpture, OrbitStatic } from '@/components/three/hero-sculpture'
import { Chapter, ChapterHeading, FigureBackdrop, Index } from '@/components/landing/chapter'
import { LedgerPulse } from '@/components/landing/ledger-pulse'
import { LocalnetFigure, PaymentFlowFigure, PolicyFigure, TelemetryStrip, WorkspaceFigure } from '@/components/landing/figures'
import { IdeaBankBand } from '@/components/ideas/landing-band'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { trackCta, trackLandingView } from '@/lib/analytics'

/* Hero entrance storyboard (absolute from mount, slide only so the LCP copy
 * paints at full size in the server HTML):
 *   0ms eyebrow · 70ms headline · 150ms lead · 220ms actions · 290ms proof
 *   The sculpture fades in on its own once the page is idle. */
const HERO = { eyebrow: 0, headline: 0.07, lead: 0.15, actions: 0.22, proof: 0.29 }
const spring = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.85 }

const TELEMETRY = [
  { index: '01', label: 'Toolchain', value: 'Nothing to install' },
  { index: '02', label: 'Output', value: 'Compile-verified Soroban' },
  { index: '03', label: 'Ownership', value: 'Every file is yours' },
  { index: '04', label: 'Networks', value: 'Testnet and mainnet' },
]

const STEPS = [
  { title: 'Describe', copy: 'A payment-gated research app with a private results view.' },
  { title: 'Generate', copy: 'Interface, API route, Soroban contract, and data model.' },
  { title: 'Verify', copy: 'Compile, test, simulate, and inspect each proposed diff.' },
  { title: 'Ship', copy: 'Preview instantly, then deploy to testnet or mainnet.' },
]

const LOCAL_POINTS = ['Snapshots and instant resets', 'Funded test fixtures', 'Readable transaction traces', 'IDE and terminal workflows']

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  // The primary CTA reaches the IDE in one click; signed-in users go to their projects.
  const startBuilding = (cta: string) => {
    const destination = isAuthenticated ? '/projects' : '/ide'
    trackCta(cta, destination)
    router.push(destination)
  }
  useEffect(() => { trackLandingView() }, [])
  const enter = (delay: number, distance = 14) => ({
    initial: { y: distance },
    animate: { y: 0 },
    transition: { ...spring, delay },
  })

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      {/* 00 · Hero */}
      <section className="relative overflow-hidden" id="top">
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden="true" />
        <div className="bg-space mask-radial pointer-events-none absolute left-1/2 top-[-4rem] h-[36rem] w-[36rem] -translate-x-1/2 opacity-60 lg:left-auto lg:right-[-4rem] lg:top-1/2 lg:h-[60rem] lg:w-[60rem] lg:-translate-y-1/2 lg:translate-x-0" aria-hidden="true" />
        <div className="light-pool pointer-events-none absolute left-1/2 top-[-2rem] h-[26rem] w-[26rem] -translate-x-1/2 lg:left-auto lg:right-[10%] lg:top-1/2 lg:h-[34rem] lg:w-[34rem] lg:-translate-y-1/2 lg:translate-x-0" aria-hidden="true" />
        <HeroSculpture className="pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex max-w-7xl flex-col px-6 pb-10 pt-[21rem] sm:pt-[23rem] lg:min-h-[calc(100vh-4rem)] lg:justify-center lg:py-24 lg:pt-16">
          <div className="max-w-3xl">
            <motion.div {...enter(HERO.eyebrow)}>
              <LedgerPulse />
            </motion.div>
            <motion.h1 {...enter(HERO.headline)} className="mt-8 font-display text-display-xl font-medium">
              Idea to orbit,
              <span className="block text-brand">on Stellar.</span>
            </motion.h1>
            <motion.p {...enter(HERO.lead)} className="mt-8 max-w-[34rem] text-lg leading-8 text-muted-foreground sm:text-xl">
              Describe the product. WebSoroban writes the interface, the Soroban contracts, and the payment rails, then opens every file in a real web IDE.
            </motion.p>
            <motion.div {...enter(HERO.actions)} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="lit group h-12 gap-2 px-6" onClick={() => startBuilding('hero_primary')}>
                {isAuthenticated ? 'Open WebSoroban' : 'Build with WebSoroban'}
                <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
              </Button>
              <Link
                href="/ide"
                onClick={() => trackCta('hero_ide', '/ide')}
                className="group inline-flex min-h-12 items-center gap-2 rounded-md px-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                Explore the IDE
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
          <motion.div {...enter(HERO.proof, 8)} className="mt-16 lg:mt-24">
            <TelemetryStrip items={TELEMETRY} />
          </motion.div>
        </div>
      </section>

      {/* 01 · Build */}
      <Chapter index="01" label="Build" figure="fig. 01 · workspace, mid-build" id="build" className="pt-10 lg:pt-16">
        <ChapterHeading
          title={<>Describe it. Then open every file.</>}
          lead="The ease of a product builder with the transparency of a full IDE. WebSoroban plans in small, reviewable diffs, runs the project, and keeps you in control."
        />
        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <ol>
              {STEPS.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-border py-5 last:border-b">
                  <Index className="pt-1">0{index + 1}</Index>
                  <div>
                    <h3 className="font-display text-xl font-medium">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal className="relative lg:col-span-8" delay={0.05}>
            <FigureBackdrop />
            <WorkspaceFigure />
          </Reveal>
        </div>
      </Chapter>

      {/* 02 · Pay */}
      <Chapter index="02" label="Pay" figure="fig. 02 · one paid request" id="pay" className="pt-24 lg:pt-32">
        <ChapterHeading
          title={<>Give software a native way to pay.</>}
          lead="Price an endpoint in USDC, take payment from a wallet, and settle on Stellar with a receipt. The payment layer lives in the product workflow, not in a second dashboard."
          aside={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm"><Link href="/pay" onClick={() => trackCta('payments_pay', '/pay')}>Open WebSoroban Pay <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="ghost" size="sm"><Link href="/payloop" onClick={() => trackCta('payments_payloop', '/payloop')}>Try PayLoop <ArrowUpRight className="h-4 w-4" /></Link></Button>
            </div>
          }
        />
        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12">
          <Reveal className="relative lg:col-span-8"><FigureBackdrop light /><PaymentFlowFigure /></Reveal>
          <Reveal className="relative lg:col-span-4" delay={0.06}><PolicyFigure /></Reveal>
        </div>
        <Reveal className="mt-6 grid gap-px border border-border bg-border md:grid-cols-3" delay={0.08}>
          {[
            ['Official x402 v2', 'The exact scheme on Stellar, through the OpenZeppelin facilitator.'],
            ['Non-custodial subscriptions', 'One signed policy: merchant, amount, interval, and cap, enforced on-chain.'],
            ['Receipts and webhooks', 'Every settlement has a transaction hash and a signed delivery.'],
          ].map(([title, copy], index) => (
            <div key={title} className="bg-background p-5">
              <Index>0{index + 1}</Index>
              <h3 className="mt-3 text-sm font-medium text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </Reveal>
      </Chapter>

      {/* 03 · Local */}
      <Chapter index="03" label="Local" figure="fig. 03 · websoroban local · in development" id="local" className="pt-24 lg:pt-32">
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
          <Reveal className="lg:col-span-5">
            <h2 className="font-display text-display font-medium">A local Stellar that keeps up with you.</h2>
            <p className="lead mt-6 text-base sm:text-lg">WebSoroban Local is a Surfpool-inspired development network: a fast, drop-in environment built for repeatable Stellar application testing.</p>
            <ul className="mt-8">
              {LOCAL_POINTS.map((item, index) => (
                <li key={item} className="flex items-center gap-4 border-t border-border py-3 text-sm last:border-b">
                  <Index>0{index + 1}</Index>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="relative lg:col-span-7" delay={0.05}><FigureBackdrop /><LocalnetFigure /></Reveal>
        </div>
      </Chapter>

      {/* 04 · Idea Bank */}
      <IdeaBankBand />

      {/* 05 · Close */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 lg:pb-32 lg:pt-32">
        <Reveal className="relative overflow-hidden border-y border-border py-16 lg:py-24">
          <div className="bg-space mask-radial pointer-events-none absolute -right-40 -top-56 h-[50rem] w-[50rem] opacity-70" aria-hidden="true" />
          <OrbitStatic className="pointer-events-none absolute -right-24 -top-40 h-[34rem] w-[34rem] opacity-60" />
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="font-display text-display-lg font-medium">Bring the idea. Leave with a Stellar product.</h2>
            </div>
            <div className="flex flex-col gap-4 lg:col-span-4 lg:items-end">
              <p className="max-w-sm text-sm leading-6 text-muted-foreground lg:text-right">Generate the app, inspect the code, run the contracts, and deploy, without giving up the engineering workflow.</p>
              <Button size="lg" className="lit group h-12 gap-2 px-6" onClick={() => startBuilding('footer_primary')}>
                {isAuthenticated ? 'Open WebSoroban' : 'Start building'}
                <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
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
