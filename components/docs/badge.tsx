import { cn } from "@/lib/utils"

type Tone = "read-only" | "signed" | "testnet" | "neutral" | "brand"

const TONES: Record<Tone, string> = {
  "read-only": "border-info/30 bg-info/10 text-info",
  signed: "border-warning/30 bg-warning/10 text-warning",
  testnet: "border-success/30 bg-success/10 text-success",
  neutral: "border-border bg-muted text-muted-foreground",
  brand: "border-brand/30 bg-brand/10 text-brand",
}

/** Small inline status pill. Usage: <Badge tone="read-only">read-only</Badge> */
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 align-middle font-mono text-[11px] font-medium leading-none",
        TONES[tone],
      )}
    >
      {children}
    </span>
  )
}
