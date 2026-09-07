# Brand — WebSoroban

_Status: active_

The source of truth for color, type, and voice. Full token reference and
component conventions live in `DESIGN_NOTES.md`; this file is the quick brief the
`frontend-design-guidelines` skill reads.

## Feel

Stellar product studio. The landing experience is warm, editorial, and
tool-forward; the IDE remains dense and dark. One electric-iris accent connects
both surfaces. The product should feel inventive without looking like a toy.

## Palette (HSL — see `app/globals.css`)

- **Brand / primary (electric iris):** dark `250 86% 66%`, light `250 80% 58%`
- **Cosmic (secondary, gradients only):** `280 78% 66%`
- **Landing canvas:** warm paper `48 33% 97%`, ink `246 18% 10%`
- **IDE canvas:** background `234 32% 5%`, card `233 26% 8%`
- **Text:** foreground `220 18% 96%`, muted `224 12% 62%`
- **Status:** success `152 58% 48%`, warning `38 94% 60%`, destructive `0 72% 58%`

Use semantic Tailwind classes (`bg-background`, `text-brand`, `text-muted-foreground`,
`text-success`…). Never hardcode hex or `slate-*`/`gray-*`.

## Typography

- Display (headings): **Space Grotesk** → `font-display`
- UI sans: **Geist Sans** → `font-sans`
- Mono (code/addresses/numbers): **Geist Mono** → `font-mono`

All wired via `next/font` in `app/layout.tsx`.

## Voice

Concise, active, technical-but-warm. "Deploy to testnet", not "Click here to
deploy your contract to the test network." Confident, never hypey.

## Mode

Warm-light marketing surface via `.nova-landing`; dark-first product shell. Both
share typography, iris accents, and sharp, technical component geometry.
