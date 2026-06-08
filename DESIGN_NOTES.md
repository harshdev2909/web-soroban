# WebSoroban — Design Notes

The visual system for the WebSoroban frontend. Read this before adding UI so new
work stays consistent. Stack: **Next.js (App Router) + TypeScript + Tailwind +
shadcn/ui**, icons from `lucide-react`, motion from `framer-motion`.

## Identity

"Deep space, refined." A near-black canvas with **one** confident electric-iris
accent (the brand). Restraint over neon: subtle radial glows, a faint dot grid,
and light film grain instead of glow overload. Dark-first, with a genuinely
usable light mode.

## Color tokens

All color is driven by CSS variables in `app/globals.css` (HSL channels) and
exposed to Tailwind in `tailwind.config.ts`. **Never hardcode hex/slate colors** —
use the semantic classes.

| Token | Tailwind class | Role |
| --- | --- | --- |
| `--background` / `--foreground` | `bg-background` / `text-foreground` | Canvas + primary text |
| `--card` / `--card-foreground` | `bg-card` | Panels, cards, surfaces |
| `--popover` | `bg-popover` | Menus, dialogs, palette |
| `--muted` / `--muted-foreground` | `bg-muted` / `text-muted-foreground` | Secondary surfaces + text |
| `--accent` | `bg-accent` | Hover/active surface |
| `--border` / `--input` | `border-border` | Hairlines, inputs |
| `--primary` / `--brand` | `bg-primary` / `text-brand` | The electric-iris accent (same hue) |
| `--cosmic` | `text-cosmic` | Secondary accent — **gradients only**, never solo CTAs |
| `--success` / `--warning` / `--destructive` / `--info` | `text-success` … | Semantic status |
| `--ring` | `ring-ring` | Focus ring (matches brand) |

Semantic colors each pair with a muted badge variant via opacity (e.g.
`bg-success/12 text-success`, `bg-warning/15 text-warning`). Use these for
badges/pills — never a raw fill behind body text.

Dark brand hue: `hsl(250 86% 66%)`. Light: `hsl(250 80% 58%)`. White text on the
brand fill is used for primary buttons (large/medium semibold labels — meets AA at
those sizes; body text never sits on raw brand).

Helper classes: `.text-gradient-brand`, `.bg-space` (dot grid), `.grain`,
`bg-radial-fade`, `bg-brand-gradient`, `.font-mono-tnum` (tabular addresses/numbers).

## Typography

Fonts are wired with `next/font` in `app/layout.tsx` and exposed as CSS vars:

- **Display** — `Space_Grotesk` → `--font-display` → `font-display`. Headings only.
- **Sans (UI)** — `GeistSans` → `--font-sans` → default `font-sans`.
- **Mono** — `GeistMono` → `--font-mono` → `font-mono`. Code, addresses, IDs, metrics.

Display scale lives in `tailwind.config.ts`: `text-display-lg`, `text-display`,
`text-title` (all use tight tracking + clamp() for fluid sizing).

## Spacing, radius, elevation

- Spacing/sizing: Tailwind scale only (`p-4`, `gap-2`, `h-9`). No magic px.
- Radius: `--radius: 0.625rem`; use `rounded-lg/md/sm/xl` (derived).
- Shadows: `shadow-xs/sm/md/lg` (tuned for a dark canvas) and `shadow-glow` /
  `shadow-glow-sm` for the rare brand-lit element. Prefer borders + subtle shadow
  over heavy glow.

## Motion

- `framer-motion` for orchestrated entrances; CSS transitions for hover/press.
- Use the `Reveal` component (`components/reveal.tsx`) for scroll fade-up — it
  already respects `prefers-reduced-motion` (renders static).
- `app/globals.css` has a global reduced-motion guard. Keep animations purposeful;
  durations 150–600ms, ease `[0.16, 1, 0.3, 1]`.

## Components & conventions

- Build on **shadcn/ui** primitives (`components/ui/*`); they consume the tokens,
  so theming is automatic. Add new ones with `npx shadcn@latest add <name>`.
- **Buttons:** `default` = brand primary (main CTA), `outline` = secondary action,
  `ghost` = tertiary/icon. One primary action per view.
- **Badges/pills:** semantic tokens (`text-success`, `border-warning/30`, …).
- **WalletWidget** (`components/wallet-widget.tsx`): the per-user testnet wallet —
  public key (copyable), balance, funded status, faucet. Never renders the secret.
- **CommandPalette** (`components/command-palette.tsx`): Cmd/Ctrl-K; pass grouped
  `PaletteCommand[]`. Registers its own shortcut. Raised surface with a blurred
  backdrop (the shared `DialogOverlay` now has `backdrop-blur-sm`), grouped results
  with iconified rows, `kbd` hints per item, and a keyboard-hint footer.
- **Reveal**: scroll-in wrapper for landing/marketing sections.

### IDE screen conventions (`/ide`)

The IDE is a three-zone layout with one focal point and one accent action:

- **Hierarchy by weight, not borders.** Panels are flat surfaces separated by a
  single hairline + background tint (`bg-sidebar`, `bg-card/40`). Reserve
  `shadow-md`/`shadow-lg` for genuinely raised things (palette, popovers).
- **One accent action per view:** **Deploy** is the only brand-filled button on
  screen. Compile is `outline`; right-panel actions are `outline`/ghost; quiet
  actions (New file, Save, Clear results) are icon buttons or ghost text.
- **Left rail** (`components/sidebar.tsx`): Explorer is the primary content. Stats
  are a single slim row (`N files · N deploys · edited …`), not tiles. File rows
  use a consistent Lucide icon set by extension (`.rs` brand, `.toml` warning,
  `.json` info) with a sliding `motion` active bar (`layoutId="file-active-bar"`).
- **Editor** (`components/editor-panel.tsx`): the hero. Tabs use a shared-layout
  `motion` underline (`layoutId="editor-tab-underline"`). It owns no status chips —
  it reports cursor position up via `onCursorChange`.
- **Right panel** (`components/right-panel.tsx`): collapsible (toggle in the status
  bar / panel header), never equal weight. Metadata + Network are consolidated into
  one **Info** block (Created · Last deployed · RPC · Deploy wallet · Contract ID).
  Empty states are explicit ("No tests run yet", "No deploys yet", "Never").
- **Status bar** (`components/status-bar.tsx`): one slim full-width bar. Left =
  console toggle + language/encoding/EOL/indent; right = `Ln/Col`, char/line
  counts, problems (errors/warnings, click → console), network pill, version,
  panel toggle. This replaces all previously scattered status chips.
- **Plan & usage:** a popover from the navbar plan badge with two thin meters
  (deploys, function tests) + upgrade — there is no separate usage sub-bar.
- **Loading:** `IDESkeleton` renders the three-zone shell with `Skeleton` blocks
  (explorer rows, editor lines, panel cards) instead of a bare spinner.

## Accessibility (non-negotiable)

- Real `<button>`/`<a>` for interactions; visible focus ring via global
  `:focus-visible` (brand ring + offset). Don't strip outlines.
- Icons are `aria-hidden` or have `aria-label`; images have `alt`.
- Touch targets ≥ ~40px (icon buttons are `h-9 w-9`).
- Contrast targets WCAG AA; muted-on-card text is tuned to pass for body sizes.

## What was removed

API keys, webhooks, the RPC tester, and the blockchain explorer are gone (routes,
`components/devtools`, `lib/devApi.ts`, nav entries). Deploy results are shown
**inline** (contract id + copy), not via an external explorer.
