import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { IdeaBankFrame } from '@/components/ideas/frame'
import { getIdea, ideas, neighbors, themeLabel } from '@/lib/ideas'

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

const sections = [
  ['problem', 'Problem'],
  ['idea', 'Idea'],
  ['why', 'Why now'],
  ['story', 'User story'],
  ['flow', 'Architecture'],
  ['mvp', 'MVP'],
  ['contracts', 'Contracts'],
  ['stellar', 'Stellar features'],
  ['integrations', 'Integrations'],
  ['plan', 'Build sequence'],
  ['stretch', 'Stretch goals'],
  ['resources', 'Resources'],
] as const

export default async function IdeaPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const idea = getIdea(slug)
  if (!idea) notFound()
  const { prev, next } = neighbors(idea.slug)

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
            <div className="rounded-full border border-border bg-muted px-3 py-1.5">
              <dt className="sr-only">Difficulty</dt>
              <dd>{idea.difficulty}</dd>
            </div>
            <div className="rounded-full border border-border px-3 py-1.5 text-muted-foreground">
              <dt className="sr-only">Theme</dt>
              <dd>{themeLabel(idea.theme)}</dd>
            </div>
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
            {idea.caution && (
              <p className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm leading-relaxed text-foreground">
                {idea.caution}
              </p>
            )}

            <Section id="problem" label="Problem">
              <p className="text-base leading-relaxed text-muted-foreground">{idea.problem}</p>
            </Section>
            <Section id="idea" label="Idea">
              <p className="text-base leading-relaxed text-muted-foreground">{idea.idea}</p>
            </Section>
            <Section id="why" label="Why now">
              <p className="text-base leading-relaxed text-muted-foreground">{idea.whyNow}</p>
            </Section>
            <Section id="story" label="User story">
              <p className="text-base leading-relaxed text-muted-foreground">{idea.userStory}</p>
            </Section>

            <Section id="flow" label="Architecture">
              <ol className="border-l-2 border-brand/70 pl-5">
                {idea.flow.map((step, index) => (
                  <li key={step} className="relative pb-5 last:pb-0">
                    <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-brand" aria-hidden />
                    <p className="font-mono text-[11px] text-brand">{String(index + 1).padStart(2, '0')}</p>
                    <p className="mt-1 text-sm text-foreground">{step}</p>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="mvp" label="MVP">
              <ul className="space-y-2">
                {idea.mvp.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="contracts" label="Soroban contracts">
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {idea.contracts.map((contract) => (
                  <li key={contract.name} className="grid gap-1 bg-card px-4 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
                    <p className="font-mono text-xs text-brand">{contract.name}</p>
                    <p className="text-sm text-muted-foreground">{contract.role}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="stellar" label="Stellar features">
              <ul className="grid gap-2 sm:grid-cols-2">
                {idea.stellarFeatures.map((feature) => (
                  <li key={feature} className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="integrations" label="Suggested integrations">
              <ul className="flex flex-wrap gap-2">
                {idea.integrations.map((item) => (
                  <li key={item} className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="plan" label="Build sequence">
              <ol className="grid gap-3">
                {idea.plan.map((block) => (
                  <li key={block.step} className="grid gap-2 rounded-xl border border-border bg-card p-4 sm:grid-cols-[48px_1fr] sm:gap-4">
                    <p className="font-mono text-xs text-brand">{block.step}</p>
                    <div>
                      <p className="text-sm font-medium">{block.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{block.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="stretch" label="Stretch goals">
              <ul className="space-y-2">
                {idea.stretch.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="resources" label="Resources">
              <ul className="grid gap-2 sm:grid-cols-2">
                {idea.resources.map((resource) => {
                  const external = resource.href.startsWith('http')
                  const className =
                    'inline-flex h-11 items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 text-sm transition-colors duration-200 hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  return (
                    <li key={resource.href}>
                      {external ? (
                        <a href={resource.href} target="_blank" rel="noreferrer" className={className}>
                          {resource.label}
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ) : (
                        <Link href={resource.href} className={className}>
                          {resource.label}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Section>

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
