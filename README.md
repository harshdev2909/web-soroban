# WebSoroban

The frontend of [websoroban.in](https://websoroban.in): a browser IDE for
Soroban smart contracts on Stellar, an AI copilot, WebSoroban Pay (x402 paid
APIs), PayLoop (non-custodial USDC subscriptions), and the documentation site.

Next.js 15 (App Router) + TypeScript, Tailwind + shadcn/ui, Monaco, framer-motion,
three.js for the landing sculpture, and fumadocs for `/docs`. The API is
[backend-ide](https://github.com/WebSoroban/backend-ide).

## Layout

```
app/                 Routes: / (landing), /ide, /projects, /pay, /pay/checkout,
                     /payloop, /marketplace, /ideas, /billing, /docs, legal pages
components/          UI by area (ide, copilot, catalog, docs, landing, three, pay, ui)
content/docs/        Documentation pages (MDX), served at /docs
contexts/            Auth, wallet kit, and network providers
lib/                 API clients, analytics, networks, PayLoop chain helpers
public/              Static assets and llms.txt
docs/                Contributor guides
```

## Run locally

Node 22+ and pnpm.

```bash
pnpm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
pnpm dev                    # http://localhost:3000
```

Optional variables:
- `NEXT_PUBLIC_MAINNET_SOROBAN_RPC_URL`: the mainnet RPC the browser uses for PayLoop
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: enables Google Analytics

Vercel Analytics is always on in production.

## Build

```bash
pnpm build                  # generates the docs source, builds, then writes public/llms.txt
```

Production deploys from `main` on Vercel.

## Contributing

| Guide | Covers |
| --- | --- |
| [brand.md](brand.md) | Palette, type, and voice in one page |
| [docs/DESIGN.md](docs/DESIGN.md) | Design tokens, primitives, motion, and screen conventions |
| [docs/CONTRIBUTING_DOCS.md](docs/CONTRIBUTING_DOCS.md) | Writing and adding docs pages |
| [docs/DOCS_STYLE.md](docs/DOCS_STYLE.md) | Docs voice and formatting |
| [docs/TEMPLATE_WIZARD.md](docs/TEMPLATE_WIZARD.md) | The contract customisation wizard |
