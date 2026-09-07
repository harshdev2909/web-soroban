import type { ReactNode } from 'react'

export type NovaGlyphProps = {
  className?: string
  title?: string
}

type GlyphShellProps = NovaGlyphProps & {
  children: ReactNode
}

function GlyphShell({ children, className, title }: GlyphShellProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      focusable="false"
      {...(title ? { role: 'img' as const } : { 'aria-hidden': true as const })}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

/** WebSoroban's central build core with four connected product surfaces. */
export function NovaCoreGlyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <path d="M9.25 12a2.75 2.75 0 1 0 5.5 0 2.75 2.75 0 0 0-5.5 0Z" />
      <path d="M12 9.25V5.5M14.75 12h3.75M12 14.75v3.75M9.25 12H5.5" />
      <rect x="9.75" y="2.5" width="4.5" height="3" rx="1.5" />
      <rect x="18.5" y="9.75" width="3" height="4.5" rx="1.5" />
      <rect x="9.75" y="18.5" width="4.5" height="3" rx="1.5" />
      <rect x="2.5" y="9.75" width="3" height="4.5" rx="1.5" />
      <path d="M7.1 4.6A9 9 0 0 0 4.6 7.1M16.9 19.4a9 9 0 0 0 2.5-2.5" />
    </GlyphShell>
  )
}

/** A composed browser canvas rather than a generic globe. */
export function WebAppGlyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <rect x="2.75" y="3.25" width="18.5" height="17.5" rx="3" />
      <path d="M2.75 8h18.5" />
      <circle cx="6" cy="5.65" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="5.65" r="0.65" fill="currentColor" stroke="none" />
      <path d="M6.25 11.25v6.25M9.5 11.25h7.75M9.5 14.4h5.25M9.5 17.5h3.25" />
    </GlyphShell>
  )
}

/** A deployable contract cell containing a compact code expression. */
export function SorobanGlyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <path d="m8 3.25 8 0 4 4v9.5l-4 4H8l-4-4v-9.5l4-4Z" />
      <path d="M8.75 8.25 6.5 12l2.25 3.75M15.25 8.25 17.5 12l-2.25 3.75M13.4 7.75l-2.8 8.5" />
      <path d="M8 3.25v2M16 18.75v2" />
    </GlyphShell>
  )
}

/** An HTTP request crossing a metered payment gate and continuing. */
export function X402Glyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <path d="M2.75 7.25h7.5M7.75 4.75l2.5 2.5-2.5 2.5" />
      <rect x="10.25" y="3" width="5.5" height="18" rx="2.75" />
      <path d="M12.05 9.25h1.9M12.05 12h1.9M12.05 14.75h1.9" />
      <path d="M15.75 16.75h5.5M18.75 14.25l2.5 2.5-2.5 2.5" />
      <circle cx="5" cy="16.75" r="1.75" />
      <path d="M5 14.95v3.6" />
    </GlyphShell>
  )
}

/** Machine-payment packets negotiated between two autonomous peers. */
export function MppGlyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <path d="M8.5 5.25H6.25a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3H8.5" />
      <path d="M15.5 5.25h2.25a3 3 0 0 1 3 3v7.5a3 3 0 0 1-3 3H15.5" />
      <path d="M6.75 9.25h2.5M17.25 14.75h-2.5" />
      <circle cx="9.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="m7.75 7.75 1.5 1.5-1.5 1.5M16.25 13.25l-1.5 1.5 1.5 1.5" />
    </GlyphShell>
  )
}

/** A self-contained validator stack surrounded by a resettable ledger loop. */
export function LocalnetGlyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <rect x="7" y="7" width="10" height="10" rx="2.5" />
      <path d="M9.5 10.25h5M9.5 13.75h3" />
      <circle cx="14.75" cy="13.75" r="0.7" fill="currentColor" stroke="none" />
      <path d="M7.2 3.85A9.2 9.2 0 0 1 20.85 10M20.85 10l-2.6-1.8M20.85 10l1.4-2.85" />
      <path d="M16.8 20.15A9.2 9.2 0 0 1 3.15 14M3.15 14l2.6 1.8M3.15 14l-1.4 2.85" />
    </GlyphShell>
  )
}

/** Ledger rows sealed by a compact zero-knowledge proof mark. */
export function DataProofGlyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <path d="M3.25 6.25c0-1.65 3.05-3 6.8-3s6.8 1.35 6.8 3-3.05 3-6.8 3-6.8-1.35-6.8-3Z" />
      <path d="M3.25 6.25v8c0 1.65 3.05 3 6.8 3 .65 0 1.28-.04 1.85-.12M3.25 10.25c0 1.65 3.05 3 6.8 3 .72 0 1.41-.05 2.04-.14" />
      <path d="m16.75 11 4 2.05v3.1c0 2.12-1.5 3.93-4 4.6-2.5-.67-4-2.48-4-4.6v-3.1l4-2.05Z" />
      <path d="m14.9 15.85 1.2 1.2 2.5-2.65" />
    </GlyphShell>
  )
}

/** An autonomous request entering a routed decision orbit and leaving as a packet. */
export function AgentRelayGlyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <path d="M2.75 7.25h4.5l2.2 2.2" />
      <path d="m5.25 4.75 2.5 2.5-2.5 2.5" />
      <path d="M9.45 9.45a5.2 5.2 0 1 0 6.8-.55" />
      <circle cx="13.05" cy="13.05" r="2.15" />
      <circle cx="16.65" cy="7.15" r="1.35" fill="currentColor" stroke="none" />
      <path d="M15.15 14.5 19 18.35h2.25" />
      <circle cx="21.25" cy="18.35" r="0.85" fill="currentColor" stroke="none" />
    </GlyphShell>
  )
}

/** A Stellar settlement core crossed by WebSoroban's transaction orbit. */
export function StellarSettlementGlyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <circle cx="12" cy="12" r="7.25" />
      <path d="M4.1 10.15c2.3-3.35 6.4-4.85 10.1-3.55 2.55.9 4.45 2.75 5.7 5.05" />
      <path d="M3.25 13.35c2.9 3.95 8.25 5.25 12.7 2.85 2.25-1.2 3.9-3.15 4.8-5.4" />
      <path d="m7.15 17 9.7-10" />
      <circle cx="7.45" cy="16.65" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="16.65" cy="7.2" r="1.15" fill="currentColor" stroke="none" />
    </GlyphShell>
  )
}

/** A closed verification orbit locked by a proof diamond. */
export function ProofSealGlyph(props: NovaGlyphProps) {
  return (
    <GlyphShell {...props}>
      <path d="M17.9 7.1A7.4 7.4 0 1 0 19.35 15" />
      <path d="M18.05 3.35v3.9h3.9" />
      <path d="m12 7.75 4.25 4.25L12 16.25 7.75 12 12 7.75Z" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
      <path d="M4.45 7.7 2.6 6.85M19.55 16.3l1.85.85" />
    </GlyphShell>
  )
}
