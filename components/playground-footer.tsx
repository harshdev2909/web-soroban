'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useReducedMotion } from 'framer-motion'
import { Github, Twitter, ArrowUpRight, ArrowUp } from 'lucide-react'
import { NovaMark } from '@/components/nova-mark'

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
      { label: 'Templates', href: '/marketplace' },
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
  const reduce = useReducedMotion()
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })

  return (
    <footer id="site-footer" className="relative bg-background px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-foreground text-background shadow-2xl shadow-foreground/10">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-28 h-96 w-96 text-background/10"
          viewBox="0 0 400 400"
          fill="none"
        >
          <path d="M31 203c36-89 105-147 194-157 84-9 137 37 145 105 8 69-38 143-112 181-77 39-165 27-206-31-21-30-28-64-21-98Z" stroke="currentColor" />
          <path d="M75 208c30-65 85-107 151-112 63-5 101 29 105 79 5 51-31 104-87 131-57 27-120 17-148-26-14-21-21-47-21-72Z" stroke="currentColor" />
          <circle cx="315" cy="99" r="8" fill="currentColor" />
          <circle cx="90" cy="297" r="4" fill="currentColor" />
        </svg>

        <div className="relative px-6 pt-14 sm:px-8 md:px-10 md:pt-16">
          <div className="grid gap-12 md:grid-cols-[1.7fr_1fr_1fr_1fr]">
            <div>
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-4 focus-visible:ring-offset-foreground"
              >
                <NovaMark className="rounded-xl bg-background text-foreground transition-transform duration-200 motion-safe:group-hover:-rotate-3 motion-reduce:transform-none" />
                <span className="font-display text-lg font-semibold tracking-tight">WebSoroban</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-6 text-background/60">
                The AI product builder and web IDE for Stellar applications, agentic payments, contracts, and data.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {socials.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.name}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-background/20 bg-background/5 text-background/60 transition-[background-color,border-color,color,transform] duration-150 hover:border-background/40 hover:bg-background/10 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
                  >
                    {item.icon}
                  </a>
                ))}
                <a
                  href="https://stellar.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-background/20 bg-background/5 px-3 text-background/55 transition-[background-color,border-color,color,transform] duration-150 hover:border-background/40 hover:bg-background/10 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
                >
                  <span className="font-mono text-xs uppercase tracking-wider">Built on</span>
                  <span className="h-4 w-px bg-background/20" aria-hidden="true" />
                  <Image
                    src="/stellar-logo-white.png"
                    alt="Stellar"
                    width={6231}
                    height={1560}
                    className="h-4 w-auto"
                  />
                </a>
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-mono text-xs uppercase tracking-widest text-background/50">{col.title}</h3>
                <ul className="mt-4 space-y-1">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="group inline-flex min-h-10 items-center gap-1 rounded-lg text-sm text-background/70 transition-colors duration-150 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
                      >
                        {l.label}
                        <ArrowUpRight className="h-3 w-3 -translate-y-px opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transform-none" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex justify-center" aria-hidden="true">
            <span className="w-full select-none whitespace-nowrap text-center font-display text-[clamp(2rem,9vw,12rem)] font-bold leading-none tracking-tighter text-background opacity-[0.06]">
              WEBSOROBAN
            </span>
          </div>
        </div>

        <div className="relative border-t border-background/15">
          <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 text-xs text-background/50 sm:flex-row sm:px-8 md:px-10">
            <div className="max-w-2xl text-center sm:text-left">
              <p>© 2026 BayLeaf OÜ. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                Stellar Mainnet · operational
              </span>
              <button
                onClick={scrollToTop}
                className="group inline-flex min-h-10 items-center gap-1.5 rounded-lg text-background/50 transition-colors duration-150 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
                aria-label="Back to top"
              >
                Back to top
                <ArrowUp className="h-3.5 w-3.5 transition-transform duration-150 motion-safe:group-hover:-translate-y-0.5 motion-reduce:transform-none" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PlaygroundFooter
