# Adding a docs page

The docs are MDX files under `content/docs`, served at `/docs` by Fumadocs
(headless) + a WebSoroban-themed shell. Read [DOCS_STYLE.md](./DOCS_STYLE.md)
first — it's the writing bar.

## Where files go

File path maps directly to URL:

| File | URL |
| --- | --- |
| `content/docs/index.mdx` | `/docs` |
| `content/docs/compile/index.mdx` | `/docs/compile` |
| `content/docs/getting-started/quickstart.mdx` | `/docs/getting-started/quickstart` |

A docs **section** is a folder with an `index.mdx` and a `meta.json`. A single
page can also be a folder with just `index.mdx`.

## Required frontmatter

Every page begins with:

```mdx
---
title: Compile
description: Build your crate to Wasm, read per-file diagnostics, and fix validation errors.
---
```

- `title` — the nav label and `<h1>` (sentence case, no period).
- `description` — one line. It is the subtitle, the search hit, and the
  `llms.txt` entry. Say what the page *does*.

## Nav order and icons — `meta.json`

Each folder controls its own order:

```json title="content/docs/compile/meta.json"
{ "title": "Compile", "icon": "hammer", "pages": ["index"] }
```

- `title` — the section header in the sidebar.
- `icon` — one of: `rocket`, `book`, `terminal`, `layers`, `hammer`, `upload`,
  `play`, `flask`, `wallet`, `gauge`, `help`, `list` (add more in
  `lib/docs-source.ts` and `components/docs/card.tsx`).
- `pages` — child order (`"index"` first, then other slugs/subfolders).

The root order lives in `content/docs/meta.json`. Add your new section's folder
name to its `pages` array.

## Components (no imports needed)

These are registered globally for MDX in `components/docs/mdx.tsx`:

| Component | Use |
| --- | --- |
| `<Callout type="note\|tip\|warning\|danger" title="…">` | An aside. Don't stack two. |
| `<Steps>` + `<Step title="…">` | An ordered procedure. |
| `<Tabs items={["A","B"]}>` + `<Tab>` | Alternative paths. |
| `<CodeGroup>` (wrap fenced blocks with `title="…"`) | One example across files. |
| `<Card title href icon>` + `<CardGrid>` | Landing / section indexes. |
| `<Accordion>` + `<FaqItem question="…">` | FAQ / disclosure. |
| `<ParamField name type required>` / `<ResponseField>` | API params / responses. |
| `<Frame caption="…">` | A bordered, captioned screenshot. |
| `<Badge tone="read-only\|signed\|testnet">` | Inline state. |

Code fences: always set a language; add `title="src/lib.rs"` for a filename
header; highlight a line with the comment `// [!code highlight]`. Headings get
anchor links automatically.

## Preview and ship

```bash
pnpm dev          # predev regenerates .source; open /docs
pnpm build        # postbuild regenerates public/llms.txt
pnpm docs:llms    # regenerate llms.txt only
```

`.source` is generated (git-ignored). If a new page 404s in dev, stop and rerun
`pnpm dev` so codegen picks up the new file.

## Checklist before opening a PR

- Frontmatter `title` + one-line `description`.
- Added to the relevant `meta.json` (and the root `meta.json` for a new section).
- Every code block has a language; every example is real and runs.
- Links to at least one related page; no dead ends.
- Matches DOCS_STYLE.md — no throat-clearing, no marketing words, lead with the action.
