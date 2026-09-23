import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { themes } from '@/lib/ideas'

const featured = themes.filter((theme) => theme.id !== 'all')

export function IdeaBankBand() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow text-brand">Idea Bank</p>
            <h2 className="font-display mt-3 text-title font-semibold">
              Ten Stellar ideas, written so you can build them.
            </h2>
            <p className="lead mt-4">
              Briefs for products you can start in WebSoroban. Each one has the problem, the contracts,
              a build sequence, and the Stellar pieces to use.
            </p>
            <Link
              href="/ideas"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors duration-200 hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Open the Idea Bank
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {featured.map((theme) => (
              <li key={theme.id}>
                <Link
                  href={`/ideas?theme=${theme.id}`}
                  className="group flex items-start justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span>
                    <span className="block text-sm font-medium text-foreground">{theme.label}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{theme.blurb}</span>
                  </span>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
