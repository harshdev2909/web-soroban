export type ThemeId = 'onboarding' | 'payments' | 'markets'

export type Idea = {
  slug: string
  number: string
  title: string
  tagline: string
  category: string
  theme: ThemeId
  buildWith: string[]
  goal: string
  description: string
  features: string[]
  technical?: string
  alignment: string
  useCases?: string[]
  by?: string
  credit?: string
  source?: string
}

export const themes: { id: ThemeId | 'all'; label: string; blurb: string }[] = [
  {
    id: 'all',
    label: 'All ideas',
    blurb: 'Nine Stellar ideas, from wallets to payment rails.',
  },
  {
    id: 'onboarding',
    label: 'Wallets + Onboarding',
    blurb: 'Passkeys, social sign-in, MetaMask access, and safer key backup.',
  },
  {
    id: 'payments',
    label: 'Payments',
    blurb: 'USDC subscriptions, payment links, and a stablecoin neobank.',
  },
  {
    id: 'markets',
    label: 'Markets + Data',
    blurb: 'Prediction markets and portfolio tracking for Soroban.',
  },
]

const discord = 'https://discord.com/channels/897514728459468821'

export const ideas: Idea[] = [
  {
    slug: 'metamask-connector',
    number: '01',
    title: 'MetaMask Connector for Soroban',
    tagline: 'Let MetaMask users use Stellar dApps without switching wallets.',
    category: 'Wallets',
    theme: 'onboarding',
    buildWith: ['Soroban', 'MetaMask', 'Stellar Wallets Kit'],
    goal:
      'Improve Soroban dApp accessibility by enabling MetaMask users to connect seamlessly via a Solflare-style adapter.',
    description:
      'Build a connector that lets MetaMask users work with Stellar dApps and payments through a secure adapter.',
    features: [
      'Lets users interact with Stellar dApps or payments using MetaMask through a secure adapter.',
      'Translates Ethereum-style signing and transaction flows into Soroban-compatible actions.',
      'Supports address mapping, network switching, and message signing.',
      'Makes it easier for existing Web3 users to explore Stellar without switching wallets.',
    ],
    alignment:
      'Lowers onboarding friction for EVM-native users, makes Soroban applications more accessible, and brings UI/UX expectations from broader Web3 tooling into the Stellar ecosystem.',
    by: 'Raph (Lumen Loop)',
    source: `${discord}/1370547060784369684`,
  },
  {
    slug: 'prediction-markets',
    number: '02',
    title: 'On-chain Prediction Markets',
    tagline: 'Crowdsource forecasts and reward people for being right.',
    category: 'DeFi',
    theme: 'markets',
    buildWith: ['Soroban', 'Oracles', 'Conditional tokens'],
    goal:
      'Enable open, on-chain prediction markets that crowdsource insights and reward accurate forecasting, using Soroban smart contracts.',
    description: 'Build a Soroban-based prediction platform for outcome-based markets.',
    features: [
      'Users create and trade on outcome-based markets, such as elections, sports, and crypto trends.',
      'Conditional tokens and liquidity pools handle market resolution.',
      'Reputation or staking mechanics deter spam and encourage truthful participation.',
    ],
    alignment:
      'Brings crowd-driven forecasting to Stellar, shows what oracles and smart contracts can do, and opens new DeFi use cases for speculation, governance, and collective intelligence.',
    by: 'Raph (Lumen Loop)',
    source: `${discord}/1370629309961736295`,
  },
  {
    slug: 'portfolio-tracker',
    number: '03',
    title: 'Soroban Portfolio Tracker',
    tagline: 'One dashboard for Stellar balances, positions, and yield.',
    category: 'Data',
    theme: 'markets',
    buildWith: ['Soroban RPC', 'Stellar Wallets Kit', 'Indexer'],
    goal:
      'Make it easy to track Soroban-based assets, yields, and portfolio performance, and surface new opportunities in the Stellar ecosystem.',
    description:
      'Build a portfolio tracking tool for Stellar, similar to Zerion, Zapper, or DeBank.',
    features: [
      'Aggregates Soroban smart contract positions and token balances in one dashboard.',
      'Tracks historical portfolio performance and yield across Stellar-native DeFi protocols.',
      'Highlights trending tokens, new liquidity pools, and emerging dApps.',
      'Supports Stellar Wallets Kit and real-time on-chain data.',
    ],
    alignment:
      'Improves on-chain asset management, drives adoption of Soroban applications, and makes new projects and financial opportunities on Stellar easier to find.',
    by: 'Raph (Lumen Loop)',
    source: `${discord}/1370544740650582076`,
  },
  {
    slug: 'sep-52-key-sharing',
    number: '04',
    title: 'SEP-52 Key Sharing',
    tagline: 'Split and back up secret keys in a safe, standard way.',
    category: 'Security',
    theme: 'onboarding',
    buildWith: ['SEP-52', 'Shamir Secret Sharing', 'Wallet SDKs'],
    goal: 'Allow people to split and share their secret keys in a safe and standard way.',
    description:
      'SEP-52 is a standard for splitting secret keys with Shamir Secret Sharing. It is useful for backing up keys and for decentralized management of a key, similar to multisig schemes. Decaf uses this scheme in the background to back up keys, and Ledger and Trezor do too. Today the process is manual and needs a good knowledge of the protocol, so wallets and dApps should offer it directly.',
    features: [
      'Wallets and dApps offer SEP-52 key splitting and recovery as a built-in option.',
      'A shared standard so splits made in one app can be recovered in another.',
      'SDK support so developers can adopt the scheme without reimplementing it.',
    ],
    alignment:
      'Promotes the use of SEPs in general, and this mechanism for sharing and backing up keys in particular.',
    by: 'tupui | The Aha Company',
    source: `${discord}/1370787448937775254`,
  },
  {
    slug: 'usdc-subscriptions',
    number: '05',
    title: 'Recurring USDC Subscriptions',
    tagline: 'Pay for newsletters, SaaS, and memberships in USDC, with no custodian.',
    category: 'Subscriptions',
    theme: 'payments',
    buildWith: ['Soroban', 'SEP-41', 'USDC', 'Keeper'],
    goal:
      'Let users pay for newsletters, SaaS, DAO memberships, and signal services in USDC straight from their wallet, with no custodian.',
    description:
      'A non-custodial subscription protocol. A subscriber authorizes a capped, expiring allowance to a plan, a keeper charges each billing period, and the subscriber can cancel any time.',
    features: [
      'Plan registry with price, period, and merchant.',
      'Subscribe with a capped, expiring token allowance.',
      'charge() callable once per period by anyone.',
      'Cancel or pause at any time.',
      'Merchant dashboard of active subscribers.',
    ],
    technical:
      'Rust contract using SEP-41 approve and transfer_from, with period checks against the ledger timestamp. Soroban has no native cron, so run a keeper or relayer. Frontend with Freighter or Stellar Wallets Kit.',
    alignment: 'Turns USDC on Stellar into a recurring-revenue rail, not just a one-off payment rail.',
    useCases: ['Newsletters', 'SaaS tools', 'DAO memberships', 'Trading-signal platforms'],
  },
  {
    slug: 'passkey-smart-wallet',
    number: '06',
    title: 'Passkey Smart Wallet',
    tagline: 'Sign in with a fingerprint or Face ID instead of a seed phrase.',
    category: 'Wallets',
    theme: 'onboarding',
    buildWith: ['Soroban', 'WebAuthn', 'secp256r1'],
    goal: 'Let people sign in with a fingerprint or Face ID instead of a seed phrase.',
    description: 'A custom account contract that authorizes transactions with WebAuthn passkeys.',
    features: [
      'Account contract with __check_auth.',
      'secp256r1 signature verification.',
      'Passkey registration flow.',
      'Recovery or add-signer path.',
      'Gas-sponsored first transactions.',
    ],
    technical:
      'Soroban custom accounts, WebAuthn on the client, and secp256r1 verification. Consider a fee-sponsoring relayer.',
    alignment: 'Removes the biggest onboarding barrier for mainstream users.',
    useCases: ['Consumer payment apps', 'Loyalty programs', 'Games'],
  },
  {
    slug: 'stablecoin-neobank',
    number: '07',
    title: 'Stablecoin Neobank',
    tagline: 'A bank-style app for USDC, with no seed phrase and no custodian.',
    category: 'Consumer finance',
    theme: 'payments',
    buildWith: ['Soroban', 'Passkeys', 'SEP-10', 'SEP-24', 'USDC'],
    goal:
      'Give people a bank-style app for holding, sending, and saving USDC, with no seed phrase and no custodian holding their funds.',
    description:
      'A consumer app on a passkey smart wallet. Users hold USDC, send to handles, set spending rules, and park money in goal-based savings pots. Licensed anchors handle cash in and cash out.',
    features: [
      'Passkey-secured wallet with a USDC balance.',
      'Send and request by handle or QR.',
      'Savings pots with goals and lock rules.',
      'Spend limits and a payee allowlist enforced on-chain.',
      'Cash in and out through an anchor, plus statement export.',
    ],
    technical:
      'A Soroban custom account contract for spend rules, and a separate vault contract for pots using the SEP-41 token client. Anchor integration through SEP-10 auth and SEP-24 interactive flows, so KYC stays with the anchor. An indexer for history. Check regulatory scope before offering fiat features.',
    alignment:
      'Shows what Stellar is built for: stablecoin payments, a global anchor network, and financial inclusion.',
    useCases: [
      'Freelancers paid in USD',
      'Diaspora families',
      'People in high-inflation economies',
      'Small-business treasuries',
    ],
  },
  {
    slug: 'payment-links',
    number: '08',
    title: 'Shareable Payment Links',
    tagline: 'Make a Stellar payment as simple as sharing a link.',
    category: 'Checkout',
    theme: 'payments',
    buildWith: ['SEP-7', 'Horizon', 'Stellar Wallets Kit'],
    goal: 'Make a Stellar payment as simple as sharing a link, for people who have never used crypto.',
    description:
      'Anyone creates a link or QR code for an amount and asset. The payer opens a hosted page and approves in their wallet, and the payee sees confirmation.',
    features: [
      'Link builder with amount, asset, memo, and expiry.',
      'Hosted pay page that works on mobile.',
      'Wallet connect or SEP-7 deep link.',
      'Payment detection and receipts.',
      'Webhooks and a simple merchant dashboard.',
    ],
    technical:
      'SEP-7 payment URIs, with a unique memo per link to match payments. Confirm payments by streaming from Horizon or Soroban RPC events. A small backend for link state and webhooks, and Stellar Wallets Kit on the pay page.',
    alignment:
      'Plays to Stellar’s fast, low-fee settlement and puts a familiar checkout experience in front of it.',
    useCases: ['Freelancer invoices', 'Creators', 'Small shops', 'Chat-based commerce', 'Donation pages'],
    credit: 'Inspired by teams like StellarSnaps.',
  },
  {
    slug: 'google-zk-wallet',
    number: '09',
    title: 'Google Sign-In Wallet (zero-knowledge)',
    tagline: 'Turn a Google account into a self-custody Stellar wallet.',
    category: 'Wallets',
    theme: 'onboarding',
    buildWith: ['Soroban', 'ZK proofs', 'Google OAuth'],
    goal:
      'Turn a Google account into a self-custody Stellar wallet with no seed phrase, no extension, and no identity exposed on-chain.',
    description:
      'A user signs in with Google. A zero-knowledge proof shows the login is valid without revealing who they are, and a smart account authorizes transactions from it.',
    features: [
      'Google OAuth sign-in flow.',
      'ZK proof of a valid login token.',
      'Account contract that verifies the proof in __check_auth.',
      'Deterministic wallet address from a user salt.',
      'Fee-sponsored first transactions.',
    ],
    technical:
      'A Soroban custom account contract, and a ZK circuit over the OAuth JWT (zkLogin-style) with on-chain proof verification using Soroban’s cryptography host functions. Check which curves your target protocol supports. Handle provider key rotation and salt storage, and use a relayer for fees. Needs a security review before real funds.',
    alignment:
      'Removes the seed-phrase barrier for mainstream users while keeping self-custody, a strong fit for consumer apps on Stellar.',
    useCases: ['Consumer payment apps', 'Games', 'Loyalty and rewards', 'Onboarding flows for non-crypto users'],
    credit: 'Inspired by teams like StellaRay.',
  },
]

export function getIdea(slug: string) {
  return ideas.find((idea) => idea.slug === slug)
}

export function neighbors(slug: string) {
  const index = ideas.findIndex((idea) => idea.slug === slug)
  if (index < 0) return { prev: undefined, next: undefined }
  return {
    prev: ideas[index - 1],
    next: ideas[index + 1],
  }
}

export const themeLabel = (id: ThemeId) => themes.find((theme) => theme.id === id)?.label ?? id

/** An idea someone submitted through the site and an admin accepted. */
export type CommunityIdea = {
  id: string
  title: string
  goal: string
  description: string
  alignment: string
  author: string
  link: string | null
  acceptedAt: string
}

export type IdeaSubmission = CommunityIdea & {
  contact: string
  status: 'pending' | 'accepted' | 'rejected'
  reviewNote: string
  reviewedAt: string | null
  createdAt: string
}
