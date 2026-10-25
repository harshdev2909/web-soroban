import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowUpRight, Rocket, BookOpen, Terminal, Layers, Hammer, FlaskConical, Wallet, FileCode2, UploadCloud, Gauge, LifeBuoy, List, Play, Sparkles, Globe, type LucideIcon } from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  book: BookOpen,
  terminal: Terminal,
  layers: Layers,
  hammer: Hammer,
  flask: FlaskConical,
  wallet: Wallet,
  file: FileCode2,
  upload: UploadCloud,
  gauge: Gauge,
  help: LifeBuoy,
  list: List,
  play: Play,
  sparkles: Sparkles,
  globe: Globe,
}

/**
 * Index grid: hairline cells (1 col mobile, 2 col ≥sm). Each card is numbered
 * with a CSS counter, so MDX authors never maintain indices by hand.
 */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 grid gap-px border border-border bg-border [counter-reset:card] sm:grid-cols-2">
      {children}
    </div>
  )
}

/** Linkable section/landing card. `icon` is a key from the ICONS map. */
export function Card({
  title,
  href,
  icon,
  children,
}: {
  title: string
  href?: string
  icon?: string
  children?: ReactNode
}) {
  const Icon = icon ? ICONS[icon] : undefined
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span
          aria-hidden
          className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground before:content-[counter(card,decimal-leading-zero)]"
        />
        {href ? (
          <ArrowUpRight
            className="h-4 w-4 text-muted-foreground transition-[transform,color] duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand motion-reduce:transform-none"
            aria-hidden
          />
        ) : (
          Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="mt-5 flex items-center gap-2.5">
        {Icon && href && <Icon className="h-4 w-4 shrink-0 text-brand" aria-hidden />}
        <span className="font-display text-base font-medium text-foreground">{title}</span>
      </div>
      {children && <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{children}</p>}
    </>
  )

  const className =
    "group block bg-background p-5 transition-colors duration-150 [counter-increment:card] hover:bg-card"

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  )
}
