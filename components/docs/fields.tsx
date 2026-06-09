import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * API parameter / response field rows. Usage:
 *   <ParamField name="functionName" type="string" required>…</ParamField>
 *   <ResponseField name="contractAddress" type="string">…</ResponseField>
 */
function Field({
  name,
  type,
  required,
  badge,
  children,
}: {
  name: string
  type?: string
  required?: boolean
  badge?: string
  children?: ReactNode
}) {
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem] font-medium text-foreground">
          {name}
        </code>
        {type && <span className="font-mono text-xs text-muted-foreground">{type}</span>}
        {required && (
          <span className="rounded-full border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
            required
          </span>
        )}
        {badge && (
          <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      {children && (
        <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]">
          {children}
        </div>
      )}
    </div>
  )
}

function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("my-5 rounded-lg border border-border bg-card/40 px-4", className)}>{children}</div>
}

export function ParamField(props: Parameters<typeof Field>[0]) {
  return <Field {...props} />
}
export function ResponseField(props: Parameters<typeof Field>[0]) {
  return <Field {...props} />
}
export { FieldGroup }
