import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight, Rocket, BookOpen, Terminal, Layers, Hammer, FlaskConical, Wallet, FileCode2, UploadCloud, Gauge, LifeBuoy, List, Play, Sparkles, Globe, type LucideIcon } from "lucide-react"

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

/** Responsive index grid of cards (1 col mobile, 2 col ≥sm). */
export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="my-6 grid gap-3 sm:grid-cols-2">{children}</div>
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
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-md border border-border bg-muted/50 text-brand">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <span className="font-medium text-foreground">{title}</span>
        {href && (
          <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden />
        )}
      </div>
      {children && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>}
    </>
  )

  const className =
    "group block rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-brand/40 hover:bg-accent/40"

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  )
}
