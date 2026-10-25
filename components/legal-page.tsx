"use client"

import { useState, type ReactNode } from "react"
import PlaygroundNavbar from "@/components/playground-navbar"
import PlaygroundFooter from "@/components/playground-footer"
import { LoginModal } from "@/components/login-modal"
import { Reveal } from "@/components/reveal"

interface LegalPageProps {
  title: string
  effective?: string
  updated: string
  intro: string
  children: ReactNode
}

/** Shared chrome + readable typography for legal pages (privacy, terms). */
export function LegalPage({ title, effective, updated, intro, children }: LegalPageProps) {
  const [loginOpen, setLoginOpen] = useState(false)
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      <main className="mx-auto max-w-7xl px-6">
        <section className="border-b border-border pb-12 pt-14 lg:pt-20">
          <Reveal className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow">Legal</p>
              <h1 className="mt-4 font-display text-display-lg font-medium">{title}</h1>
              <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                {effective && (
                  <div className="flex gap-2">
                    <dt>Effective</dt>
                    <dd className="text-foreground">{effective}</dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt>Updated</dt>
                  <dd className="text-foreground">{updated}</dd>
                </div>
              </dl>
            </div>
            <p className="lead text-base lg:col-span-5">{intro}</p>
          </Reveal>
        </section>

        <Reveal delay={0.06}>
          <div className="max-w-3xl pb-24 pt-4">{children}</div>
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
    <section className="border-b border-border py-8 last:border-b-0">
      <h2 className="font-display text-xl font-medium text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-[15px] leading-7 text-muted-foreground">{children}</div>
    </section>
  )
}

/** A bulleted list with hairline markers. */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-[0.8rem] h-px w-3 shrink-0 bg-muted-foreground/60" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Responsive table for legal pages. */
export function LegalTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-card">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 font-mono text-[0.62rem] font-normal uppercase tracking-[0.14em] text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 align-top text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
