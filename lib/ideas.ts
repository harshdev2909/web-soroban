export type ThemeId = 'rwa' | 'payfi' | 'agentic' | 'privacy' | 'infra'

export type Idea = {
  slug: string
  number: string
  title: string
  tagline: string
  category: string
  difficulty: string
  theme: ThemeId
  buildWith: string[]
  problem: string
  idea: string
  whyNow: string
  userStory: string
  flow: string[]
  mvp: string[]
  contracts: { name: string; role: string }[]
  stellarFeatures: string[]
  integrations: string[]
  plan: { step: string; title: string; detail: string }[]
  stretch: string[]
  resources: { label: string; href: string }[]
  caution?: string
}

export const themes: { id: ThemeId | 'all'; label: string; blurb: string }[] = [
  {
    id: 'all',
    label: 'All ideas',
    blurb: 'Ten Stellar briefs, from a first contract to a demo.',
  },
  {
    id: 'rwa',
    label: 'RWA Finance',
    blurb: 'Collateral, tokenized treasuries, credit, and RWA distribution.',
  },
  {
    id: 'payfi',
    label: 'PayFi',
    blurb: 'Invoices, merchant financing, payroll, and B2B settlement.',
  },
  {
    id: 'agentic',
    label: 'Agentic Commerce',
    blurb: 'x402, MPP, autonomous wallets, and API markets.',
  },
  {
    id: 'privacy',
    label: 'Privacy + Compliance',
    blurb: 'Private payments, ZK identity, and confidential assets.',
  },
  {
    id: 'infra',
    label: 'Financial Infrastructure',
    blurb: 'Cross-border settlement, treasury, FX, and stablecoin orchestration.',
  },
]

const docs = 'https://developers.stellar.org/docs'
const soroban = 'https://developers.stellar.org/docs/build'
const sac = 'https://developers.stellar.org/docs/tokens/stellar-asset-contract'
const mpp = 'https://developers.stellar.org/docs/build/agentic-payments/mpp'
const x402 = 'https://developers.stellar.org/docs/build/agentic-payments/x402'
const privacy = 'https://developers.stellar.org/docs/build/apps/privacy'
const zk = 'https://developers.stellar.org/docs/build/apps/zk'
const blend = 'https://docs.blend.capital'
const defindex = 'https://docs.defindex.io'

export const ideas: Idea[] = [
  {
    slug: 'rwa-credit-line',
    number: '01',
    title: 'RWA Credit Line',
    tagline: 'Borrow stablecoins against a yield-bearing asset instead of selling it.',
    category: 'RWA × DeFi',
    difficulty: 'Advanced',
    theme: 'rwa',
    buildWith: ['Soroban', 'SAC', 'USDC', 'Oracle', 'Blend'],
    problem:
      'Holders of tokenized treasuries, money-market funds, and private credit need cash without exiting the asset. Selling the position drops the yield and can create a taxable event or a bad price.',
    idea:
      'A credit protocol where users borrow USDC against tokenized real-world assets. BENJI or another treasury RWA is deposited as collateral, valued by an oracle, and locked in a Soroban vault that opens a USDC credit line.',
    whyNow:
      'Stellar’s RWA set has grown quickly. Centrifuge is bringing tokenized Treasury and private-credit assets into Stellar DeFi, including use with Blend and DeFindex.',
    userStory:
      'A treasurer holds tokenized T-bills and needs operating cash for two weeks. They deposit the RWA, borrow USDC up to a collateral ratio, and repay to unlock the position. The asset can keep accruing yield while it secures the loan.',
    flow: [
      'Deposit an RWA / SAC asset',
      'Oracle prices the collateral',
      'Soroban vault locks the position',
      'Borrow USDC against a collateral ratio',
      'Interest accrues',
      'Repay and withdraw, or liquidate if unhealthy',
    ],
    mvp: [
      'Accept one allowlisted RWA or SAC as collateral.',
      'Read a price and compute collateral value plus a max borrow.',
      'Mint or transfer a USDC credit line to the borrower.',
      'Accrue interest and accept repayment.',
      'Release collateral after the debt is cleared.',
      'Liquidate under-collateralized positions.',
      'Show health factor, LTV, and debt on a simple risk dashboard.',
    ],
    contracts: [
      { name: 'Vault', role: 'Holds collateral, tracks debt, and gates withdraw.' },
      { name: 'Oracle adapter', role: 'Normalizes the RWA price into collateral value.' },
      { name: 'Credit line', role: 'Sets collateral ratios, interest, and borrow limits.' },
      { name: 'Liquidation', role: 'Seizes unhealthy collateral and repays the debt.' },
    ],
    stellarFeatures: [
      'SAC tokens for the RWA and USDC',
      'Soroban authorization for deposit, borrow, and repay',
      'Onchain collateral ratios',
      'Composable calls into Blend',
    ],
    integrations: ['Centrifuge RWA tokens', 'Blend', 'DeFindex', 'A Stellar price oracle', 'USDC'],
    plan: [
      { step: '01', title: 'Asset + vault', detail: 'Allowlist one SAC collateral token and a vault that can lock and return it.' },
      { step: '02', title: 'Value + borrow', detail: 'Oracle read, LTV check, and a USDC borrow against the locked balance.' },
      { step: '03', title: 'Interest + repay', detail: 'Accrue interest and clear debt before collateral can leave.' },
      { step: '04', title: 'Liquidation', detail: 'A keeper path that closes positions below the health threshold.' },
      { step: '05', title: 'Risk dashboard', detail: 'Health factor, debt, and collateral value in a demo UI.' },
    ],
    stretch: [
      'Let the collateral keep earning RWA yield while it secures the loan.',
      'Route surplus collateral into Blend or DeFindex instead of sitting idle.',
    ],
    resources: [
      { label: 'Stellar Asset Contract', href: sac },
      { label: 'Soroban docs', href: soroban },
      { label: 'Blend', href: blend },
      { label: 'DeFindex', href: defindex },
    ],
  },
  {
    slug: 'payfi-invoice-market',
    number: '02',
    title: 'PayFi Invoice Market',
    tagline: 'Turn a 60-day invoice into cash today, and yield for the pool that funded it.',
    category: 'PayFi × RWA',
    difficulty: 'Advanced',
    theme: 'payfi',
    buildWith: ['Soroban', 'USDC', 'SAC'],
    problem:
      'A business with a $10,000 invoice payable in 60 days has the revenue and none of the cash. Waiting the full term ties up working capital.',
    idea:
      'Unpaid invoices become programmable assets that investors can finance. After a verifier approves the invoice, a Soroban contract opens a financing position. A USDC pool advances $9,700 now. When the buyer pays $10,000, the pool receives principal plus yield.',
    whyNow:
      'PayFi is a core Stellar theme. Stellar describes tokenized receivables, working-capital financing, and payment-linked yield as the applications this stack is for.',
    userStory:
      'A supplier uploads an invoice. A verifier approves it. Liquidity providers fund the position, the supplier receives USDC the same day, and repayment later settles the pool automatically.',
    flow: [
      'Business submits a $10,000 invoice, payable in 60 days',
      'Verifier approves it',
      'Contract tokenizes a financing position',
      'LP supplies USDC',
      'Business receives $9,700 now',
      'Buyer pays $10,000',
      'Pool receives principal + yield',
    ],
    mvp: [
      'Invoice submission with amount, debtor, and due date.',
      'A verifier role that approves or rejects.',
      'A financing position that records advance, face value, and maturity.',
      'An LP deposit of USDC that funds the advance.',
      'Payout to the business.',
      'Repayment that splits principal and yield back to the pool.',
    ],
    contracts: [
      { name: 'Invoice registry', role: 'Stores the invoice hash, amount, debtor, and due date.' },
      { name: 'Verifier', role: 'Approves a position before it can be financed.' },
      { name: 'Financing pool', role: 'Holds LP USDC and prices the advance.' },
      { name: 'Settlement', role: 'Distributes repayment into principal and yield.' },
    ],
    stellarFeatures: [
      'USDC as a SAC',
      'Role-based Soroban auth for issuer, verifier, and LP',
      'Deterministic settlement on repayment',
    ],
    integrations: ['USDC', 'A KYC’d verifier', 'Anchor or fiat off-ramp for the debtor payment'],
    plan: [
      { step: '01', title: 'Invoice record', detail: 'Submit amount, term, and debtor. Persist a hash of the document.' },
      { step: '02', title: 'Verifier', detail: 'An approver address that must sign before financing opens.' },
      { step: '03', title: 'Pool + advance', detail: 'LPs deposit USDC. Approval releases the discounted advance.' },
      { step: '04', title: 'Repayment', detail: 'Incoming USDC retires principal and pays the spread to LPs.' },
      { step: '05', title: 'Demo', detail: 'One invoice, one LP, one repayment, shown end to end.' },
    ],
    stretch: [
      'A marketplace where investors filter invoices by duration, geography, and risk score.',
    ],
    resources: [
      { label: 'Stellar docs', href: docs },
      { label: 'Stellar Asset Contract', href: sac },
      { label: 'Soroban docs', href: soroban },
    ],
  },
  {
    slug: 'private-payroll',
    number: '03',
    title: 'Private Payroll',
    tagline: 'Settle salaries on Stellar without publishing every employee’s pay.',
    category: 'ZK × Payments',
    difficulty: 'Advanced',
    theme: 'privacy',
    buildWith: ['Soroban', 'USDC', 'BN254', 'Poseidon'],
    problem:
      'A normal onchain payroll shows “Company → Alice: $8,000” and “Company → Bob: $3,000”. Anyone can read the amounts. Stellar calls payroll out as a case where public transaction visibility is a problem.',
    idea:
      'The company funds a private payroll pool. Employees receive payment commitments. A ZK proof shows the batch was authorized and fully allocated, without revealing individual salaries. Employees withdraw against their own commitment.',
    whyNow:
      'Stellar’s privacy stack includes native ZK primitives: BN254 and Poseidon / Poseidon2. Confidential tokens are in developer preview.',
    userStory:
      'Payroll uploads a batch. Observers can see that the pool was funded and that the proof verified. Alice and Bob each withdraw their own salary. Neither amount is written in the clear.',
    flow: [
      'Company treasury funds a private payroll pool',
      'Employer uploads a payroll batch of commitments',
      'ZK proof checks that the distribution is authorized and sums to the funding',
      'Each employee withdraws against their commitment',
    ],
    mvp: [
      'Employer creates a payroll batch of employee commitments.',
      'Pool is funded in USDC for the batch total.',
      'A ZK proof validates the authorized distribution.',
      'Employees withdraw without the contract logging individual amounts.',
      'Public state shows funding and execution, not salaries.',
    ],
    contracts: [
      { name: 'Payroll pool', role: 'Holds the batch funding and records that it executed.' },
      { name: 'Commitment tree', role: 'Stores Poseidon commitments to each payment.' },
      { name: 'Verifier', role: 'Checks a BN254 proof that the batch is authorized and conserves value.' },
      { name: 'Withdraw', role: 'Lets an employee claim a commitment they can open.' },
    ],
    stellarFeatures: [
      'BN254 pairing checks for proof verification',
      'Poseidon / Poseidon2 for commitments and nullifiers',
      'SAC transfer of the pooled USDC',
    ],
    integrations: ['USDC', 'An offchain prover', 'HR export that produces the batch'],
    plan: [
      { step: '01', title: 'Pool + batch', detail: 'Fund a contract and store a list of payment commitments.' },
      { step: '02', title: 'Proof', detail: 'Prove the commitments sum to the deposit and were signed by payroll.' },
      { step: '03', title: 'Withdraw', detail: 'An employee opens their commitment and receives USDC once.' },
      { step: '04', title: 'Public view', detail: 'A page that shows funded and executed, and hides amounts.' },
    ],
    stretch: [
      'Swap the demo commitments for confidential-token transfers once that preview is stable.',
    ],
    caution:
      'Treat confidential-token components as experimental. They are in developer preview, not a production payroll rail today. The MVP should stand on commitments plus a ZK verifier.',
    resources: [
      { label: 'Privacy on Stellar', href: privacy },
      { label: 'ZK primitives', href: zk },
      { label: 'Stellar Asset Contract', href: sac },
    ],
  },
  {
    slug: 'agent-wallet',
    number: '04',
    title: 'Agent Wallet',
    tagline: 'AI agents that can spend money, without unlimited access.',
    category: 'Agentic Payments',
    difficulty: 'Intermediate/Advanced',
    theme: 'agentic',
    buildWith: ['Soroban', 'USDC', 'x402', 'MPP', 'Stellar SDK'],
    problem:
      'Giving an agent its own Stellar wallet with the secret key is unlimited control. One bad tool call can drain the account or pay an arbitrary address.',
    idea:
      'The agent gets a wallet, and a Soroban policy contract decides what it may do. Example policy: spend at most $100/day, only USDC, only approved merchants, at most $5 per API call, no transfers to EOAs, and human approval above $50.',
    whyNow:
      'Stellar supports x402 and MPP for machine payments. x402 is per-request. MPP adds session channels for high-frequency machine payments. A Stellar Builder Summit bounty already shipped an agent CLI gated by an onchain Soroban policy.',
    userStory:
      'A user creates an agent wallet, sets the policy, and connects an LLM agent. The agent buys an API call through x402 or MPP. Soroban accepts the payment only when every rule passes.',
    flow: [
      'User creates an agent wallet',
      'User defines a spending policy',
      'Soroban policy contract',
      'AI agent',
      'x402 / MPP',
      'Merchant or API',
    ],
    mvp: [
      'Create a wallet the agent can use.',
      'Write the spending policy onchain.',
      'Connect an LLM agent that requests a purchase.',
      'Pay with x402 or MPP.',
      'Reject the call when a policy rule fails.',
    ],
    contracts: [
      { name: 'Agent wallet', role: 'Holds USDC. The agent cannot move funds except through the policy.' },
      { name: 'Policy', role: 'Checks daily cap, asset, merchant allowlist, per-call max, and approval threshold.' },
      { name: 'Approval', role: 'Queues spends over $50 for a human signature.' },
    ],
    stellarFeatures: [
      'Soroban authorization on every spend',
      'x402 for a single request',
      'MPP charge or session for repeated calls',
      'USDC as a SAC',
    ],
    integrations: ['x402', 'MPP', 'USDC', 'Stellar SDK', 'An LLM tool that pays the 402'],
    plan: [
      { step: '01', title: 'Wallet + contract', detail: 'Deploy the wallet and a policy skeleton the agent must call.' },
      { step: '02', title: 'Policy engine', detail: 'Daily cap, USDC only, merchant allowlist, per-call max, no EOA transfers.' },
      { step: '03', title: 'x402 payments', detail: 'One paid request that the policy can allow or deny.' },
      { step: '04', title: 'AI agent', detail: 'An LLM tool that attempts the purchase and reads the denial reason.' },
      { step: '05', title: 'UI + demo', detail: 'Show the policy, a successful $5 call, and a rejected transfer.' },
    ],
    stretch: [
      'Add an MPP session channel for a burst of calls under the same daily cap.',
      'Require human approval above $50 before the policy returns success.',
    ],
    resources: [
      { label: 'x402 on Stellar', href: x402 },
      { label: 'MPP', href: mpp },
      { label: 'Stellar SDK docs', href: docs },
    ],
  },
  {
    slug: 'api-marketplace',
    number: '05',
    title: 'API Marketplace for AI Agents',
    tagline: 'An app store where an agent discovers an API and pays per request.',
    category: 'Agentic Commerce',
    difficulty: 'Intermediate',
    theme: 'agentic',
    buildWith: ['Soroban', 'USDC', 'x402', 'MPP'],
    problem:
      'An agent that needs the latest EUR/USD rate should not need an API key, a subscription, or a Stripe account. Today every API assumes a human set up billing first.',
    idea:
      'Developers list an API and a USDC price. The agent finds “FX Oracle API — $0.001/request”, calls it, receives HTTP 402, pays on Stellar, and gets the result. x402 covers one request. MPP covers a high-frequency session.',
    whyNow:
      'Stellar’s x402 path uses Soroban authorization. MPP supports SAC transfers and payment channels, which fits agents that call the same API hundreds of times.',
    userStory:
      'A developer lists an FX endpoint at $0.001. An agent discovers it, pays the 402, and reads the rate. No key is issued.',
    flow: [
      'Developer lists an API and a USDC price',
      'Agent discovers the listing',
      'HTTP request returns 402',
      'Agent pays on Stellar',
      'Service returns the result',
    ],
    mvp: [
      'A listing with name, endpoint, asset, and price.',
      'The API returns HTTP 402 with machine-readable payment terms.',
      'An agent pays through Stellar and retries.',
      'The service returns the payload after payment.',
      'Support x402 for one request and MPP for a session.',
    ],
    contracts: [
      { name: 'Catalog', role: 'Registers endpoint, price, asset, and seller.' },
      { name: 'Receipt', role: 'Records that a payment authorized a response.' },
    ],
    stellarFeatures: [
      'HTTP 402 with Soroban auth via x402',
      'MPP charge for per-request SAC transfer',
      'MPP session channels for high-frequency calls',
    ],
    integrations: ['x402', 'MPP', 'USDC', '@stellar/mpp'],
    plan: [
      { step: '01', title: 'Listing', detail: 'A catalog entry: endpoint, USDC price, seller address.' },
      { step: '02', title: '402 + x402', detail: 'One endpoint that challenges, gets paid, and returns data.' },
      { step: '03', title: 'MPP session', detail: 'A second path that opens a channel for repeated calls.' },
      { step: '04', title: 'Agent demo', detail: 'An agent discovers the FX API and pays without an API key.' },
    ],
    stretch: [
      'Reputation, discovery, SLA history, and a machine-readable service manifest.',
    ],
    resources: [
      { label: 'x402 on Stellar', href: x402 },
      { label: 'MPP', href: mpp },
      { label: 'Soroban docs', href: soroban },
    ],
  },
  {
    slug: 'freelancer-escrow',
    number: '06',
    title: 'Global Freelancer Escrow',
    tagline: 'Milestone escrow in USDC, without a marketplace holding the funds.',
    category: 'Payments × Stablecoins',
    difficulty: 'Beginner/Intermediate',
    theme: 'payfi',
    buildWith: ['Soroban', 'USDC'],
    problem:
      'Freelance escrow usually means the platform custodies the money. Both sides wait on the platform to release it, and neither side can audit the rules.',
    idea:
      'A client locks $2,000 USDC in a Soroban escrow with milestones: Design $400, Frontend $800, Backend $800. Both parties approve a milestone and the contract releases that slice. A dispute state can refund.',
    whyNow:
      'Stellar’s strength is cross-border settlement and fiat connectivity. Its institutional report cites $2.3B average monthly cross-border stablecoin settlement across 17 stablecoins and 9+ fiat currencies.',
    userStory:
      'A client funds the job. The freelancer delivers design. Both approve. $400 releases. The rest stays locked until the next milestone, or returns through dispute.',
    flow: [
      'Client creates a $2,000 USDC agreement',
      'Milestones: Design $400, Frontend $800, Backend $800',
      'USDC sits in the escrow contract',
      'Both parties approve a milestone',
      'That slice releases',
      'Dispute can freeze and refund',
    ],
    mvp: [
      'Create an agreement with parties, total, and milestones.',
      'Deposit USDC into the contract.',
      'Dual approval releases one milestone.',
      'A dispute state blocks release.',
      'Refund the unreleased balance to the client.',
    ],
    contracts: [
      { name: 'Agreement', role: 'Stores client, freelancer, milestones, and status.' },
      { name: 'Escrow', role: 'Holds USDC and releases only on the approval rule.' },
      { name: 'Dispute', role: 'Freezes milestones and allows a refund path.' },
    ],
    stellarFeatures: [
      'USDC SAC transfers',
      'Multisig-style auth: client and freelancer both sign a release',
      'Onchain milestone balances',
    ],
    integrations: ['USDC', 'A local stablecoin', 'A fiat off-ramp'],
    plan: [
      { step: '01', title: 'Agreement', detail: 'Create the job and three milestone amounts that sum to the deposit.' },
      { step: '02', title: 'Deposit', detail: 'Lock USDC. Reject releases before the deposit lands.' },
      { step: '03', title: 'Release', detail: 'Both signatures pay the milestone to the freelancer.' },
      { step: '04', title: 'Dispute + refund', detail: 'Either party can open a dispute. Undisbursed funds return to the client.' },
      { step: '05', title: 'Demo', detail: 'Fund, approve design, show $400 out and $1,600 still locked.' },
    ],
    stretch: [
      'Let the freelancer choose settlement: USDC, a local stablecoin, or a fiat off-ramp.',
    ],
    resources: [
      { label: 'Stellar Asset Contract', href: sac },
      { label: 'Soroban docs', href: soroban },
      { label: 'Stellar docs', href: docs },
    ],
  },
  {
    slug: 'merchant-treasury',
    number: '07',
    title: 'Yielding Merchant Treasury',
    tagline: 'Keep the cash a business needs. Put the rest to work, and pull it back before payroll.',
    category: 'Payments × DeFi',
    difficulty: 'Intermediate',
    theme: 'infra',
    buildWith: ['Soroban', 'USDC', 'Blend', 'DeFindex'],
    problem:
      'Merchants hold idle USDC between customer payments and the next payroll or invoice. The cash earns nothing, but moving it by hand is how a payment gets missed.',
    idea:
      'Customer USDC lands in a merchant treasury and deploys automatically above a cash floor. When payroll or an invoice is due, the yield position unwinds back to USDC and pays. Example policy: keep $10k liquid, deploy everything above $10k, withdraw before payroll.',
    whyNow:
      'Blend is a major Stellar lending primitive, and the ecosystem is connecting RWAs and enterprise yield products into DeFi.',
    userStory:
      'A shop receives USDC all week. The treasury keeps $10,000 liquid and supplies the surplus. On Thursday the payroll job withdraws what it needs and pays employees.',
    flow: [
      'Customer pays USDC',
      'Merchant treasury',
      'Balance above the floor deploys to yield',
      'Payroll or invoice comes due',
      'Yield position returns to USDC',
      'Payment sends',
    ],
    mvp: [
      'Receive USDC into a treasury contract.',
      'A policy with a liquid floor, for example $10,000.',
      'Sweep surplus into a Blend or DeFindex position.',
      'Withdraw back to USDC before a scheduled payment.',
      'Show liquid balance, deployed balance, and the next payout.',
    ],
    contracts: [
      { name: 'Treasury', role: 'Receives USDC and enforces the liquid floor.' },
      { name: 'Policy', role: 'Stores the floor, the yield venue, and payout dates.' },
      { name: 'Yield adapter', role: 'Deposits and withdraws through Blend or DeFindex.' },
      { name: 'Payout', role: 'Pulls USDC and pays a payroll or invoice address.' },
    ],
    stellarFeatures: [
      'SAC USDC in and out',
      'Soroban calls into Blend and DeFindex',
      'Scheduled, policy-gated withdrawals',
    ],
    integrations: ['Blend', 'DeFindex', 'USDC'],
    plan: [
      { step: '01', title: 'Treasury', detail: 'Accept USDC and record a liquid floor.' },
      { step: '02', title: 'Sweep', detail: 'Deposit only the surplus into one yield venue.' },
      { step: '03', title: 'Unwind', detail: 'Withdraw enough USDC to cover a listed payout.' },
      { step: '04', title: 'Payroll demo', detail: 'Show $10k staying liquid and a payout leaving on schedule.' },
    ],
    stretch: [
      'Support more than one yield venue and pick by a declared liquidity rule.',
      'Queue invoices and payroll as first-class payouts with dates.',
    ],
    resources: [
      { label: 'Blend', href: blend },
      { label: 'DeFindex', href: defindex },
      { label: 'Stellar Asset Contract', href: sac },
    ],
  },
  {
    slug: 'rwa-portfolio',
    number: '08',
    title: 'Universal RWA Portfolio',
    tagline: 'A wealth account made of tokenized assets, labeled like a balance sheet.',
    category: 'RWA × Consumer Finance',
    difficulty: 'Intermediate',
    theme: 'rwa',
    buildWith: ['Soroban', 'SAC', 'USDC'],
    problem:
      'Stellar already hosts treasuries, money-market funds, private credit, and tokenized gold. A holder still sees ticker symbols — BENJI, USDC, XAUm, deJTRSY — instead of what they own.',
    idea:
      'Show the account as cash, treasuries, private credit, and gold. Let the user set an allocation, for example 50% treasuries, 20% gold, 20% credit, 10% cash. Soroban rebalances to those weights.',
    whyNow:
      'Stellar hosts multiple RWA classes, and its Q2 report said RWAs had crossed $3B by June.',
    userStory:
      'A saver picks an allocation. The account shows “Cash $2,100, US Treasuries $7,400, Private Credit $1,800, Gold $1,200”. A rebalance trade moves SAC balances toward the targets.',
    flow: [
      'Read SAC balances: BENJI, USDC, XAUm, deJTRSY',
      'Map each token to Cash, Treasuries, Private Credit, or Gold',
      'User sets target weights',
      'Soroban computes the trades',
      'Rebalance executes',
    ],
    mvp: [
      'Map four allowlisted assets to plain-language buckets.',
      'Price each bucket and show the dollar mix.',
      'Accept target weights that sum to 100%.',
      'Propose the trades that move the book to those weights.',
      'Execute the rebalance with the user’s authorization.',
    ],
    contracts: [
      { name: 'Portfolio', role: 'Stores the bucket map and the user’s target weights.' },
      { name: 'Valuation', role: 'Prices each SAC into a bucket total.' },
      { name: 'Rebalancer', role: 'Computes and submits the trades toward target weights.' },
    ],
    stellarFeatures: [
      'Multiple RWA SACs in one account',
      'Soroban auth on the rebalance',
      'Plain balances instead of raw tickers in the UI',
    ],
    integrations: ['BENJI or a treasury SAC', 'USDC', 'A gold token such as XAUm', 'A private-credit token', 'An oracle'],
    plan: [
      { step: '01', title: 'Bucket map', detail: 'Four assets, four labels, balances read from the account.' },
      { step: '02', title: 'Valuation', detail: 'Dollar value per bucket and a current mix.' },
      { step: '03', title: 'Targets', detail: 'Weights that must sum to 100. Reject anything else.' },
      { step: '04', title: 'Rebalance', detail: 'Compute deltas and execute the smallest set of transfers.' },
      { step: '05', title: 'Demo', detail: 'Show the balance-sheet view before and after one rebalance.' },
    ],
    stretch: [
      'Savings modes — Conservative, Income, Inflation Hedge — described as asset rules. Do not promise a return.',
    ],
    caution:
      'Savings modes are allocation rules, not a yield promise. Say which assets each mode holds. Do not state an expected return.',
    resources: [
      { label: 'Stellar Asset Contract', href: sac },
      { label: 'Stellar docs', href: docs },
      { label: 'Soroban docs', href: soroban },
    ],
  },
  {
    slug: 'compliance-passport',
    number: '09',
    title: 'Proof-of-Compliance Passport',
    tagline: 'Prove KYC, age, and jurisdiction without handing every protocol a passport.',
    category: 'ZK × Identity × RWA',
    difficulty: 'Advanced',
    theme: 'privacy',
    buildWith: ['Soroban', 'BN254', 'Poseidon'],
    problem:
      'Institutional DeFi needs to know that a user is KYC’d, accredited, and in an allowed jurisdiction. Sending a passport to every protocol exposes the identity those checks were meant to protect.',
    idea:
      'A KYC provider issues a credential. The user generates ZK proofs: age over 18, KYC passed, jurisdiction allowed. Soroban verifies the proof before an RWA purchase, a private-credit pool, or payroll.',
    whyNow:
      'Stellar’s privacy direction is configurable, compliance-ready privacy, and native ZK verification primitives are available now.',
    userStory:
      'A user proves they may buy a tokenized treasury. The pool contract checks the proof and opens the position. The passport never lands in the protocol’s storage.',
    flow: [
      'KYC provider issues a credential',
      'User generates proofs: age > 18, KYC passed, jurisdiction allowed',
      'Soroban verifies the proof',
      'The gated action proceeds',
    ],
    mvp: [
      'A credential issued by a known provider key.',
      'Three proofs: age, KYC, and an allowlisted jurisdiction.',
      'A verifier contract that accepts or rejects the proof.',
      'One gated action, such as an RWA purchase, that requires a valid proof.',
      'No raw identity fields in contract storage.',
    ],
    contracts: [
      { name: 'Credential', role: 'Commits to attributes signed by the KYC provider.' },
      { name: 'Verifier', role: 'Checks age, KYC, and jurisdiction proofs.' },
      { name: 'Gate', role: 'Refuses the protected call unless the verifier accepts.' },
    ],
    stellarFeatures: [
      'BN254 verification',
      'Poseidon commitments to credential attributes',
      'Compliance checks that do not store the underlying identity',
    ],
    integrations: ['A KYC issuer', 'An RWA purchase flow', 'A compliant liquidity pool'],
    plan: [
      { step: '01', title: 'Credential', detail: 'Provider signs a commitment to age band, KYC flag, and jurisdiction.' },
      { step: '02', title: 'Proofs', detail: 'Three statements the user can prove without revealing the source fields.' },
      { step: '03', title: 'Gate', detail: 'A purchase or deposit that reverts when verification fails.' },
      { step: '04', title: 'Demo', detail: 'Pass with an allowed jurisdiction. Fail with a blocked one. Show that storage has no passport data.' },
    ],
    stretch: [
      'Reuse one credential across RWA purchase, private credit, a compliant pool, and payroll.',
    ],
    resources: [
      { label: 'Privacy on Stellar', href: privacy },
      { label: 'ZK primitives', href: zk },
      { label: 'Soroban docs', href: soroban },
    ],
  },
  {
    slug: 'treasury-agent',
    number: '10',
    title: 'Autonomous Cross-Border Treasury Agent',
    tagline: 'The agent proposes the payment. Soroban decides whether it may execute.',
    category: 'AI × Payments × FX',
    difficulty: 'Advanced',
    theme: 'infra',
    buildWith: ['Soroban', 'USDC', 'x402', 'MPP'],
    problem:
      'A company operating in India, Brazil, Mexico, and the US has to move payroll, vendor payments, stablecoin balances, FX exposure, and yield by hand. An unbounded agent with a treasury key is worse than the spreadsheet.',
    idea:
      'The agent receives policies: keep $20k USD liquidity, pay Brazilian suppliers every Friday, park excess in approved yield assets, never hold more than 20% BRL, never transfer over $5k without a human. Balances flow through the agent into a Soroban policy engine that allows FX, stablecoins, yield, and payments only inside those rules.',
    whyNow:
      'This sits on the themes Stellar is shipping together: cross-border settlement, stablecoins, RWAs, Soroban, agentic payments, and programmable compliance.',
    userStory:
      'Friday arrives. The agent proposes the supplier payment in BRL. The policy allows it because it is under $5k and inside the BRL cap. A $9k transfer waits for a person. Excess USD above $20k can move into an approved yield asset.',
    flow: [
      'Bank and stablecoin balances',
      'Treasury agent proposes an action',
      'Soroban policy engine',
      'FX, stablecoins, yield, or payment — only if the rule passes',
    ],
    mvp: [
      'Ingest balances for USD and at least one local stablecoin.',
      'Encode the five policies onchain.',
      'Let the agent propose a payment, an FX trade, or a yield deposit.',
      'Execute only what the policy allows.',
      'Queue anything over $5k for human approval.',
      'Show the proposal, the rule that fired, and the result.',
    ],
    contracts: [
      { name: 'Policy engine', role: 'Liquidity floor, BRL cap, allowlisted yield, and the $5k approval rule.' },
      { name: 'Proposal', role: 'The agent submits an action. The engine accepts, rejects, or queues it.' },
      { name: 'FX adapter', role: 'Swaps between approved stablecoins inside the exposure cap.' },
      { name: 'Yield adapter', role: 'Deploys surplus above the USD floor into an approved venue.' },
    ],
    stellarFeatures: [
      'Multi-stablecoin SAC balances',
      'Soroban policy as the execution gate',
      'x402 or MPP if a vendor is paid per call',
      'Cross-border settlement without giving the agent the treasury key',
    ],
    integrations: ['USDC', 'A BRL stablecoin', 'Blend or DeFindex', 'x402', 'MPP'],
    plan: [
      { step: '01', title: 'Balances + policies', detail: 'Read two assets. Store the five rules.' },
      { step: '02', title: 'Proposals', detail: 'The agent submits pay, swap, or yield. The engine returns allow, deny, or needs approval.' },
      { step: '03', title: 'Payments', detail: 'A Friday supplier payment that passes, and a transfer over $5k that waits.' },
      { step: '04', title: 'FX + yield', detail: 'Block a swap that would push BRL over 20%. Sweep USD above $20k.' },
      { step: '05', title: 'Demo', detail: 'One allowed payment, one queued payment, one blocked FX move.' },
    ],
    stretch: [
      'Add India and Mexico corridors with the same policy shape.',
      'Pay a vendor API through x402 without raising the transfer cap.',
    ],
    resources: [
      { label: 'x402 on Stellar', href: x402 },
      { label: 'MPP', href: mpp },
      { label: 'Blend', href: blend },
      { label: 'DeFindex', href: defindex },
    ],
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
