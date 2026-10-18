import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { IdeaBankFrame } from '@/components/ideas/frame'
import { SubmitIdeaButton } from '@/components/ideas/submit-idea'
import { getIdea, ideas, neighbors, themeLabel, type Idea } from '@/lib/ideas'

type Params = { slug: string }

export function generateStaticParams() {
  return ideas.map((idea) => ({ slug: idea.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const idea = getIdea(slug)
  if (!idea) return { title: 'Idea Bank · WebSoroban' }
  return {
    title: `${idea.number} ${idea.title} · Idea Bank`,
    description: idea.tagline,
  }
}

function sectionsFor(idea: Idea) {
  return [
    ['goal', 'Goal'],
    ['description', 'Description'],
    ['features', 'Key features'],
    ...(idea.technical ? [['technical', 'Technical direction']] : []),
    ['alignment', 'Stellar alignment'],
    ...(idea.useCases?.length ? [['use-cases', 'Use cases']] : []),
  ] as [string, string][]
}

export default async function IdeaPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const idea = getIdea(slug)
  if (!idea) notFound()
  const { prev, next } = neighbors(idea.slug)
  const sections = sectionsFor(idea)

  return (
    <IdeaBankFrame>
      <article className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-14">
        <Link
          href={`/ideas?theme=${idea.theme}`}
          className="inline-flex h-10 items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="h-4 w-4" />
          {themeLabel(idea.theme)}
        </Link>

        <header className="mt-6 border-b border-border pb-10">
          <p className="eyebrow text-brand">Idea {idea.number}</p>
          <h1 className="font-display mt-3 max-w-3xl text-display font-semibold">{idea.title}</h1>
          <p className="lead mt-4 max-w-2xl text-base md:text-lg">{idea.tagline}</p>
          <dl className="mt-6 flex flex-wrap gap-2 text-sm">
            <div className="rounded-full border border-border px-3 py-1.5">
              <dt className="sr-only">Category</dt>
              <dd>{idea.category}</dd>
            </div>
            <div className="rounded-full border border-border px-3 py-1.5 text-muted-foreground">
              <dt className="sr-only">Theme</dt>
              <dd>{themeLabel(idea.theme)}</dd>
            </div>
            {idea.by && (
              <div className="rounded-full border border-border bg-muted px-3 py-1.5">
                <dt className="sr-only">Proposed by</dt>
                <dd>by {idea.by}</dd>
              </div>
            )}
          </dl>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {idea.buildWith.map((tool) => (
              <li key={tool} className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground">
                {tool}
              </li>
            ))}
          </ul>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav aria-label="On this brief" className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow mb-3">On this brief</p>
            <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {sections.map(([id, label], index) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full"
                  >
                    <span className="font-mono text-[11px] text-brand">{String(index + 1).padStart(2, '0')}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 space-y-12">
            <Section id="goal" label="Goal">
              <p className="text-base leading-relaxed text-muted-foreground">{idea.goal}</p>
            </Section>
            <Section id="description" label="Description">
              <p className="text-base leading-relaxed text-muted-foreground">{idea.description}</p>
            </Section>

            <Section id="features" label="Key features">
              <ul className="space-y-2">
                {idea.features.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {idea.technical && (
              <Section id="technical" label="Technical direction">
                <p className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
                  {idea.technical}
                </p>
              </Section>
            )}

            <Section id="alignment" label="Stellar alignment">
              <p className="text-base leading-relaxed text-muted-foreground">{idea.alignment}</p>
            </Section>

            {idea.useCases && idea.useCases.length > 0 && (
              <Section id="use-cases" label="Use cases">
                <ul className="flex flex-wrap gap-2">
                  {idea.useCases.map((item) => (
                    <li key={item} className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {(idea.source || idea.credit) && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {idea.credit && <p>{idea.credit}</p>}
                {idea.source && (
                  <a
                    href={idea.source}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 text-foreground transition-colors duration-200 hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Discuss on the Stellar Discord
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Have an idea of your own? Send it in for the Idea Bank.</p>
              <SubmitIdeaButton />
            </div>

            <nav aria-label="More ideas" className="grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/ideas/${prev.slug}`}
                  className="rounded-xl border border-border p-4 transition-colors duration-200 hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </span>
                  <span className="mt-2 block font-display text-base font-semibold">
                    {prev.number} {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/ideas/${next.slug}`}
                  className="rounded-xl border border-border p-4 text-right transition-colors duration-200 hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="mt-2 block font-display text-base font-semibold">
                    {next.number} {next.title}
                  </span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </article>
    </IdeaBankFrame>
  )
}

function Section({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-xl font-semibold">{label}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}
