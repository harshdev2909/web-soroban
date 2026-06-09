# Docs style guide

How WebSoroban docs are written. Read this before adding or editing a page. The
goal is documentation that reads as if a careful engineer wrote it for another
engineer — concrete, verified, and short.

## The one rule

If a sentence can be deleted without losing meaning, delete it.

## Voice

- **Lead with the answer or the action.** First sentence does work. Never open
  with the page title restated, never with "In this guide…".
- **Second person, present tense, active voice.** "You click Deploy." Not "The
  user can deploy" or "Deployment can be initiated".
- **One idea per paragraph.** Short, concrete sentences.
- **Define a term the first time it appears**, then use it consistently. Pick one
  word per concept and never vary it (it is "Invoke", not "call"/"run"/"execute"
  interchangeably).
- **Prefer a worked example over description.** Show real code, real inputs, real
  output. A reader should be able to copy what's on the page and have it work.

## Every page answers five questions

1. What is this?
2. When do you use it?
3. What are the exact steps?
4. What does success look like? (show the real output)
5. What do you do when it fails?

## Banned

- Throat-clearing: "In today's world…", "Welcome! In this guide we will…".
- Restating the heading as the first sentence.
- Hedging: "it's worth noting", "generally", "simply", "just", "of course".
- Empty transitions: "That being said", "Moreover", "In conclusion".
- Marketing adjectives: "powerful", "seamless", "robust", "cutting-edge",
  "effortlessly", "blazing-fast".
- Padding that repeats the heading in the first line.
- Vague placeholders (`your-value-here`) when a real value exists — use the real
  one (`GADTEST…`, `123`, `src/lib.rs`).
- Lists where a sentence is clearer; the same sentence shape repeated.

## Required

- Every code example must compile/run against the current product. Verify ScVal
  inputs, CLI/SDK calls, and outputs — do not invent them.
- Show real expected output, not "you should see a success message".
- Internal links between related pages. No dead ends — end a page by pointing to
  the next thing.
- Alt text on every image; a caption on every `<Frame>`.

## Frontmatter

Every page starts with:

```mdx
---
title: Deploy
description: Compile to Wasm, then upload and instantiate on testnet with your wallet.
---
```

- `title`: the nav label and `<h1>`. Sentence case, no trailing period.
- `description`: one line. It is the page subtitle, the search result, and the
  `llms.txt` entry. Make it say what the page does, not what it "covers".

## Components

Use the kit (see CONTRIBUTING.md for the import-free MDX list). Conventions:

- **Callout** for asides only. `note` (context), `tip` (a shortcut), `warning`
  (you can lose work / hit a limit), `danger` (irreversible / funds). Never stack
  two in a row.
- **Steps** for any procedure with order. One action per `<Step>`.
- **CodeGroup** when the same example spans files (e.g. `src/lib.rs` +
  `Cargo.toml`). Single file → a fenced block with `title="…"`.
- **Badge** for state: `read-only`, `signed`, `testnet`.
- **ParamField / ResponseField** for endpoint inputs and outputs.
- **Tabs** for alternative paths (not for sequential steps).

## Code blocks

- Always set a language. Add `title="src/lib.rs"` for a filename header.
- Highlight lines with the shiki comment `// [!code highlight]`.
- Rust examples target `soroban-sdk = "22.0.0"`. Addresses are testnet `G…`/`C…`.

## Terminology (pick one, never vary)

| Use | Not |
| --- | --- |
| Invoke | call, run, execute (for contract functions) |
| Compile | build (as the user action) |
| Deploy | publish, ship |
| testnet wallet | account, address (when meaning the per-user wallet) |
| function test | saved test, assertion test |
| Wasm | WASM, wasm binary |
