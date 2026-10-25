import { cn } from "@/lib/utils"

type Tone = "read-only" | "signed" | "testnet" | "neutral" | "brand"

const TONES: Record<Tone, string> = {
  "read-only": "border-info/40 text-info",
  signed: "border-warning/40 text-warning",
  testnet: "border-success/40 text-success",
  neutral: "border-border text-muted-foreground",
  brand: "border-brand/40 text-brand",
}

/** Small inline status label in mono. Usage: <Badge tone="read-only">read-only</Badge> */
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border bg-card px-1.5 py-0.5 align-middle font-mono text-[0.62rem] uppercase leading-none tracking-[0.14em]",
        TONES[tone],
      )}
    >
      {children}
    </span>
  )
}
