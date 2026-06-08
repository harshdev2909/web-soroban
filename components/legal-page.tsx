"use client"

import { useState, type ReactNode } from "react"
import PlaygroundNavbar from "@/components/playground-navbar"
import PlaygroundFooter from "@/components/playground-footer"
import { LoginModal } from "@/components/login-modal"
import { Reveal } from "@/components/reveal"

interface LegalPageProps {
  title: string
  updated: string
  intro: string
  children: ReactNode
}

/** Shared chrome + readable typography for legal pages (privacy, terms). */
export function LegalPage({ title, updated, intro, children }: LegalPageProps) {
  const [loginOpen, setLoginOpen] = useState(false)
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" aria-hidden />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        <section className="pb-8 pt-12 sm:pt-16">
          <Reveal>
            <p className="eyebrow">Legal</p>
            <h1 className="mt-3 font-display text-title font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground">Last updated · {updated}</p>
            <p className="lead mt-4 max-w-2xl text-[15px]">{intro}</p>
          </Reveal>
        </section>

        <Reveal delay={0.06}>
          <div className="space-y-9 pb-20">{children}</div>
        </Reveal>
      </main>

      <PlaygroundFooter />
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}

/** A numbered/titled section block. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-foreground/75">{children}</div>
    </section>
  )
}

/** A bulleted list with branded markers. */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
