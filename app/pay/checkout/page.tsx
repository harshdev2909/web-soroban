'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft, CheckCircle2, CircleDollarSign, ExternalLink, Loader2, RefreshCw,
  ShieldCheck, Wallet2, XCircle,
} from 'lucide-react'
import { ExactStellarScheme } from '@x402/stellar/exact/client'
import { wrapFetchWithPayment, x402Client, x402HTTPClient } from '@x402/fetch'
import { Button } from '@/components/ui/button'
import { NovaMark } from '@/components/nova-mark'
import { StellarMark } from '@/components/stellar-mark'
import { Skeleton } from '@/components/ui/skeleton'
import { useWalletKit } from '@/contexts/WalletKitContext'
import { PAY_API_BASE_URL } from '@/lib/payApi'
import { explorerTx, TESTNET } from '@/lib/networks'
import { truncateAddress } from '@/lib/utils'

type Challenge = {
  endpoint: string
  price: string
  asset: string
  network: string
}

type Receipt = {
  transaction: string
  payer?: string
  body: Record<string, unknown>
}

function trustedResource(value: string | null) {
  if (!value) return null
  try {
    const resource = new URL(value)
    const api = new URL(PAY_API_BASE_URL)
    const apiPath = api.pathname.replace(/\/$/, '')
    if (resource.origin !== api.origin || !resource.pathname.startsWith(`${apiPath}/pay/resource/`)) return null
    return resource.toString()
  } catch {
    return null
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const resourceUrl = trustedResource(searchParams.get('resource'))
  const {
    address, connecting, connectFreighter, disconnect, getWalletNetwork, isInitialized,
    signAuthEntry, walletNetworkPassphrase,
  } = useWalletKit()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)

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
        network: String(body.network || 'stellar:testnet'),
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load this payment request.')
    } finally {
      setLoading(false)
    }
  }, [resourceUrl])

  useEffect(() => { void loadChallenge() }, [loadChallenge])

  const connect = async () => {
    setError('')
    try {
      const payer = await connectFreighter()
      const walletNetwork = await getWalletNetwork()
      if (walletNetwork?.networkPassphrase !== TESTNET.passphrase) {
        disconnect()
        throw new Error('Switch Freighter to Testnet, then connect again.')
      }
      return payer
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Could not connect Freighter.')
      return null
    }
  }

  const pay = async () => {
    if (!resourceUrl || !challenge) return
    setPaying(true)
    setError('')
    setReceipt(null)
    try {
      // Refresh the active Freighter account for every payment. The user may
      // have switched accounts since this page was opened.
      const payer = await connect()
      if (!payer) return
      const walletNetwork = await getWalletNetwork()
      if (walletNetwork?.networkPassphrase !== TESTNET.passphrase) {
        throw new Error('Switch Freighter to Testnet before approving this payment.')
      }

      const signer = {
        address: payer,
        signAuthEntry: async (entry: string, options?: { networkPassphrase?: string }) =>
          signAuthEntry(entry, options?.networkPassphrase || TESTNET.passphrase),
      }
      const client = new x402Client().register(
        'stellar:*',
        new ExactStellarScheme(signer, { url: 'https://soroban-testnet.stellar.org' }),
      )

      // @x402/fetch 2.25 adds Access-Control-Expose-Headers to the outgoing
      // paid request even though it is a response header. Removing it avoids
      // an unnecessary CORS preflight field while retaining the x402 headers.
      const corsSafeFetch: typeof fetch = async (input, init) => {
        const request = new Request(input, init)
        request.headers.delete('Access-Control-Expose-Headers')
        return fetch(request)
      }
      const response = await wrapFetchWithPayment(corsSafeFetch, client)(resourceUrl, {
        headers: { Accept: 'application/json' },
      })
      const body = await response.json().catch(() => ({})) as Record<string, unknown>
      if (!response.ok) {
        throw new Error(String(body.message || body.error || `Payment failed with HTTP ${response.status}.`))
      }
      const settlement = new x402HTTPClient(client).getPaymentSettleResponse((name) => response.headers.get(name))
      if (!settlement?.transaction) throw new Error('The resource unlocked, but no settlement receipt was returned.')
      setReceipt({ transaction: settlement.transaction, payer: settlement.payer, body })
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'The payment could not be settled.')
    } finally {
      setPaying(false)
    }
  }

  const connectedToTestnet = walletNetworkPassphrase === TESTNET.passphrase

  return (
    <main className="nova-landing min-h-screen bg-background text-foreground">
      <header className="px-4 pt-4 sm:px-6">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl border border-border/70 bg-background/85 px-4 shadow-sm backdrop-blur-xl">
          <Link href="/pay" className="flex min-h-10 items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-ring">
            <NovaMark className="h-8 w-8 rounded-xl" />
            <span className="font-display text-lg font-semibold">WebSoroban Pay</span>
          </Link>
          <span className="hidden items-center gap-2 font-mono text-xs text-muted-foreground sm:flex"><span className="h-2 w-2 rounded-full bg-success" /> Stellar Testnet</span>
        </nav>
      </header>

      <section className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="nova-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="pt-3">
            <Link href="/pay" className="inline-flex min-h-10 items-center gap-2 rounded-xl text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4" /> Payment studio</Link>
            <p className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-brand">Browser checkout</p>
            <h1 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">Approve once. Unlock instantly.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">Connect Freighter, review the exact testnet charge, and approve a single-use Stellar authorization. Your secret key never leaves the wallet.</p>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border/70 pt-5 font-mono text-[0.62rem] text-muted-foreground">
              <span>01 · Connect</span><span>02 · Approve</span><span>03 · Receipt</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-foreground/15 bg-card shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-brand-foreground"><StellarMark className="h-6 w-7" /></span><div><p className="font-display font-semibold">Stellar payment</p><p className="font-mono text-[0.62rem] text-muted-foreground">x402 · exact scheme</p></div></div>
              <span className="rounded-full border border-success/25 bg-success/10 px-3 py-1.5 font-mono text-[0.62rem] text-success">TESTNET</span>
            </div>

            {loading ? <div className="space-y-4 p-6 sm:p-8"><Skeleton className="h-5 w-32" /><Skeleton className="h-14 w-48" /><Skeleton className="h-24 w-full rounded-2xl" /><Skeleton className="h-12 w-full rounded-full" /></div> : error && !challenge ? <div className="p-6 sm:p-8"><div role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5"><XCircle className="h-5 w-5 text-destructive" /><h2 className="mt-3 font-display text-xl font-semibold">Checkout unavailable</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><Button type="button" variant="outline" onClick={loadChallenge} className="mt-5 rounded-xl"><RefreshCw className="h-4 w-4" /> Retry</Button></div></div> : receipt ? <div className="p-6 sm:p-8"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-success/10 text-success"><CheckCircle2 className="h-7 w-7" /></span><p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-success">Payment settled</p><h2 className="mt-2 font-display text-3xl font-semibold">Resource unlocked.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{String(receipt.body.message || 'The paid response is ready.')}</p><div className="mt-6 rounded-2xl border border-border bg-muted/45 p-4"><p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Transaction</p><p className="mt-2 truncate font-mono text-xs">{receipt.transaction}</p></div><Button asChild size="lg" className="mt-6 h-12 w-full rounded-full"><a href={explorerTx('testnet', receipt.transaction)} target="_blank" rel="noreferrer">View settlement receipt <ExternalLink className="h-4 w-4" /></a></Button></div> : <div className="p-6 sm:p-8">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">{challenge?.endpoint}</p>
              <div className="mt-3 flex items-end gap-2"><span className="font-display text-5xl font-semibold tracking-tight">{challenge?.price.replace(/^\$/, '')}</span><span className="pb-1.5 font-mono text-sm text-muted-foreground">{challenge?.asset}</span></div>
              <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-success" /> Fee sponsored</span><span className="font-mono text-xs">Single authorization</span></div></div>

              {address ? <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-brand/20 bg-brand/5 p-4"><div className="min-w-0"><p className="text-xs text-muted-foreground">Paying with Freighter</p><p className="mt-1 truncate font-mono text-sm">{truncateAddress(address)}</p></div><button type="button" onClick={disconnect} className="min-h-10 rounded-xl px-3 text-xs text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Disconnect</button></div> : null}

              {error ? <div role="alert" className="mt-5 flex gap-2 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"><XCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div> : null}

              {!address ? <Button type="button" size="lg" disabled={!isInitialized || connecting} onClick={connect} className="mt-6 h-12 w-full rounded-full">{connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet2 className="h-4 w-4" />} {connecting ? 'Connecting Freighter…' : 'Connect Freighter'}</Button> : <Button type="button" size="lg" disabled={paying || !connectedToTestnet} aria-busy={paying} onClick={pay} className="mt-6 h-12 w-full rounded-full">{paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleDollarSign className="h-4 w-4" />} {paying ? 'Waiting for approval…' : `Pay ${challenge?.price.replace(/^\$/, '')} ${challenge?.asset}`}</Button>}
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Testnet assets only. Freighter will show the authorization before anything settles.</p>
            </div>}
          </div>
        </div>
      </section>
    </main>
  )
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="nova-landing grid min-h-screen place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-brand" /></main>}><CheckoutContent /></Suspense>
}
