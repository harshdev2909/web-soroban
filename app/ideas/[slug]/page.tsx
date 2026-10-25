import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { IdeaBankFrame } from '@/components/ideas/frame'
import { SubmitIdeaButton } from '@/components/ideas/submit-idea'
import { Index } from '@/components/landing/chapter'
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
      <article className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:pt-14">
        <Link
          href={`/ideas?theme=${idea.theme}`}
          className="inline-flex min-h-10 items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {themeLabel(idea.theme)}
        </Link>

        <header className="mt-6 grid gap-8 border-b border-border pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-brand">Idea {idea.number}</p>
            <h1 className="mt-4 font-display text-display-lg font-medium">{idea.title}</h1>
          </div>
          <div className="lg:col-span-5">
            <p className="lead text-base">{idea.tagline}</p>
            <dl className="mt-5 flex flex-wrap gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em]">
              <div className="rounded-sm border border-border px-1.5 py-1 text-foreground">
                <dt className="sr-only">Category</dt>
                <dd>{idea.category}</dd>
              </div>
              <div className="rounded-sm border border-border px-1.5 py-1 text-muted-foreground">
                <dt className="sr-only">Theme</dt>
                <dd>{themeLabel(idea.theme)}</dd>
              </div>
              {idea.by && (
                <div className="rounded-sm border border-border bg-card px-1.5 py-1 text-muted-foreground">
                  <dt className="sr-only">Proposed by</dt>
                  <dd>by {idea.by}</dd>
                </div>
              )}
            </dl>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {idea.buildWith.map((tool) => (
                <li key={tool} className="rounded-sm border border-border px-1.5 py-1 font-mono text-[0.62rem] text-muted-foreground">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <nav aria-label="On this brief" className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow mb-3">On this brief</p>
            <ol className="flex gap-1 overflow-x-auto border-t border-border pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {sections.map(([id, label], index) => (
                <li key={id} className="lg:border-b lg:border-border">
                  <a
                    href={`#${id}`}
                    className="inline-flex min-h-10 items-center gap-3 whitespace-nowrap rounded-md px-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full lg:px-0"
                  >
                    <Index>{String(index + 1).padStart(2, '0')}</Index>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 space-y-12 lg:col-span-8 lg:col-start-5">
            <Section id="goal" label="Goal" index="01">
              <p className="text-base leading-7 text-muted-foreground">{idea.goal}</p>
            </Section>
            <Section id="description" label="Description" index="02">
              <p className="text-base leading-7 text-muted-foreground">{idea.description}</p>
            </Section>

            <Section id="features" label="Key features" index="03">
              <ul className="border-t border-border">
                {idea.features.map((item, index) => (
                  <li key={item} className="flex gap-4 border-b border-border py-3 text-sm leading-6 text-muted-foreground">
                    <Index className="pt-1">{String(index + 1).padStart(2, '0')}</Index>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {idea.technical && (
              <Section id="technical" label="Technical direction" index="04">
                <p className="rounded-md border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
                  {idea.technical}
                </p>
              </Section>
            )}

            <Section id="alignment" label="Stellar alignment" index={idea.technical ? '05' : '04'}>
              <p className="text-base leading-7 text-muted-foreground">{idea.alignment}</p>
            </Section>

            {idea.useCases && idea.useCases.length > 0 && (
              <Section id="use-cases" label="Use cases" index={idea.technical ? '06' : '05'}>
                <ul className="flex flex-wrap gap-1.5">
                  {idea.useCases.map((item) => (
                    <li key={item} className="rounded-sm border border-border px-2 py-1 font-mono text-[0.68rem] text-muted-foreground">
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
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-foreground transition-colors duration-150 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Discuss on the Stellar Discord
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-col items-start gap-4 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Have an idea of your own? Send it in for the Idea Bank.</p>
              <SubmitIdeaButton />
            </div>

            <nav aria-label="More ideas" className="grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/ideas/${prev.slug}`}
                  className="rounded-md border border-border p-4 transition-colors duration-150 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    <ArrowLeft className="h-3 w-3" /> Previous
                  </span>
                  <span className="mt-3 block font-display text-base font-medium">
                    {prev.number} {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/ideas/${next.slug}`}
                  className="rounded-md border border-border p-4 text-right transition-colors duration-150 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Next <ArrowRight className="h-3 w-3" />
                  </span>
                  <span className="mt-3 block font-display text-base font-medium">
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
  index,
  children,
}: {
  id: string
  label: string
  index: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="flex items-baseline gap-4 font-display text-xl font-medium">
        <Index>{index}</Index>
        {label}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}
