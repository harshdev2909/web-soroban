import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { themes } from '@/lib/ideas'
import { Chapter, ChapterHeading, Index } from '@/components/landing/chapter'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'

const featured = themes.filter((theme) => theme.id !== 'all')

export function IdeaBankBand() {
  return (
    <Chapter index="04" label="Idea Bank" figure={`fig. 04 · ${featured.length} themes`} id="ideas" className="pt-24 lg:pt-32">
      <ChapterHeading
        title="Stellar ideas worth building, from the community."
        lead="Wallets, payments, and markets you can start in WebSoroban. Each idea has the goal, the key features, and why it matters for Stellar."
        aside={
          <Button asChild variant="outline" size="sm">
            <Link href="/ideas">Open the Idea Bank <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        }
      />
      <Reveal className="mt-14 lg:mt-20">
        <ul className="border-t border-border">
          {featured.map((theme, index) => (
            <li key={theme.id}>
              <Link
                href={`/ideas?theme=${theme.id}`}
                className="group grid min-h-16 grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-border py-4 transition-colors duration-150 hover:bg-card md:grid-cols-[3rem_14rem_1fr_auto]"
              >
                <Index>0{index + 1}</Index>
                <span className="font-display text-lg font-medium text-foreground">{theme.label}</span>
                <span className="col-span-3 text-sm text-muted-foreground md:col-span-1">{theme.blurb}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-[transform,color] duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand motion-reduce:transform-none" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </Chapter>
  )
}
