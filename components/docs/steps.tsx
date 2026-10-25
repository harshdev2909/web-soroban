import type { ReactNode } from "react"

/**
 * Numbered procedure. Each direct <Step title="…"> renders one numbered row
 * with a connecting rail. Usage:
 *   <Steps>
 *     <Step title="Sign in">…</Step>
 *     <Step title="Compile">…</Step>
 *   </Steps>
 */
export function Steps({ children }: { children: ReactNode }) {
  return <div className="my-6 [counter-reset:step]">{children}</div>
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative border-l border-border pb-7 pl-9 [counter-increment:step] last:border-l-transparent last:pb-0">
      <span
        aria-hidden
        className="absolute -left-[13px] top-0 grid h-[26px] w-[26px] place-items-center rounded-sm border border-border bg-card font-mono text-[0.68rem] text-brand before:content-[counter(step,decimal-leading-zero)]"
      />
      <h3 className="!mt-0 mb-1.5 font-display text-base font-medium text-foreground">{title}</h3>
      <div className="text-sm leading-relaxed text-foreground/90 [&>*+*]:mt-2 [&_a]:text-brand [&_a:hover]:underline">
        {children}
      </div>
    </div>
  )
}
