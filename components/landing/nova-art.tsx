'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import {
  AgentRelayGlyph,
  ProofSealGlyph,
  X402Glyph,
} from '@/components/landing/nova-glyphs'
import { StellarMark } from '@/components/stellar-mark'
import { cn } from '@/lib/utils'

type NovaArtProps = {
  className?: string
}

const DRAW_EASE = [0.16, 1, 0.3, 1] as const

/**
 * A deliberately illustrative system map for the WebSoroban hero. The drawing reads
 * as a build core gathering a prompt and sending verified work to four parts of
 * a Stellar application.
 */
export function NovaOrbitArt({ className }: NovaArtProps) {
  const reduceMotion = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const titleId = `nova-orbit-title-${id}`
  const descriptionId = `nova-orbit-description-${id}`
  const dotPatternId = `nova-orbit-dots-${id}`

  const draw = (delay = 0, duration = 0.9) => ({
    initial: reduceMotion ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: reduceMotion ? { duration: 0 } : { duration, delay, ease: DRAW_EASE },
  })

  return (
    <div className={cn('relative isolate w-full select-none', className)}>
      <motion.svg
        viewBox="0 0 760 620"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        className="h-auto w-full overflow-visible"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: DRAW_EASE }}
      >
        <title id={titleId}>WebSoroban build orbit</title>
        <desc id={descriptionId}>
          A prompt enters the WebSoroban build core and becomes a web interface, a Soroban
          contract, a payment route, and a ledger data stream.
        </desc>

        <defs>
          <pattern id={dotPatternId} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.25" className="fill-foreground/15" />
          </pattern>
        </defs>

        {/* Uneven paper-like fields keep the illustration tactile, not orbital-glow generic. */}
        <path
          d="M105 209C135 92 271 34 407 63c133 29 261 111 277 243 16 130-82 230-216 267-136 37-310 22-377-91-66-111-18-147 14-273Z"
          className="fill-brand-muted/65"
        />
        <path
          d="M91 252c-24 102 31 230 145 284 121 57 312 36 399-64 85-98 67-233-38-313C492 79 325 58 206 121 148 152 107 190 91 252Z"
          fill={`url(#${dotPatternId})`}
          className="opacity-70"
        />

        {/* Hand-drawn orbit tracks. */}
        <motion.path
          d="M80 354C123 164 324 62 516 118c142 42 218 152 166 281-50 126-222 187-387 135C140 485 44 434 80 354Z"
          fill="none"
          className="stroke-foreground/30"
          strokeWidth="1.5"
          strokeDasharray="7 10"
          vectorEffect="non-scaling-stroke"
          {...draw(0.1, 1.15)}
        />
        <motion.path
          d="M129 153C260 60 516 86 644 226c98 108 55 240-87 300-147 61-349 12-431-100-68-93-68-222 3-273Z"
          fill="none"
          className="stroke-brand/55"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          {...draw(0.18, 1.05)}
        />
        <motion.path
          d="M115 444c119 65 332 70 467-7"
          fill="none"
          className="stroke-foreground/25"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          {...draw(0.3, 0.75)}
        />

        {/* Prompt capsule. */}
        <motion.g
          animate={reduceMotion ? undefined : { y: [0, -5, 0], rotate: [0, -0.6, 0] }}
          transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
          style={{ transformOrigin: '143px 224px' }}
        >
          <rect x="48" y="180" width="190" height="88" rx="28" className="fill-card stroke-foreground" strokeWidth="1.5" />
          <circle cx="78" cy="209" r="10" className="fill-brand" />
          <path d="m74 209 3 3 6-7" fill="none" className="stroke-brand-foreground" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="98" y="213" className="fill-foreground" fontFamily="var(--font-display)" fontSize="17" fontWeight="600">Describe it</text>
          <path d="M77 239h117" className="stroke-border" strokeWidth="7" strokeLinecap="round" />
          <path d="M77 239h74" className="stroke-brand/45" strokeWidth="7" strokeLinecap="round" />
        </motion.g>

        <motion.path
          d="M238 224c31 2 47 16 67 41"
          fill="none"
          className="stroke-brand"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          {...draw(0.45, 0.5)}
        />
        <motion.circle
          cx="304"
          cy="264"
          r="5"
          className="fill-brand"
          initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.82, type: 'spring', stiffness: 360, damping: 24 }}
        />

        {/* The build core is a rounded tool window, with an intentionally offset backing sheet. */}
        <g transform="rotate(3 404 331)">
          <rect x="273" y="204" width="306" height="268" rx="42" className="fill-foreground/10 stroke-foreground/20" strokeWidth="1.5" />
        </g>
        <motion.g
          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 9.5, ease: 'easeInOut', repeat: Infinity, delay: 0.7 }}
        >
          <rect x="260" y="194" width="306" height="268" rx="42" className="fill-card stroke-foreground" strokeWidth="2" />
          <path d="M261 254h304" className="stroke-border" strokeWidth="1.5" />
          <circle cx="290" cy="224" r="5" className="fill-foreground/25" />
          <circle cx="308" cy="224" r="5" className="fill-foreground/25" />
          <circle cx="326" cy="224" r="5" className="fill-brand" />
          <text x="354" y="230" className="fill-muted-foreground" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="1.4">WEBSOROBAN / BUILD CORE</text>

          <rect x="289" y="282" width="248" height="72" rx="22" className="fill-secondary" />
          <rect x="306" y="299" width="39" height="39" rx="13" className="fill-brand" />
          <path d="m318 326 8-17 3 12 8-5-8 15-3-11-8 6Z" className="fill-brand-foreground" />
          <text x="361" y="312" className="fill-muted-foreground" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.3">GENERATING</text>
          <text x="361" y="333" className="fill-foreground" fontFamily="var(--font-display)" fontSize="16" fontWeight="600">Stellar payment app</text>

          <rect x="289" y="373" width="111" height="54" rx="17" className="fill-foreground" />
          <circle cx="310" cy="400" r="6" className="fill-success" />
          <text x="326" y="404" className="fill-background" fontFamily="var(--font-mono)" fontSize="10">COMPILED</text>
          <rect x="415" y="373" width="122" height="54" rx="17" className="fill-brand-muted" />
          <path d="M438 392v15m-7-7h14" className="stroke-brand" strokeWidth="2" strokeLinecap="round" />
          <text x="457" y="404" className="fill-brand" fontFamily="var(--font-mono)" fontSize="10">4 FILES</text>
        </motion.g>

        {/* Outputs are deliberately different shapes, as if pinned around a studio board. */}
        <motion.g
          animate={reduceMotion ? undefined : { y: [0, 4, 0], x: [0, -2, 0] }}
          transition={{ duration: 7.5, ease: 'easeInOut', repeat: Infinity, delay: 1.1 }}
        >
          <g transform="translate(0 -72)">
            <rect x="530" y="82" width="160" height="72" rx="36" className="fill-foreground" />
            <path d="M558 108h17v17h-17zM562 104h17v17" fill="none" className="stroke-brand" strokeWidth="2" />
            <text x="591" y="116" className="fill-background" fontFamily="var(--font-display)" fontSize="15" fontWeight="600">Web UI</text>
            <text x="591" y="134" className="fill-background/55" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1">NEXT.JS</text>
          </g>
        </motion.g>

        <motion.g
          animate={reduceMotion ? undefined : { y: [0, -4, 0], rotate: [0, 0.5, 0] }}
          transition={{ duration: 8.5, ease: 'easeInOut', repeat: Infinity, delay: 0.3 }}
          style={{ transformOrigin: '662px 300px' }}
        >
          <path d="M603 246h104c19 0 34 15 34 34v41c0 19-15 34-34 34H603c-13 0-24-11-24-24v-61c0-13 11-24 24-24Z" className="fill-card stroke-foreground" strokeWidth="1.5" />
          <path d="m607 293 11-10m-11 10 11 10m24-20 11 10-11 10m-11-29-8 38" fill="none" className="stroke-brand" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="672" y="290" textAnchor="middle" className="fill-foreground" fontFamily="var(--font-display)" fontSize="14" fontWeight="600">Soroban</text>
          <text x="672" y="310" textAnchor="middle" className="fill-muted-foreground" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.8">CONTRACT</text>
        </motion.g>

        <motion.g
          animate={reduceMotion ? undefined : { x: [0, 4, 0], y: [0, 2, 0] }}
          transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity, delay: 0.9 }}
        >
          <rect x="512" y="486" width="178" height="78" rx="25" className="fill-brand stroke-foreground" strokeWidth="1.5" />
          <circle cx="544" cy="525" r="15" className="fill-brand-foreground/15" />
          <path d="M537 525h14m-7-7v14" className="stroke-brand-foreground" strokeWidth="2" strokeLinecap="round" />
          <text x="571" y="520" className="fill-brand-foreground" fontFamily="var(--font-display)" fontSize="15" fontWeight="600">Payments</text>
          <text x="571" y="540" className="fill-brand-foreground/70" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1">X402 + MPP</text>
        </motion.g>

        <motion.g
          animate={reduceMotion ? undefined : { y: [0, 4, 0], rotate: [0, -0.5, 0] }}
          transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity, delay: 1.4 }}
          style={{ transformOrigin: '166px 506px' }}
        >
          <path d="M87 472c0-18 15-33 33-33h107c15 0 27 12 27 27v54c0 18-15 33-33 33H114c-15 0-27-12-27-27v-54Z" className="fill-card stroke-foreground" strokeWidth="1.5" />
          <ellipse cx="121" cy="480" rx="13" ry="6" className="fill-none stroke-brand" strokeWidth="2" />
          <path d="M108 480v20c0 4 6 7 13 7s13-3 13-7v-20m-26 10c0 4 6 7 13 7s13-3 13-7" fill="none" className="stroke-brand" strokeWidth="2" />
          <text x="151" y="486" className="fill-foreground" fontFamily="var(--font-display)" fontSize="15" fontWeight="600">Ledger data</text>
          <text x="151" y="507" className="fill-muted-foreground" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1">INGEST SDK</text>
        </motion.g>

        {/* Short connection marks visually tie each output to the core. */}
        {[
          'M515 194c17-22 35-35 57-45',
          'M566 309c12-4 20-6 32-7',
          'M506 452c25 18 39 30 55 43',
          'M288 438c-22 18-36 27-53 37',
        ].map((path, index) => (
          <motion.path
            key={path}
            d={path}
            fill="none"
            className="stroke-brand"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            {...draw(0.65 + index * 0.08, 0.45)}
          />
        ))}

        {/* Signature marks: a loose proof check and little four-point stars. */}
        <motion.path
          d="M43 341c11-8 21-14 34-18m-29 34c11-4 22-6 35-7"
          fill="none"
          className="stroke-foreground/55"
          strokeWidth="2"
          strokeLinecap="round"
          {...draw(0.72, 0.5)}
        />
        <path d="m702 436 4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Z" className="fill-brand" />
        <path d="m112 104 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" className="fill-foreground" />
      </motion.svg>
    </div>
  )
}

/**
 * A quieter, label-free orbit for the stacked hero layout. Keeping only the
 * drawn paths and small celestial marks prevents the desktop output cards from
 * being cropped behind the product window on tablet and mobile widths.
 */
export function NovaOrbitBackdrop({ className }: NovaArtProps) {
  const reduceMotion = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const dotPatternId = `nova-orbit-backdrop-dots-${id}`

  return (
    <div className={cn('relative w-full select-none', className)} aria-hidden="true">
      <motion.svg
        viewBox="0 0 600 360"
        className="h-auto w-full overflow-visible"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: DRAW_EASE }}
      >
        <defs>
          <pattern id={dotPatternId} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" className="fill-foreground/15" />
          </pattern>
        </defs>

        <path
          d="M47 168C85 45 225-13 364 19c132 31 220 122 210 225-10 106-121 165-269 145C164 370 50 292 47 168Z"
          className="fill-brand-muted/65"
        />
        <path
          d="M62 155C111 58 238 7 370 30c126 21 213 104 204 204-10 103-117 164-256 149C177 368 78 286 62 155Z"
          fill={`url(#${dotPatternId})`}
          className="opacity-75"
        />

        <motion.path
          d="M-18 232C94 52 363 8 538 114c103 62 95 171-22 224C369 405 113 349-18 232Z"
          fill="none"
          className="stroke-brand/60"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.05, delay: 0.12, ease: DRAW_EASE }}
        />
        <motion.path
          d="M14 286C121 116 361 54 555 140c102 45 105 129 31 188-96 76-360 87-572-42Z"
          fill="none"
          className="stroke-foreground/30"
          strokeWidth="1.5"
          strokeDasharray="7 10"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.2, delay: 0.2, ease: DRAW_EASE }}
        />

        <motion.g
          animate={reduceMotion ? undefined : { y: [0, -4, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 7.5, ease: 'easeInOut', repeat: Infinity }}
          style={{ transformOrigin: '520px 44px' }}
        >
          <circle cx="520" cy="44" r="13" className="fill-card stroke-foreground" strokeWidth="1.5" />
          <circle cx="520" cy="44" r="4" className="fill-brand" />
        </motion.g>
        <motion.g
          animate={reduceMotion ? undefined : { x: [0, 4, 0], y: [0, 2, 0] }}
          transition={{ duration: 8.5, ease: 'easeInOut', repeat: Infinity, delay: 0.65 }}
        >
          <path d="m74 92 4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Z" className="fill-foreground" />
          <path d="m557 252 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" className="fill-brand" />
        </motion.g>
        <circle cx="108" cy="250" r="5" className="fill-brand" />
        <circle cx="470" cy="318" r="4" className="fill-foreground/35" />
      </motion.svg>
    </div>
  )
}

/**
 * Accessible x402 / MPP flow diagram for the dark payments section.
 */
export function PaymentConstellation({ className }: NovaArtProps) {
  const reduceMotion = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const titleId = `payment-flow-title-${id}`
  const descriptionId = `payment-flow-description-${id}`
  const arrowId = `payment-flow-arrow-${id}`

  const pathMotion = {
    initial: reduceMotion ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: reduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.2, ease: DRAW_EASE },
  }

  return (
    <div className={cn('relative w-full select-none', className)}>
      <div className="relative grid gap-3 sm:hidden" role="img" aria-labelledby={`${titleId}-mobile ${descriptionId}-mobile`}>
        <span id={`${titleId}-mobile`} className="sr-only">Agentic payment request on Stellar</span>
        <span id={`${descriptionId}-mobile`} className="sr-only">An agent requests a paid resource, receives HTTP 402 payment terms, settles on Stellar, and receives the unlocked resource with a payment proof.</span>
        <svg className="pointer-events-none absolute bottom-10 left-5 top-10 w-8 overflow-visible text-brand/55" viewBox="0 0 32 320" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <motion.path d="M16 0C4 45 28 83 16 126S4 207 16 250s12 50 0 70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 7" vectorEffect="non-scaling-stroke" initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.15, ease: DRAW_EASE }} />
        </svg>

        <motion.div initial={reduceMotion ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 0.05, type: 'spring', stiffness: 300, damping: 26 }} className="relative flex min-h-24 items-center gap-4 rounded-2xl border border-background/15 bg-background/[0.045] p-4 text-background">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-background/10 text-brand"><AgentRelayGlyph className="h-6 w-6" /></span>
          <div><p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-background/45">01 / Request</p><p className="mt-1 font-display text-xl font-medium">Agent</p><p className="mt-1 font-mono text-xs text-background/55">GET /market-brief</p></div>
        </motion.div>

        <motion.div initial={reduceMotion ? false : { opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 0.18, type: 'spring', stiffness: 300, damping: 26 }} className="relative ml-7 flex min-h-28 items-center gap-4 rounded-2xl border border-brand bg-background p-4 text-foreground shadow-md">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-muted text-brand"><X402Glyph className="h-6 w-6" /></span>
          <div className="min-w-0 flex-1"><p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">02 / Payment terms</p><p className="mt-1 font-display text-2xl font-semibold">HTTP 402</p><div className="mt-2 flex gap-2 font-mono text-[0.62rem]"><span className="rounded-full bg-brand-muted px-2.5 py-1 text-brand">0.01 USDC</span><span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">TESTNET</span></div></div>
        </motion.div>

        <motion.div initial={reduceMotion ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 0.31, type: 'spring', stiffness: 300, damping: 26 }} className="relative flex min-h-24 items-center gap-4 rounded-2xl border border-background/15 bg-background/[0.045] p-4 text-background">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-brand-foreground"><StellarMark className="h-6 w-7" /></span>
          <div><p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-background/45">03 / Settle</p><p className="mt-1 font-display text-xl font-medium">Stellar</p><p className="mt-1 flex items-center gap-2 font-mono text-xs text-background/55"><span className="h-2 w-2 rounded-full bg-success" /> Verified · 1.8s</p></div>
        </motion.div>

        <motion.div initial={reduceMotion ? false : { opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 0.44, type: 'spring', stiffness: 300, damping: 26 }} className="relative ml-7 flex min-h-20 items-center gap-4 rounded-2xl border border-success/25 bg-success/[0.06] p-4 text-background">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/10 text-success"><ProofSealGlyph className="h-5 w-5" /></span>
          <div><p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-background/45">Resource unlocked</p><p className="mt-1 font-display text-base font-medium">200 + payment proof</p></div>
        </motion.div>
      </div>

      <svg
        viewBox="0 0 920 360"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        className="hidden h-auto w-full overflow-visible sm:block"
      >
        <title id={titleId}>Agentic payment request on Stellar</title>
        <desc id={descriptionId}>
          An agent requests a paid resource. The server answers with HTTP 402 payment
          terms, and WebSoroban verifies and settles the payment on Stellar before returning
          the result.
        </desc>

        <defs>
          <marker id={arrowId} markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M1 1.5 11 6 1 10.5 3.5 6 1 1.5Z" className="fill-brand" />
          </marker>
        </defs>

        <path
          d="M49 189C82 75 218 30 342 69c104 33 154 29 248 0 116-36 251 14 282 120 27 93-48 151-175 152-132 1-172-36-275-15-128 26-238 28-313-30-43-34-74-62-60-107Z"
          className="fill-background/[0.035] stroke-background/10"
          strokeWidth="1.5"
        />

        <motion.path
          d="M223 172C273 172 284 110 345 110h197c61 0 73 62 125 62"
          fill="none"
          className="stroke-brand"
          strokeWidth="2.5"
          strokeLinecap="round"
          markerEnd={`url(#${arrowId})`}
          vectorEffect="non-scaling-stroke"
          {...pathMotion}
        />
        <motion.path
          d="M744 235c-66 78-223 86-325 48-74-27-121-26-194-8"
          fill="none"
          className="stroke-background/25"
          strokeWidth="1.5"
          strokeDasharray="6 9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.72, ease: DRAW_EASE }}
        />

        {/* 01 — request */}
        <motion.g
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.05, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <rect x="46" y="110" width="180" height="124" rx="34" className="fill-foreground stroke-background/25" strokeWidth="1.5" />
          {/* WebSoroban agent glyph: a prompt capsule containing a routed reasoning graph. */}
          <path d="M71 137c0-5 4-9 9-9h17c5 0 9 4 9 9v19c0 5-4 9-9 9h-5l-5 5-1-5h-6c-5 0-9-4-9-9v-19Z" className="fill-background/10 stroke-background/25" strokeWidth="1.5" />
          <path d="M79 150 87 141l10 10-8 7-10-8Z" fill="none" className="stroke-brand" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="79" cy="150" r="2.5" className="fill-brand" />
          <circle cx="87" cy="141" r="2.5" className="fill-background" />
          <circle cx="97" cy="151" r="2.5" className="fill-brand" />
          <circle cx="89" cy="158" r="2.5" className="fill-background" />
          <path d="m101 132 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4Z" className="fill-brand" />
          <text x="122" y="143" className="fill-background/50" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.4">01 / REQUEST</text>
          <text x="122" y="164" className="fill-background" fontFamily="var(--font-display)" fontSize="17" fontWeight="600">Agent</text>
          <text x="66" y="202" className="fill-background/60" fontFamily="var(--font-mono)" fontSize="10">GET /market-brief</text>
        </motion.g>

        {/* 02 — terms, set higher to create the rising exchange rhythm. */}
        <motion.g
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.22, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <rect x="338" y="50" width="214" height="122" rx="38" className="fill-background stroke-brand" strokeWidth="2" />
          <text x="365" y="82" className="fill-muted-foreground" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.4">02 / PAYMENT TERMS</text>
          {/* Metered-gate mark: request enters, crosses the policy rail, then exits. */}
          <rect x="501" y="64" width="32" height="32" rx="11" className="fill-brand-muted" />
          <path d="M506 73h10m-3-3 3 3-3 3m8 11h7m-3-3 3 3-3 3M518 69v22" fill="none" className="stroke-brand" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="518" cy="80" r="2.5" className="fill-background stroke-brand" strokeWidth="1.5" />
          <text x="365" y="115" className="fill-foreground" fontFamily="var(--font-display)" fontSize="24" fontWeight="650">HTTP 402</text>
          <rect x="365" y="130" width="88" height="24" rx="12" className="fill-brand-muted" />
          <text x="409" y="146" textAnchor="middle" className="fill-brand" fontFamily="var(--font-mono)" fontSize="9">0.01 USDC</text>
          <rect x="461" y="130" width="66" height="24" rx="12" className="fill-secondary" />
          <text x="494" y="146" textAnchor="middle" className="fill-muted-foreground" fontFamily="var(--font-mono)" fontSize="9">TESTNET</text>
        </motion.g>

        {/* 03 — settlement */}
        <motion.g
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.42, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <rect x="664" y="110" width="210" height="124" rx="34" className="fill-foreground stroke-background/25" strokeWidth="1.5" />
          {/* Official Stellar mark. */}
          <circle cx="711" cy="151" r="23" className="fill-brand" />
          <StellarMark x={696} y={138} width={30} height={26} className="text-brand-foreground" />
          <text x="744" y="143" className="fill-background/50" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.4">03 / SETTLE</text>
          <text x="744" y="164" className="fill-background" fontFamily="var(--font-display)" fontSize="17" fontWeight="600">Stellar</text>
          <circle cx="695" cy="202" r="6" className="fill-success" />
          <text x="711" y="206" className="fill-background/65" fontFamily="var(--font-mono)" fontSize="10">VERIFIED · 1.8s</text>
        </motion.g>

        {/* A compact receipt closes the loop and makes the returning dashed path useful. */}
        <motion.g
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.88, type: 'spring', stiffness: 300, damping: 25 }}
          style={{ transformOrigin: '449px 269px' }}
        >
          <rect x="357" y="232" width="184" height="76" rx="25" className="fill-background/10 stroke-background/20" strokeWidth="1.5" />
          {/* Proof seal replaces the stock checkmark with a verifiable receipt mark. */}
          <path d="m385 249 5 4 6-1 2 6 5 4-4 5 1 7-6 2-4 5-5-4-6 1-2-6-5-4 4-5-1-7 6-2 4-5Z" className="fill-success/10 stroke-success" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="m380 265 7 7 12-15" fill="none" className="stroke-success" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M405 253h9m-9 24h9" className="stroke-background/25" strokeWidth="1.3" strokeLinecap="round" />
          <text x="420" y="263" className="fill-background/45" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.2">RESOURCE UNLOCKED</text>
          <text x="420" y="283" className="fill-background" fontFamily="var(--font-display)" fontSize="14" fontWeight="600">200 + payment proof</text>
        </motion.g>

        <motion.circle
          cx="590"
          cy="91"
          r="5"
          className="fill-brand"
          animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity, delay: 1.1 }}
          style={{ transformOrigin: '590px 91px' }}
        />
        <path d="m865 57 4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Z" className="fill-brand" />
        <path d="m94 281 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" className="fill-background/55" />
      </svg>
    </div>
  )
}
