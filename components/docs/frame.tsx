import type { ReactNode } from "react"

/**
 * Bordered, captioned media container for screenshots/diagrams. Pass a real
 * `alt` on the <img> child for accessibility; `caption` renders below.
 */
export function Frame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="my-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card/40 p-2 shadow-sm">
        <div className="overflow-hidden rounded-lg [&_img]:w-full [&_img]:rounded-lg">{children}</div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  )
}
