# Brand — WebSoroban

_Status: active_

The source of truth for color, type, and voice. Full token reference and
component conventions live in `DESIGN_NOTES.md`; this file is the quick brief the
`frontend-design-guidelines` skill reads.

## Feel

"Observatory." One dark, warm near-black canvas on every surface: the landing
story, the product pages, the docs, and the IDE. Warm-white ink, hairline
structure, mono instrument labels, and a single electric-iris accent used like
light: the hero sculpture, active states, and the one primary action on screen.
Precise and sculptural, never neon, never a toy.

## Palette (HSL — see `app/globals.css`)

- **Canvas:** background `40 7% 5%`, card `40 7% 7%`, popover `40 8% 9%`
- **Ink:** foreground `40 20% 93%`, muted `40 8% 60%`
- **Structure:** border `40 7% 14%`, input `40 7% 18%`
- **Iris (brand / primary):** `251 95% 75%` with dark ink on top (`250 30% 8%`)
- **Cosmic:** `280 70% 70%`, charts only
- **Status:** success `152 60% 54%`, warning `38 95% 64%`, destructive `0 75% 64%`, info `200 90% 66%`
- **Light (docs toggle only):** warm paper `42 30% 97%`, ink `40 10% 9%`, iris `251 76% 56%`

Use semantic Tailwind classes (`bg-background`, `text-brand`, `text-muted-foreground`,
`text-success`…). Never hardcode hex or `slate-*`/`gray-*`. No gradients in the UI.

## Typography

- UI and display: **Geist Sans** → `font-sans`; headings add `font-display`
  (tight tracking, balanced wrap) at weight 500.
- Mono: **Geist Mono** → `font-mono`. Labels, eyebrows, indices, addresses,
  amounts (`font-mono-tnum`), code.
- Three weights at most: 400 body, 500 headings and labels, 600 the wordmark.

All wired via `next/font` in `app/layout.tsx`.

## Geometry and motion

- Radius `0.5rem` base: `rounded-md` for controls, `rounded-lg` for panels.
  `rounded-full` only for status dots and avatars.
- Hairlines over shadows. `.figure` frames for product surfaces, `.rule` for
  labelled rules, `Index` numerals for lists, `.lit` for the one primary action.
- Springs, no bounce: entrances 300–600ms, micro-interactions ≤150ms with
  explicit transition properties. Everything respects `prefers-reduced-motion`.

## Voice

Concise, active, technical-but-warm. "Deploy to testnet", not "Click here to
deploy your contract to the test network." Specific over aspirational; no hype.
