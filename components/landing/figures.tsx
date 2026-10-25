'use client'

/**
 * The landing page's figures: product surfaces drawn from real components and
 * real copy rather than screenshots, so they stay true as the product moves.
 */
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Braces, FileCode2, Layers3, Zap } from 'lucide-react'
import { Index } from '@/components/landing/chapter'
import { cn } from '@/lib/utils'

const spring = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.8 }

/* Hairline grid of facts under the hero. */
export function TelemetryStrip({ items }: { items: { index: string; label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 border-y border-border lg:grid-cols-4">
      {items.map((item, position) => (
        <div
          key={item.index}
          className={cn(
            'flex flex-col gap-3 px-1 py-5 sm:px-4',
            position % 2 === 1 && 'border-l border-border',
            position >= 2 && 'border-t border-border lg:border-t-0',
            position === 2 && 'lg:border-l',
          )}
        >
          <dt className="flex items-center gap-3">
            <Index className="text-foreground">{item.index}</Index>
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</span>
          </dt>
          <dd className="text-sm text-foreground sm:text-base">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/* Chapter 01: the workspace, mid-build. */
const PLAN = [
  { title: 'Scaffold the app', detail: 'app/, api/pay, contracts/' },
  { title: 'Write the paywall', detail: 'api/pay.ts · x402 exact scheme' },
  { title: 'Compile the contract', detail: 'cargo build · 0 warnings' },
  { title: 'Run the preview', detail: 'Stellar testnet · funded wallet' },
]

const DIFF = [
  { kind: 'ctx', text: "import express from 'express'" },
  { kind: 'add', text: "import { createWebSorobanPay } from '@web-soroban/pay'" },
  { kind: 'ctx', text: '' },
  { kind: 'ctx', text: 'const app = express()' },
  { kind: 'add', text: 'const pay = createWebSorobanPay({' },
  { kind: 'add', text: '  apiUrl: process.env.WEBSOROBAN_API_URL,' },
  { kind: 'add', text: '  apiKey: process.env.WEBSOROBAN_PAY_KEY,' },
  { kind: 'add', text: '  endpointId: process.env.WEBSOROBAN_ENDPOINT_ID,' },
  { kind: 'add', text: '  payTo: process.env.STELLAR_PAY_TO,' },
  { kind: 'add', text: '})' },
  { kind: 'ctx', text: '' },
  { kind: 'add', text: "app.use(pay.protect('GET /brief', '$0.01'))" },
  { kind: 'ctx', text: "app.get('/brief', generateBrief)" },
] as const

export function WorkspaceFigure() {
  const files: [string, typeof Layers3][] = [['app', Layers3], ['api/pay.ts', Zap], ['contracts', Braces], ['schema.ts', FileCode2]]
  return (
    <div className="figure ticks overflow-hidden">
      <div className="flex h-11 items-center justify-between border-b border-border px-4 font-mono text-[0.68rem] text-muted-foreground">
        <span className="flex items-center gap-3">
          <span className="text-foreground">payments-app</span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          main
        </span>
        <span className="flex items-center gap-4">
          <span className="hidden items-center gap-2 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-success" /> preview live</span>
          <span>testnet</span>
        </span>
      </div>
      <div className="grid md:grid-cols-[9.5rem_1fr] lg:grid-cols-[9.5rem_1fr_17rem]">
        <div className="hidden border-r border-border p-3 md:block">
          <p className="px-2 pt-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Explorer</p>
          <ul className="mt-3 space-y-0.5 font-mono text-[0.7rem]">
            {files.map(([label, Icon], index) => (
              <li key={label} className={cn('flex h-8 items-center gap-2 rounded-md px-2', index === 1 ? 'bg-accent text-foreground' : 'text-muted-foreground')}>
                <Icon className={cn('h-3.5 w-3.5', index === 1 ? 'text-brand' : '')} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex h-9 items-center gap-4 border-b border-border px-4 font-mono text-[0.65rem] text-muted-foreground">
            <span className="text-foreground">api/pay.ts</span>
            <span className="text-success">+9</span>
            <span className="ml-auto">diff · proposed</span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[0.72rem] leading-[1.55]">
            {DIFF.map((line, index) => (
              <motion.div
                key={index}
                initial={line.kind !== 'add' ? false : { opacity: 0, x: -4 }}
                whileInView={line.kind !== 'add' ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...spring, delay: 0.15 + index * 0.035 }}
                className={cn('flex gap-4 px-1', line.kind === 'add' ? 'bg-success/10 text-foreground' : 'text-muted-foreground')}
              >
                <span className="w-4 shrink-0 select-none text-right text-muted-foreground/60">{line.kind === 'add' ? '+' : ' '}</span>
                <code className="whitespace-pre">{line.text || ' '}</code>
              </motion.div>
            ))}
          </pre>
        </div>
        <div className="min-w-0 p-4">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Copilot · plan</p>
          <p className="mt-3 text-sm leading-6 text-foreground">A research API that charges 0.01 USDC per brief, with a private results view.</p>
          <ol className="mt-5 space-y-0">
            {PLAN.map((step, index) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...spring, delay: 0.3 + index * 0.16 }}
                className="flex gap-3 border-t border-border py-3"
              >
                <span className={cn('mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full', index < 3 ? 'bg-success text-success-foreground' : 'border border-border')}>
                  {index < 3 ? <Check className="h-2.5 w-2.5" aria-hidden="true" /> : <span className="blink h-1 w-1 rounded-full bg-brand" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-foreground">{step.title}</span>
                  <span className="mt-0.5 block truncate font-mono text-[0.62rem] text-muted-foreground">{step.detail}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 font-mono text-[0.62rem] text-muted-foreground">
        <span>8 files · 3 applied · 1 pending</span>
        <span className="hidden sm:inline">You choose what reaches the codebase.</span>
      </div>
    </div>
  )
}

/* Chapter 02: the x402 flow, one request from challenge to receipt. */
const FLOW = [
  { code: 'GET', label: '/brief', note: 'Any HTTP client, agent, or browser' },
  { code: '402', label: 'Payment required', note: 'Price, asset, and payee in one header' },
  { code: 'SIGN', label: 'One authorization', note: 'Freighter, Hana, HOT, or Klever' },
  { code: 'USDC', label: 'Settled on Stellar', note: 'Facilitator pays the network fee' },
  { code: '200', label: 'Response + receipt', note: 'Transaction hash in PAYMENT-RESPONSE' },
]

export function PaymentFlowFigure() {
  const reduce = useReducedMotion()
  return (
    <div className="figure ticks overflow-hidden">
      <div className="relative border-b border-border">
        <div className="absolute inset-x-6 top-[1.6rem] h-px bg-border lg:inset-x-10" aria-hidden="true" />
        <motion.span
          aria-hidden="true"
          className="absolute top-[1.6rem] h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_12px_2px_hsl(var(--brand)/0.6)]"
          style={{ left: '1.5rem' }}
          animate={reduce ? undefined : { left: ['1.5rem', 'calc(100% - 1.5rem)'] }}
          transition={{ duration: 3.6, ease: [0.45, 0, 0.2, 1], repeat: Infinity, repeatDelay: 0.6 }}
        />
        <ol className="relative grid grid-cols-2 gap-y-8 px-6 pb-7 pt-5 sm:grid-cols-3 lg:grid-cols-5 lg:px-10">
          {FLOW.map((step, index) => (
            <motion.li
              key={step.code}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...spring, delay: index * 0.08 }}
              className="pr-4"
            >
              <span className="relative z-10 inline-flex h-6 items-center rounded-sm border border-border bg-card px-2 font-mono text-[0.62rem] tracking-[0.12em] text-foreground">{step.code}</span>
              <p className="mt-4 text-sm font-medium text-foreground">{step.label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.note}</p>
            </motion.li>
          ))}
        </ol>
      </div>
      <div className="grid gap-px bg-border md:grid-cols-2">
        <div className="min-w-0 bg-card p-5">
          <div className="flex items-center justify-between">
            <Index>01 · x402 kit</Index>
            <Index className="text-success">live</Index>
          </div>
          <pre className="mt-4 overflow-x-auto font-mono text-[0.72rem] leading-6 text-muted-foreground"><code><span className="text-foreground">npm i</span> @web-soroban/pay{'\n'}{'\n'}app.use(pay.protect(<span className="text-foreground">&apos;GET /brief&apos;</span>, <span className="text-brand">&apos;$0.01&apos;</span>))</code></pre>
        </div>
        <div className="min-w-0 bg-card p-5">
          <div className="flex items-center justify-between">
            <Index>02 · PayLoop</Index>
            <Index className="text-success">live</Index>
          </div>
          <pre className="mt-4 overflow-x-auto font-mono text-[0.72rem] leading-6 text-muted-foreground"><code><span className="text-foreground">npm i</span> @web-soroban/payloop{'\n'}{'\n'}payloop.buildCreatePolicy({'{'} amount: <span className="text-brand">&apos;9.99&apos;</span>, intervalSeconds: 2592000 {'}'})</code></pre>
        </div>
      </div>
    </div>
  )
}

/* Chapter 02, second figure: a PayLoop policy as the contract sees it. */
export function PolicyFigure() {
  const rows = [
    ['merchant', 'GBWJ…XMKZ'],
    ['amount', '9.99 USDC'],
    ['interval', '30 days'],
    ['cap', '119.88 USDC'],
    ['charged', '3 of 12'],
  ]
  return (
    <div className="figure ticks overflow-hidden">
      <div className="flex h-11 items-center justify-between border-b border-border px-4 font-mono text-[0.68rem] text-muted-foreground">
        <span className="text-foreground">policy #41</span>
        <span className="flex items-center gap-2 text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> active</span>
      </div>
      <dl className="px-4">
        {rows.map(([key, value], index) => (
          <div key={key} className={cn('flex items-center justify-between py-3 font-mono text-[0.72rem]', index > 0 && 'border-t border-border')}>
            <dt className="uppercase tracking-[0.14em] text-muted-foreground">{key}</dt>
            <dd className="text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          <span>schedule</span>
          <span>next in 27d</span>
        </div>
        <div className="mt-3 grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }, (_, index) => (
            <motion.span
              key={index}
              initial={{ scaleY: 0.2, opacity: 0 }}
              whileInView={{ scaleY: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ ...spring, delay: 0.1 + index * 0.04 }}
              className={cn('h-6 origin-bottom rounded-sm', index < 3 ? 'bg-brand' : index === 3 ? 'border border-brand/60 bg-brand/15' : 'border border-border')}
            />
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">Funds stay in the wallet until a charge is due. Pause, resume, or revoke from the wallet at any time.</p>
      </div>
    </div>
  )
}

/* Chapter 03: WebSoroban Local, in a terminal. */
export function LocalnetFigure() {
  const lines = [
    ['$', 'websoroban local'],
    ['', 'booting Stellar development network…'],
    ['', 'rpc        http://127.0.0.1:8000'],
    ['', 'network    local / standalone'],
    ['', 'accounts   3 funded'],
    ['', 'contracts  4 restored'],
    ['✓', 'ready in 1.8s'],
    ['$', 'websoroban test --watch'],
    ['', '4 passed · watching src/**/*.rs'],
  ]
  return (
    <div className="figure ticks overflow-hidden">
      <div className="flex h-11 items-center justify-between border-b border-border px-4 font-mono text-[0.68rem] text-muted-foreground">
        <span className="flex items-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full border border-border" />
          <span className="h-2 w-2 rounded-full border border-border" />
          <span className="h-2 w-2 rounded-full bg-brand" />
        </span>
        <span>websoroban-local — zsh</span>
      </div>
      <div className="min-h-72 p-5 font-mono text-[0.78rem] leading-7 sm:p-6">
        {lines.map(([prefix, text], index) => (
          <p key={index} className={cn(prefix === '$' && index > 0 && 'mt-4', prefix ? 'text-foreground' : 'text-muted-foreground')}>
            {prefix && <span className={cn('mr-3', prefix === '✓' ? 'text-success' : 'text-brand')}>{prefix}</span>}
            {text}
            {index === lines.length - 1 && <span className="blink ml-1 inline-block h-4 w-2 translate-y-0.5 bg-foreground/80" aria-hidden="true" />}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-3 border-t border-border font-mono text-[0.65rem] text-muted-foreground">
        {['ledger 128', '3 accounts', '0 errors'].map((item, index) => (
          <span key={item} className={cn('py-3 text-center', index > 0 && 'border-l border-border')}>{item}</span>
        ))}
      </div>
    </div>
  )
}
