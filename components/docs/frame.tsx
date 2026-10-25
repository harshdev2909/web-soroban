import type { ReactNode } from "react"

/**
 * Captioned media figure for screenshots/diagrams, in the same frame as the
 * landing figures. Pass a real `alt` on the <img> child for accessibility;
 * `caption` renders below as a mono label.
 */
export function Frame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="my-6">
      <div className="figure ticks overflow-hidden p-1.5">
        <div className="overflow-hidden rounded-md [&_img]:w-full [&_img]:rounded-md">{children}</div>
      </div>
      {caption && (
        <figcaption className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  )
}
