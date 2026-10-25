# WebSoroban — Design Notes

The visual system for the WebSoroban frontend. Read this before adding UI so new
work stays consistent. Stack: **Next.js (App Router) + TypeScript + Tailwind +
shadcn/ui**, icons from `lucide-react`, motion from `framer-motion`, the hero
sculpture in `three` through `@react-three/fiber`.

## Identity

"Observatory." One dark, warm near-black canvas for every surface: the landing
story, the product pages, the docs, and the IDE. Warm-white ink, hairline
structure, mono instrument labels, and **one** electric-iris accent used like
light: the sculpture, active states, and the single primary action on screen.
No gradients, no glass, no neon. Restraint over decoration; the art is the
sculpture, the composition, and the motion.

## Color tokens

All color is driven by CSS variables in `app/globals.css` (HSL channels) and
exposed to Tailwind in `tailwind.config.ts`. `.dark` is the default and the only
theme outside the docs; `:root` holds a warm-paper light theme for the docs
toggle. **Never hardcode hex/slate colors** — use the semantic classes.

| Token | Tailwind class | Role |
| --- | --- | --- |
| `--background` / `--foreground` | `bg-background` / `text-foreground` | Canvas + primary ink |
| `--card` / `--card-foreground` | `bg-card` | Panels, figures, rows on hover |
| `--popover` | `bg-popover` | Menus, dialogs, palette |
| `--muted` / `--muted-foreground` | `bg-muted` / `text-muted-foreground` | Skeletons + secondary text |
| `--accent` | `bg-accent` | Hover/active surface |
| `--border` / `--input` | `border-border` | Hairlines, inputs |
| `--primary` / `--brand` | `bg-primary` / `text-brand` | The iris accent (same hue); dark ink on top |
| `--cosmic` | `text-cosmic` | Charts only |
| `--success` / `--warning` / `--destructive` / `--info` | `text-success` … | Semantic status |
| `--ring` | `ring-ring` | Focus ring (matches brand) |

Semantic colors pair with a tinted badge via opacity (`bg-success/10 text-success`,
`bg-warning/15 text-warning`). Never a raw fill behind body text.

Helper classes (`app/globals.css`): `.figure` (framed product surface) + `.ticks`
(registration-mark corners), `.rule` (labelled hairline), `.eyebrow` (mono
label), `.lead`, `.lit` (the one primary action), `.bg-space` (dot field),
`.bg-blueprint` (hairline grid), `.grain`, `.font-mono-tnum`.
`.text-gradient-brand`, `bg-brand-gradient`, and `bg-radial-fade` still exist
for older call sites but render flat; do not add new uses.

## Typography

Fonts are wired with `next/font` in `app/layout.tsx` and exposed as CSS vars:

- **Sans (UI + display)** — `GeistSans` → `--font-sans` → `font-sans`. Headings add
  `font-display` (tight tracking, balanced wrap) at weight 500.
- **Mono** — `GeistMono` → `--font-mono` → `font-mono`. Labels, eyebrows, indices,
  addresses, amounts, code.

Display scale lives in `tailwind.config.ts`: `text-display-xl`, `text-display-lg`,
`text-display`, `text-title` (fluid `clamp()` with tight tracking). Three weights
at most on a page: 400 body, 500 headings and labels, 600 the wordmark.

## Spacing, radius, elevation

- Spacing/sizing: Tailwind scale only (`p-4`, `gap-2`, `h-9`). No magic px.
- Radius: `--radius: 0.5rem`; `rounded-md` for controls, `rounded-lg` for panels.
  `rounded-full` only for status dots and avatars.
- Elevation: hairlines over shadows. Panels are `border border-border bg-card`;
  lists are `divide-y divide-border`; cells are `grid gap-px bg-border`. Reserve
  `shadow-lg` for genuinely raised things (palette, popovers).

## Motion

- `framer-motion` for orchestrated entrances; CSS transitions for hover/press.
- Springs, no bounce (`stiffness ~300, damping ~30`): entrances 300–600ms, updates
  100–150ms, exits shorter than entries. Always name the transition properties
  (never `transition-all`).
- Use the `Reveal` component (`components/reveal.tsx`) for scroll entrances and
  `Chapter`/`ChapterHeading` (`components/landing/chapter.tsx`) for sectioning.
- The hero sculpture (`components/three/`) loads after idle, never on the server,
  falls back to a static SVG without WebGL, and renders a single frame under
  `prefers-reduced-motion`. `app/globals.css` has a global reduced-motion guard.

## Components & conventions

- Build on **shadcn/ui** primitives (`components/ui/*`); they consume the tokens,
  so theming is automatic. Add new ones with `npx shadcn@latest add <name>`.
- **Buttons:** `default` = iris primary (add `.lit` to the one main CTA), `outline`
  = secondary action, `ghost` = tertiary/icon. One primary action per view.
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

### Project catalog conventions (`/projects`)

The post-login landing — where users browse projects, open one, or create a new
one before entering the IDE. OAuth flows login → `/auth/callback` → **`/projects`**;
opening a project routes to `/ide?project=<id>` (the IDE honors that deep link).
The per-user testnet wallet is ensured on arrival by `AuthContext` (once per
session); the top bar surfaces wallet + network state via the existing
`WalletWidget` + `NetworkSwitcher`.

Shared components live in `components/catalog/`:

- **`CatalogTopBar`** — quiet, typographic header: wordmark, a single Guides →
  `/docs` link, `ThemeToggle`, network/wallet widgets, and an avatar account menu.
  One row, hairline bottom border, blurred translucent background (matches the IDE
  `Navbar`).
- **`CatalogRail`** — left catalog nav (All Projects / Templates, + **Settings**
  pinned bottom → `/billing`). A wide (`w-64`), full-height **sticky** panel
  anchored flush-left with a `bg-card/20` tint; Lucide icons, a shared-layout
  `motion` active pill (`layoutId="catalog-rail"`) + brand bar. Collapses to a
  fixed bottom nav on mobile.
- **`ProjectCard`** — flat `bg-card` surface, **weight not borders**. Hover/focus
  is where the only "glow" lives: `-translate-y-0.5` + `shadow-md` + a restrained
  `border-brand/45` edge (never a permanent heavy border). Shows the real name,
  `edited <relative>`, a **network badge** (testnet green / mainnet amber via
  `getNetwork`, so mainnet is unmistakable), file + deploy counts, and template
  origin if known. Card body opens the project; a kebab menu + quick star host
  Open / Rename / Duplicate / Delete (confirm) / Pin.
- **`NewProjectCard`** — the lead grid cell (dashed brand accent) → create dialog.
- **`CreateProjectDialog`** — name + starting point (Blank / Template / the
  `ContractWizard`) + default network (testnet default). Reuses `templatesApi`,
  the wizard scaffolder, and `projectApi.createProject`; on success routes to the
  IDE. Locked premium templates link out to the marketplace.
- **States** — `ProjectCardSkeleton` (loading), `CatalogEmptyState` (thoughtful
  first-run CTA + suggestions), `CatalogErrorState` (graceful retry),
  `CatalogNoMatches` (post-filter). Grid is 1/2/3-up (mobile/tablet/desktop) with
  a `framer-motion` stagger gated by `MotionConfig reducedMotion="user"`.

Catalog helpers live in `lib/catalog.ts`: `relativeTime` (date-fns), `sortProjects`
/ `filterProjects`, and **client-side stores the backend doesn't model** —
favorites/pins (`ws.favorites.<userId>`) and template-origin labels
(`ws.projectOrigin`), both in `localStorage`. Rename/duplicate/delete hit the
projects API and update the grid optimistically; duplicate composes
`createProject` from the source files (no backend duplicate endpoint).

**Theme:** the catalog has its own `next-themes` provider (`app/projects/layout.tsx`,
`attribute="class"`, dark-first) so the `ThemeToggle` works here. The IDE stays
**dark-only** — it force-sets `dark` on mount — matching the docs-subtree
precedent.

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
