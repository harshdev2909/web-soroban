import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { IdeaBankFrame } from '@/components/ideas/frame'
import { SubmitIdeaButton } from '@/components/ideas/submit-idea'
import { Index } from '@/components/landing/chapter'
import { ideas, themeLabel, themes, type ThemeId } from '@/lib/ideas'
import { getCommunityIdeas } from '@/lib/ideasApi'

export const metadata: Metadata = {
  title: 'Idea Bank · WebSoroban',
  description:
    'Stellar ideas worth building: passkey and Google sign-in wallets, USDC subscriptions, payment links, prediction markets, and more. Submit your own.',
}

const themeIds = new Set(themes.map((theme) => theme.id))

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>
}) {
  const { theme: raw } = await searchParams
  const theme = raw && themeIds.has(raw as ThemeId | 'all') ? (raw as ThemeId | 'all') : 'all'
  const visible = theme === 'all' ? ideas : ideas.filter((idea) => idea.theme === theme)
  const activeTheme = themes.find((item) => item.id === theme) ?? themes[0]
  const community = theme === 'all' ? await getCommunityIdeas() : []

  return (
    <IdeaBankFrame>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 pb-12 pt-14 lg:grid-cols-12 lg:items-end lg:pt-20">
          <div className="lg:col-span-7">
            <p className="eyebrow">Idea Bank · {String(ideas.length).padStart(2, '0')} briefs</p>
            <h1 className="mt-4 font-display text-display-lg font-medium">Build something worth shipping.</h1>
          </div>
          <div className="lg:col-span-5">
            <p className="lead text-base">
              Ideas from the Stellar community for wallets, payments, and markets, each with the goal, the
              features, and why it matters for Stellar. Have one of your own? Submit it, and the team will
              feature the ones worth building.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <SubmitIdeaButton variant="solid" />
              <Link
                href="/docs"
                className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Read the Soroban docs
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
        <div className="flex gap-1.5 overflow-x-auto pb-2" role="tablist" aria-label="Idea themes">
          {themes.map((item) => {
            const selected = item.id === theme
            return (
              <Link
                key={item.id}
                href={item.id === 'all' ? '/ideas' : `/ideas?theme=${item.id}`}
                role="tab"
                aria-selected={selected}
                className={
                  selected
                    ? 'inline-flex min-h-9 shrink-0 items-center rounded-sm border border-foreground bg-card px-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                    : 'inline-flex min-h-9 shrink-0 items-center rounded-sm border border-border px-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                }
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{activeTheme.blurb}</p>

        {visible.length === 0 ? (
          <div className="figure mt-10 max-w-xl p-6">
            <p className="eyebrow">Empty theme</p>
            <p className="mt-4 font-display text-xl font-medium">No briefs in this theme.</p>
            <p className="mt-2 text-sm text-muted-foreground">The bank has {ideas.length} ideas across {themes.length - 1} themes.</p>
            <Link
              href="/ideas"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Show all ideas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {visible.map((idea) => (
              <li key={idea.slug}>
                <Link
                  href={`/ideas/${idea.slug}`}
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors duration-150 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Index className="text-brand">{idea.number}</Index>
                    <span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                      {idea.category}
                    </span>
                  </div>
                  <h2 className="mt-6 font-display text-xl font-medium">{idea.title}</h2>
                  <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {themeLabel(idea.theme)}
                    {idea.by && (
                      <>
                        <span className="px-1.5 text-border">/</span>
                        by {idea.by}
                      </>
                    )}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{idea.tagline}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {idea.buildWith.slice(0, 4).map((tool) => (
                      <li key={tool} className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.62rem] text-muted-foreground">
                        {tool}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-5 inline-flex items-center gap-1.5 border-t border-border pt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-foreground">
                    Open the brief
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {community.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow">From the community</p>
                <h2 className="mt-4 font-display text-display font-medium">Ideas people sent in.</h2>
              </div>
              <p className="text-sm leading-6 text-muted-foreground lg:col-span-5">
                Submitted through the Idea Bank and picked by the WebSoroban team.
              </p>
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {community.map((idea, index) => (
                <li key={idea.id} className="flex flex-col rounded-lg border border-border bg-card p-5">
                  <Index>{String(index + 1).padStart(2, '0')}</Index>
                  <h3 className="mt-4 font-display text-xl font-medium">{idea.title}</h3>
                  <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">by {idea.author}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{idea.goal}</p>
                  <details className="group mt-4 flex-1">
                    <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      Read the idea
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-open:rotate-90 motion-reduce:transform-none" />
                    </summary>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                      {idea.description}
                    </p>
                    {idea.alignment && (
                      <>
                        <p className="eyebrow mt-4">Stellar alignment</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {idea.alignment}
                        </p>
                      </>
                    )}
                  </details>
                  {idea.link && (
                    <a
                      href={idea.link}
                      target="_blank"
                      rel="noreferrer nofollow ugc"
                      className="mt-4 inline-flex min-h-10 items-center gap-1.5 self-start font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    >
                      Discussion
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Submit</p>
            <h2 className="mt-3 font-display text-xl font-medium">Got an idea for Stellar?</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              Send it in. The team reviews every submission and features the ones worth building, with credit to you.
            </p>
          </div>
          <SubmitIdeaButton />
        </div>
      </section>
    </IdeaBankFrame>
  )
}
