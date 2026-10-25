import type { ReactNode } from "react"
import { Info, Lightbulb, TriangleAlert, OctagonAlert } from "lucide-react"
import { cn } from "@/lib/utils"

type CalloutType = "note" | "info" | "tip" | "warning" | "danger"

const STYLES: Record<CalloutType, { icon: typeof Info; accent: string; text: string; label: string }> = {
  note: { icon: Info, accent: "border-l-info", text: "text-info", label: "Note" },
  info: { icon: Info, accent: "border-l-info", text: "text-info", label: "Info" },
  tip: { icon: Lightbulb, accent: "border-l-success", text: "text-success", label: "Tip" },
  warning: { icon: TriangleAlert, accent: "border-l-warning", text: "text-warning", label: "Warning" },
  danger: { icon: OctagonAlert, accent: "border-l-destructive", text: "text-destructive", label: "Danger" },
}

/** Admonition: a hairline frame with a 2px semantic rule on the left. Usage: <Callout type="warning" title="...">body</Callout> */
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutType
  title?: string
  children: ReactNode
}) {
  const s = STYLES[type] ?? STYLES.note
  const Icon = s.icon
  return (
    <div className={cn("my-5 flex gap-3 rounded-md border border-border border-l-2 bg-card px-4 py-3.5", s.accent)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", s.text)} aria-hidden />
      <div className="min-w-0 text-sm leading-relaxed text-foreground/90 [&>*+*]:mt-2 [&_a]:text-brand [&_a:hover]:underline [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]">
        <p className={cn("font-mono text-[0.68rem] uppercase tracking-[0.16em]", s.text)}>{title ?? s.label}</p>
        {children}
      </div>
    </div>
  )
}
