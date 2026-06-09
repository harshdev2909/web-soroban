import type { ReactNode } from "react"
import { Info, Lightbulb, TriangleAlert, OctagonAlert } from "lucide-react"
import { cn } from "@/lib/utils"

type CalloutType = "note" | "tip" | "warning" | "danger"

const STYLES: Record<CalloutType, { icon: typeof Info; ring: string; tint: string; label: string }> = {
  note: { icon: Info, ring: "border-info/30", tint: "bg-info/[0.06] text-info", label: "Note" },
  tip: { icon: Lightbulb, ring: "border-success/30", tint: "bg-success/[0.06] text-success", label: "Tip" },
  warning: { icon: TriangleAlert, ring: "border-warning/30", tint: "bg-warning/[0.07] text-warning", label: "Warning" },
  danger: { icon: OctagonAlert, ring: "border-destructive/30", tint: "bg-destructive/[0.06] text-destructive", label: "Danger" },
}

/** Admonition. Usage: <Callout type="warning" title="...">body</Callout> */
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutType
  title?: string
  children: ReactNode
}) {
  const s = STYLES[type]
  const Icon = s.icon
  return (
    <div className={cn("my-5 flex gap-3 rounded-lg border px-4 py-3", s.ring, s.tint.split(" ")[0])}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", s.tint.split(" ")[1])} aria-hidden />
      <div className="min-w-0 text-sm leading-relaxed text-foreground/90 [&>*+*]:mt-2 [&_a]:text-brand [&_a:hover]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]">
        <p className={cn("font-medium", s.tint.split(" ")[1])}>{title ?? s.label}</p>
        {children}
      </div>
    </div>
  )
}
