'use client'

import Link from 'next/link'
import { Github, Twitter } from 'lucide-react'

export const socials = [
  { href: 'https://github.com', icon: <Github className="h-4 w-4" />, name: 'GitHub' },
  { href: 'https://twitter.com', icon: <Twitter className="h-4 w-4" />, name: 'Twitter' },
]

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'IDE', href: '/ide' },
      { label: 'Templates', href: '/marketplace' },
      { label: 'Docs', href: '/docs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
    ],
  },
]

const PlaygroundFooter = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/websoroban_logo.png" alt="" className="h-7 w-7 object-contain" aria-hidden />
            <span className="font-display text-lg font-semibold tracking-tight">WebSoroban</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A browser IDE for Stellar smart contracts. Write Rust, compile to WASM, and deploy to
            testnet from your own wallet — zero local setup.
          </p>
          <div className="mt-6 flex gap-2">
            {socials.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.name}
                className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {footerLinks.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} WebSoroban. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
            Stellar Testnet · operational
          </p>
        </div>
      </div>
    </footer>
  )
}

export default PlaygroundFooter
