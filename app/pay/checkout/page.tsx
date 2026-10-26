'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  AlertTriangle, ArrowLeft, CheckCircle2, CircleDollarSign, ExternalLink, Loader2, RefreshCw,
  ShieldCheck, Wallet2, XCircle,
} from 'lucide-react'
import { ExactStellarScheme } from '@x402/stellar/exact/client'
import { wrapFetchWithPayment, x402Client, x402HTTPClient } from '@x402/fetch'
import { Button } from '@/components/ui/button'
import { NovaMark } from '@/components/nova-mark'
import { StellarMark } from '@/components/stellar-mark'
import { Skeleton } from '@/components/ui/skeleton'
import { Index } from '@/components/landing/chapter'
import { useWalletKit } from '@/contexts/WalletKitContext'
import {
  PAY_API_BASE_URL, PayWallet, TrustlineReport, isPayNetwork, payApi, payNetwork, payRpcUrl,
  type PayNetwork,
} from '@/lib/payApi'
import { explorerTx } from '@/lib/networks'
import { cn, truncateAddress } from '@/lib/utils'
import { useSiteHref } from '@/lib/hosts'

type Challenge = {
  endpoint: string
  price: string
  asset: string
  network: PayNetwork
}

type Receipt = {
  transaction: string
  payer?: string
  body: Record<string, unknown>
}

const RESOURCE_PATHS = ['/pay/resource/', '/pay/live/resource/']

function trustedResource(value: string | null) {
  if (!value) return null
  try {
    const resource = new URL(value)
    const api = new URL(PAY_API_BASE_URL)
    const apiPath = api.pathname.replace(/\/$/, '')
    const legacyLocalOrigins = new Set(['http://localhost:3001', 'http://127.0.0.1:3001'])
    if (!RESOURCE_PATHS.some((path) => resource.pathname.startsWith(`${apiPath}${path}`))) return null
    if (resource.origin !== api.origin && !legacyLocalOrigins.has(resource.origin)) return null

    // Early production endpoints were serialized with the backend's local
    // fallback origin. Preserve the validated resource path while replacing
    // that unreachable origin with the configured public API origin.
    return new URL(`${resource.pathname}${resource.search}`, api.origin).toString()
  } catch {
    return null
  }
}

/** The facilitator's rejection reason from a 402's PAYMENT-REQUIRED header, if any. */
function paymentRequiredError(httpClient: x402HTTPClient, response: Response): string {
  try {
    return String(httpClient.getPaymentRequiredResponse((name) => response.headers.get(name)).error || '')
  } catch {
    return ''
  }
}

function priceNumber(price: string) {
  return Number(price.replace(/^\$/, ''))
}

const STEPS = ['Connect', 'Approve', 'Receipt']

function CheckoutContent() {
  const searchParams = useSearchParams()
  const resourceUrl = trustedResource(searchParams.get('resource'))
  const {
    address, connecting, connectWallet, disconnect, getWalletNetwork, isInitialized,
    selectedWallet, signAuthEntry,
  } = useWalletKit()
  const site = useSiteHref()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [wallets, setWallets] = useState<PayWallet[]>(FALLBACK_WALLETS)
  const [mobile, setMobile] = useState(false)
  const [trustline, setTrustline] = useState<TrustlineReport | null>(null)
  const [checkingTrustline, setCheckingTrustline] = useState(false)

  const network = payNetwork(challenge?.network)

  useEffect(() => {
    setMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
    payApi.getWallets().then((list) => { if (list.length) setWallets(list) }).catch(() => undefined)
  }, [])

  const loadChallenge = useCallback(async () => {
    if (!resourceUrl) {
      setError('This checkout link is invalid or does not belong to WebSoroban Pay.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(resourceUrl, { headers: { Accept: 'application/json' } })
      const body = await response.json().catch(() => ({}))
      if (response.status !== 402 || !response.headers.get('PAYMENT-REQUIRED')) {
        throw new Error(body?.message || `Expected a payment challenge, received HTTP ${response.status}.`)
      }
      setChallenge({
        endpoint: String(body.endpoint || 'Paid resource'),
        price: String(body.price || ''),
        asset: String(body.asset || 'USDC'),
        network: isPayNetwork(body.network) ? body.network : 'stellar:testnet',
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load this payment request.')
    } finally {
      setLoading(false)
    }
  }, [resourceUrl])

  useEffect(() => { void loadChallenge() }, [loadChallenge])

  // Check the payer can hold and spend USDC before asking for a signature.
  const checkPayer = useCallback(async (payer: string, payNetworkId: PayNetwork) => {
    setCheckingTrustline(true)
    try {
      setTrustline(await payApi.checkTrustline(payer, payNetworkId))
    } catch {
      setTrustline(null)
    } finally {
      setCheckingTrustline(false)
    }
  }, [])

  useEffect(() => {
    if (address && challenge) void checkPayer(address, challenge.network)
    else setTrustline(null)
  }, [address, challenge, checkPayer])

  /** Freighter reports its network reliably; other wallets are told which network to use. */
  const ensureNetwork = async (walletId: string) => {
    if (walletId !== 'freighter') return
    const walletNetwork = await getWalletNetwork()
    if (walletNetwork && walletNetwork.networkPassphrase !== network.passphrase) {
      throw new Error(`Switch Freighter to ${network.label}, then approve again.`)
    }
  }

  const connect = async (walletId: string) => {
    setError('')
    try {
      const payer = await connectWallet(walletId)
      await ensureNetwork(walletId)
      return payer
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Could not connect the wallet.')
      return null
    }
  }

  const shortfall = challenge && trustline?.balance != null && Number(trustline.balance) < priceNumber(challenge.price)
  const blocked = Boolean(trustline && !trustline.ready && trustline.status !== 'unknown') || Boolean(shortfall)

  const pay = async () => {
    if (!resourceUrl || !challenge || !address) return
    setPaying(true)
    setError('')
    setReceipt(null)
    try {
      const walletId = selectedWallet?.id || 'freighter'
      await ensureNetwork(walletId)
      const signer = {
        address,
        signAuthEntry: async (entry: string, options?: { networkPassphrase?: string }) =>
          signAuthEntry(entry, options?.networkPassphrase || network.passphrase),
      }
      const client = new x402Client().register(
        'stellar:*',
        new ExactStellarScheme(signer, { url: payRpcUrl(challenge.network) }),
      )

      // @x402/fetch 2.25 adds Access-Control-Expose-Headers to the outgoing
      // paid request even though it is a response header. Removing it avoids
      // an unnecessary CORS preflight field while retaining the x402 headers.
      const corsSafeFetch: typeof fetch = async (input, init) => {
        const request = new Request(input, init)
        request.headers.delete('Access-Control-Expose-Headers')
        return fetch(request)
      }
      const httpClient = new x402HTTPClient(client)
      let response = await wrapFetchWithPayment(corsSafeFetch, client)(resourceUrl, { headers: { Accept: 'application/json' } })
      // The facilitator re-simulates at verification; if network fees moved in
      // the seconds since signing it rejects with fee_below_minimum and nothing
      // is charged. Ask the wallet to sign once more, never more than once.
      if (response.status === 402 && /fee[ _]below[ _]minimum/i.test(paymentRequiredError(httpClient, response))) {
        setError('Network fees moved while you were signing, so nothing was charged. Approve once more in your wallet.')
        response = await wrapFetchWithPayment(corsSafeFetch, client)(resourceUrl, { headers: { Accept: 'application/json' } })
        setError('')
      }
      const body = await response.json().catch(() => ({})) as Record<string, unknown>
      if (!response.ok) {
        const fix = typeof body.fix === 'string' ? ` ${body.fix}` : ''
        throw new Error(String(body.message || body.error || `Payment failed with HTTP ${response.status}.`) + fix)
      }
      const settlement = httpClient.getPaymentSettleResponse((name) => response.headers.get(name))
      if (!settlement?.transaction) throw new Error('The resource unlocked, but no settlement receipt was returned.')
      setReceipt({ transaction: settlement.transaction, payer: settlement.payer, body })
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'The payment could not be settled.')
    } finally {
      setPaying(false)
    }
  }

  const checkoutWallets = wallets.filter((wallet) => wallet.checkout)
  const amount = challenge?.price.replace(/^\$/, '')
  // Which step of the flow the visitor is on, for the mono stepper.
  const stage = receipt ? 2 : address ? 1 : 0

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6" aria-label="Checkout">
          <Link href={site('/pay')} className="flex min-h-10 items-center gap-3 rounded-md pr-2 focus-visible:ring-2 focus-visible:ring-ring">
            <NovaMark className="h-7 w-7 rounded-md" />
            <span className="font-display text-[0.95rem] font-semibold tracking-[-0.02em]">WebSoroban Pay</span>
          </Link>
          <span className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground"><span className={cn('h-1.5 w-1.5 rounded-full', network.dotClass)} aria-hidden="true" /> Stellar {network.label}</span>
        </nav>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden="true" />
        <div className="relative grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <Link href={site('/pay')} className="group inline-flex min-h-10 items-center gap-2 rounded-md font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-3.5 w-3.5 transition-transform duration-150 motion-safe:group-hover:-translate-x-0.5" aria-hidden="true" /> Payment studio</Link>
            <p className="mt-10 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">Browser checkout</p>
            <h1 className="mt-6 font-display text-display font-medium">Approve once. Unlock instantly.</h1>
            <p className="lead mt-6 text-base">Connect a Stellar wallet, review the exact charge, and approve a single-use authorization. Your secret key never leaves the wallet.</p>
            <ol className="mt-10 border-t border-border" aria-label="Checkout steps">
              {STEPS.map((step, index) => (
                <li key={step} className={cn('flex items-center gap-4 border-b border-border py-3 text-sm transition-colors duration-150', index <= stage ? 'text-foreground' : 'text-muted-foreground')} aria-current={index === stage ? 'step' : undefined}>
                  <Index className={index <= stage ? 'text-foreground' : undefined}>0{index + 1}</Index>
                  {step}
                  {index < stage ? <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-success" aria-hidden="true" /> : index === stage ? <span className="blink ml-auto h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" /> : null}
                </li>
              ))}
            </ol>
          </div>

          <div className="figure ticks overflow-hidden lg:col-span-7">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md border border-border bg-background text-foreground"><StellarMark className="h-5 w-6" /></span>
                <div><p className="text-sm font-medium">Stellar payment</p><p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">x402 · exact scheme</p></div>
              </div>
              <span className={cn('rounded-sm border px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em]', network.badgeClass)}>{network.label}</span>
            </div>

            {loading ? <div className="space-y-4 p-5 sm:p-6"><Skeleton className="h-3 w-32" /><Skeleton className="h-12 w-48" /><Skeleton className="h-20 w-full" /><Skeleton className="h-12 w-full" /></div>
              : error && !challenge ? <div className="p-5 sm:p-6"><div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-5"><XCircle className="h-5 w-5 text-destructive" aria-hidden="true" /><h2 className="mt-3 font-display text-xl font-medium">Checkout unavailable</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><Button type="button" variant="outline" onClick={loadChallenge} className="mt-5"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry</Button></div></div>
              : receipt ? <div className="p-5 sm:p-6"><span className="grid h-12 w-12 place-items-center rounded-md border border-success/40 bg-success/10 text-success"><CheckCircle2 className="h-6 w-6" aria-hidden="true" /></span><p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-success">Payment settled</p><h2 className="mt-2 font-display text-display font-medium">Resource unlocked.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{String(receipt.body.message || 'The paid response is ready.')}</p><dl className="mt-6 border-t border-border font-mono text-xs"><div className="flex items-center justify-between gap-4 border-b border-border py-3"><dt className="uppercase tracking-[0.14em] text-muted-foreground">Transaction</dt><dd className="truncate">{receipt.transaction}</dd></div>{receipt.payer ? <div className="flex items-center justify-between gap-4 border-b border-border py-3"><dt className="uppercase tracking-[0.14em] text-muted-foreground">Payer</dt><dd className="truncate">{truncateAddress(receipt.payer)}</dd></div> : null}</dl><Button asChild size="lg" className="lit mt-6 h-12 w-full gap-2"><a href={explorerTx(network.id, receipt.transaction)} target="_blank" rel="noreferrer">View settlement receipt <ExternalLink className="h-4 w-4" aria-hidden="true" /></a></Button></div>
              : <div className="p-5 sm:p-6">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">{challenge?.endpoint}</p>
              <div className="mt-3 flex items-end gap-2"><span className="font-display text-5xl font-medium tabular-nums tracking-tightest">{amount}</span><span className="pb-1.5 font-mono text-sm text-muted-foreground">{challenge?.asset}</span></div>
              {network.isMainnet ? <p role="note" className="mt-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs leading-5 text-warning"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> This charges real USDC on Stellar Mainnet.</p> : null}
              <dl className="mt-6 border-t border-border font-mono text-xs">
                <div className="flex items-center justify-between gap-3 border-b border-border py-3"><dt className="flex items-center gap-2 uppercase tracking-[0.14em] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" /> Network fee</dt><dd>Sponsored by the facilitator</dd></div>
                <div className="flex items-center justify-between gap-3 border-b border-border py-3"><dt className="uppercase tracking-[0.14em] text-muted-foreground">Signature</dt><dd>One authorization entry</dd></div>
              </dl>

              {address ? <div className="mt-5 rounded-md border border-brand/40 bg-brand/5 p-4">
                <div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Paying with {selectedWallet?.name || 'your wallet'}</p><p className="mt-1 truncate font-mono text-sm">{truncateAddress(address)}</p></div><button type="button" onClick={() => { disconnect(); setTrustline(null) }} className="min-h-10 rounded-md px-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 hover:bg-brand/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Disconnect</button></div>
                <PayerStatus checking={checkingTrustline} trustline={trustline} shortfall={Boolean(shortfall)} price={amount || ''} />
                {selectedWallet && selectedWallet.id !== 'freighter' ? <p className="mt-3 text-xs leading-5 text-muted-foreground">Make sure {selectedWallet.name} is set to Stellar {network.label} before approving.</p> : null}
              </div> : null}

              {error ? <div role="alert" className="mt-5 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"><div className="flex gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{error}</span></div>{checkoutFix(error, network.label) ? <p className="mt-2 text-xs leading-5 text-foreground">{checkoutFix(error, network.label)}</p> : null}</div> : null}

              {!address ? (
                <div className="mt-6">
                  <p className="text-sm font-medium">Choose a wallet</p>
                  {mobile ? <p role="status" className="mt-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs leading-5 text-warning">Freighter Mobile cannot sign auth entries. Open this checkout in a desktop browser with a supported extension.</p> : null}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {checkoutWallets.map((wallet) => (
                      <Button key={wallet.id} type="button" variant={wallet.id === 'freighter' ? 'default' : 'outline'} size="lg" disabled={!isInitialized || connecting} onClick={() => connect(wallet.id)} className={cn('h-12 justify-start gap-2', wallet.id === 'freighter' && 'lit')}>
                        {connecting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wallet2 className="h-4 w-4" aria-hidden="true" />} {wallet.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <Button type="button" size="lg" disabled={paying || checkingTrustline || blocked} aria-busy={paying} onClick={pay} className="lit mt-6 h-12 w-full gap-2">
                  {paying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CircleDollarSign className="h-4 w-4" aria-hidden="true" />} {paying ? 'Waiting for approval…' : `Pay ${amount} ${challenge?.asset}`}
                </Button>
              )}
              <p className="mt-3 text-center font-mono text-[0.68rem] leading-5 text-muted-foreground">{network.isMainnet ? 'Real funds.' : 'Testnet assets only.'} Your wallet shows the authorization before anything settles.</p>
            </div>}
          </div>
        </div>

        <section className="relative mt-16 border-t border-border pt-8">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">Wallet compatibility</p>
              <h2 className="mt-3 font-display text-title font-medium">Auth entries, not a transaction signature.</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">x402 on Stellar asks the wallet to sign one Soroban authorization entry. These wallets can do that; the first group also works in this checkout.</p>
            </div>
            <ul className="lg:col-span-7">
              {wallets.map((wallet, index) => (
                <li key={wallet.id} className="grid grid-cols-[3rem_1fr_auto] items-start gap-4 border-t border-border py-3 text-sm last:border-b">
                  <Index className="pt-1">{String(index + 1).padStart(2, '0')}</Index>
                  <div>
                    <p className="font-medium">{wallet.name} <span className="font-mono text-xs text-muted-foreground">{wallet.platform}</span></p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{wallet.guidance}</p>
                  </div>
                  {wallet.checkout ? <span className="rounded-sm border border-success/40 px-2 py-0.5 font-mono text-[0.6rem] uppercase text-success">checkout</span> : !wallet.authEntry ? <span className="rounded-sm border border-destructive/40 px-2 py-0.5 font-mono text-[0.6rem] uppercase text-destructive">unsupported</span> : <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-[0.6rem] uppercase text-muted-foreground">client</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </main>
  )
}

function PayerStatus({ checking, trustline, shortfall, price }: { checking: boolean; trustline: TrustlineReport | null; shortfall: boolean; price: string }) {
  if (checking) return <p className="mt-3 flex items-center gap-2 font-mono text-[0.68rem] text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Checking USDC trustline…</p>
  if (!trustline) return null
  if (shortfall) {
    return <p role="status" className="mt-3 text-xs leading-5 text-destructive">This account holds {trustline.balance} USDC, less than the {price} USDC charge. Add USDC, then retry.</p>
  }
  if (trustline.ready) {
    return trustline.balance != null ? <p className="mt-3 flex items-center gap-1.5 font-mono text-[0.68rem] text-success"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> {trustline.balance} USDC available</p> : null
  }
  return (
    <div role="status" className={cn('mt-3 text-xs leading-5', trustline.status === 'unknown' ? 'text-muted-foreground' : 'text-destructive')}>
      <p>{trustline.message}</p>
      {trustline.fix ? <p className="mt-1 text-foreground">{trustline.fix}</p> : null}
    </div>
  )
}

const FALLBACK_WALLETS: PayWallet[] = [
  { id: 'freighter', name: 'Freighter', platform: 'Browser extension', authEntry: true, checkout: true, guidance: 'Supported in the hosted checkout.' },
  { id: 'freighter-mobile', name: 'Freighter Mobile', platform: 'iOS and Android', authEntry: false, checkout: false, guidance: 'Cannot sign auth entries. Use the desktop extension.' },
]

function checkoutFix(message: string, networkLabel: string) {
  const text = message.toLowerCase()
  if (text.includes('signature')) return `The signature does not match this challenge. Reconnect your wallet on ${networkLabel} and approve the authorization again.`
  if (text.includes('cannot sign') || text.includes('unsupported') || text.includes('mobile')) return 'Use Freighter (desktop), Hana, HOT, or Klever.'
  if (text.includes('not installed')) return 'Install the wallet extension, reload this page, and connect again.'
  if (text.includes('balance') || text.includes('allowance') || text.includes('insufficient')) return 'Add USDC to the paying account, then retry.'
  if (text.includes('trustline')) return 'Add a USDC trustline from your wallet, then retry.'
  return ''
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden="true" /></main>}><CheckoutContent /></Suspense>
}
