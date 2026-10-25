'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useReducedMotion } from 'framer-motion'
import { ArrowUp, ArrowUpRight, Github, Twitter } from 'lucide-react'
import { NovaMark } from '@/components/nova-mark'
import { OrbitStatic } from '@/components/three/hero-sculpture'

export const socials = [
  { href: 'https://github.com/WebSoroban', icon: <Github className="h-4 w-4" />, name: 'GitHub' },
  { href: 'https://x.com/WebSoroban', icon: <Twitter className="h-4 w-4" />, name: 'Twitter' },
]

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'IDE', href: '/ide' },
      { label: 'WebSoroban Pay', href: '/pay' },
      { label: 'PayLoop', href: '/payloop' },
      { label: 'Templates', href: '/marketplace' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'x402 guide', href: '/docs/payments' },
      { label: 'PayLoop guide', href: '/docs/payloop' },
      { label: 'API reference', href: '/docs/reference/api' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Idea Bank', href: '/ideas' },
      { label: 'Privacy', href: '/privacy-policy' },
      { label: 'Terms', href: '/terms-of-service' },
    ],
  },
]

const PlaygroundFooter = () => {
  const reduce = useReducedMotion()
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })

  return (
    <footer id="site-footer" className="relative overflow-hidden border-t border-border bg-background">
      <div className="bg-space mask-radial pointer-events-none absolute -right-40 -top-40 h-[56rem] w-[56rem] opacity-60" aria-hidden="true" />
      <OrbitStatic className="pointer-events-none absolute -right-32 -top-24 h-[40rem] w-[40rem] opacity-50" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:py-20">
          <div>
            <Link href="/" className="group inline-flex items-center gap-3 rounded-md">
              <NovaMark className="h-7 w-7 rounded-md" />
              <span className="font-display text-[0.95rem] font-semibold tracking-[-0.02em]">WebSoroban</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
              The product builder and web IDE for Stellar: Soroban contracts, agentic payments, and subscriptions, in one workspace.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {socials.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  className="grid h-10 w-10 place-items-center rounded-md border border-border text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground"
                >
                  {item.icon}
                </a>
              ))}
              <a
                href="https://stellar.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-3 rounded-md border border-border px-3 text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em]">Built on</span>
                <span className="h-4 w-px bg-border" aria-hidden="true" />
                <Image src="/stellar-logo-white.png" alt="Stellar" width={6231} height={1560} className="h-3.5 w-auto opacity-80" />
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="eyebrow">{column.title}</h3>
              <ul className="mt-5 space-y-0.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex min-h-9 items-center gap-1 rounded-md text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 -translate-y-px opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transform-none" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* The wordmark as an outline, scaled to the exact width of the column. */}
        <div className="border-t border-border pt-8" aria-hidden="true">
          <svg className="block h-auto w-full select-none" viewBox="0 0 1200 158" fill="none" preserveAspectRatio="none">
            <text
              x="0"
              y="150"
              textLength="1200"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="var(--font-sans)"
              fontSize="196"
              fontWeight="600"
              letterSpacing="-8"
              stroke="hsl(var(--foreground) / 0.18)"
              strokeWidth="1.2"
            >
              WEBSOROBAN
            </text>
          </svg>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-border py-5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center">
          <p>© 2026 BayLeaf OÜ</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Testnet · Mainnet · operational
            </span>
            <button
              onClick={scrollToTop}
              className="group inline-flex min-h-10 items-center gap-1.5 rounded-md uppercase tracking-[0.14em] transition-colors duration-150 hover:text-foreground"
              aria-label="Back to top"
            >
              Top
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-150 motion-safe:group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PlaygroundFooter
