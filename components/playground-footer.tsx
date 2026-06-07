'use client'

import Link from 'next/link'
import { Github, Twitter, ArrowUpRight, ArrowUp } from 'lucide-react'

export const socials = [
  { href: 'https://github.com', icon: <Github className="h-4 w-4" />, name: 'GitHub' },
  { href: 'https://twitter.com', icon: <Twitter className="h-4 w-4" />, name: 'Twitter' },
]

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'IDE', href: '/ide' },
      { label: 'Templates', href: '/marketplace' },
      { label: 'Analytics', href: '/analytics' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'Playground', href: '/contract' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy-policy' },
      { label: 'Terms', href: '/terms-of-service' },
    ],
  },
]

const PlaygroundFooter = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-background">
      {/* top hairline glow + faint radial */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[60%] -translate-x-1/2 rounded-full opacity-[0.10] blur-3xl"
        style={{ background: 'hsl(var(--brand))' }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-16">
        <div className="grid gap-12 md:grid-cols-[1.7fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/websoroban_logo.png" alt="" className="h-7 w-7 object-contain" aria-hidden />
              <span className="font-display text-lg font-semibold tracking-tight">WebSoroban</span>
            </Link>
            <p className="lead mt-4 text-sm">
              A browser IDE for Stellar smart contracts. Write Rust, compile to WASM, and deploy to
              testnet from your own wallet with zero local setup.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socials.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors duration-200 hover:border-brand/40 hover:text-foreground"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-sm text-foreground/75 transition-colors duration-200 hover:text-foreground"
                    >
                      {l.label}
                      <ArrowUpRight className="h-3 w-3 -translate-y-px opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Gradient-masked ghost wordmark — scales to fit so the full word always shows */}
        <div className="mt-14 flex justify-center" aria-hidden>
          <span className="select-none whitespace-nowrap font-display font-bold leading-none tracking-tighter text-gradient-brand opacity-[0.16] text-[clamp(2.25rem,14.5vw,12rem)]">
            WebSoroban
          </span>
        </div>
      </div>

      <div className="relative border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} WebSoroban. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Stellar Testnet · operational
            </span>
            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-200 hover:text-foreground"
              aria-label="Back to top"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PlaygroundFooter
