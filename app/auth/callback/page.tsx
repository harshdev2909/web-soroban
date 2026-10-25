'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { authApi, walletApi, type WalletInfo } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, copyToClipboard, formatXlm, truncateAddress } from '@/lib/utils'
import { Loader2, Wallet, Check, Copy, ArrowRight, AlertTriangle } from 'lucide-react'

const AUTH_RETURN_TO_KEY = 'websoroban.auth.returnTo'

function safeReturnTo(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/projects'
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 text-foreground">
      <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const [phase, setPhase] = useState<'auth' | 'wallet' | 'ready' | 'error'>('auth')
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [copied, setCopied] = useState(false)
  const [returnTo, setReturnTo] = useState('/projects')
  const ranRef = useRef(false)

  useEffect(() => {
    // Run exactly once. Without this guard, the wallet `ensure` + `auth/me`
    // calls fire in a loop on every re-render.
    if (ranRef.current) return
    ranRef.current = true

    const run = async () => {
      const token = searchParams.get('token')
      const success = searchParams.get('success')
      const error = searchParams.get('error')
      const destination = safeReturnTo(window.sessionStorage.getItem(AUTH_RETURN_TO_KEY))
      window.sessionStorage.removeItem(AUTH_RETURN_TO_KEY)
      setReturnTo(destination)

      if (error || success !== 'true' || !token) {
        router.push(error ? `/?error=${encodeURIComponent(error)}` : '/')
        return
      }

      try {
        authApi.setToken(token)
        await refreshUser()
        setPhase('wallet')
        const w = await walletApi.ensure()
        setWallet(w)
        if (destination !== '/projects') {
          router.replace(destination)
          return
        }
        setPhase('ready')
      } catch (err) {
        console.error('Auth callback failed:', err)
        // Auth likely still succeeded; let them into the IDE.
        setPhase('error')
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCopy = async () => {
    if (!wallet) return
    if (await copyToClipboard(wallet.publicKey)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  if (phase === 'auth' || phase === 'wallet') {
    return (
      <Shell>
        <div className="figure ticks p-8">
          <p className="eyebrow flex items-center gap-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand motion-reduce:animate-none" aria-hidden />
            {phase === 'auth' ? 'Step 01 · Session' : 'Step 02 · Wallet'}
          </p>
          <p className="mt-6 font-display text-title font-medium">
            {phase === 'auth' ? 'Signing you in.' : 'Provisioning your testnet wallet.'}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {phase === 'auth' ? 'Verifying your session.' : 'Creating and funding a keypair via Friendbot.'}
          </p>
          {phase === 'wallet' && (
            <div className="mt-6 space-y-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-8 w-2/3 rounded-md" />
            </div>
          )}
        </div>
      </Shell>
    )
  }

  if (phase === 'error') {
    return (
      <Shell>
        <div className="figure ticks p-8">
          <p className="eyebrow flex items-center gap-3 text-warning">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            Wallet pending
          </p>
          <p className="mt-6 font-display text-title font-medium">You&apos;re signed in.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your wallet will finish provisioning in a moment.
          </p>
          <Button className="lit mt-6 w-full gap-2" onClick={() => router.push(returnTo)}>
            {returnTo === '/pay' ? 'Continue to payment studio' : 'Continue to your projects'} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Shell>
    )
  }

  // ready
  const lowBalance = wallet ? wallet.balance < 10 : false
  return (
    <Shell>
      <div className="figure ticks overflow-hidden">
        <div className="border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-border text-brand">
              <Wallet className="h-4 w-4" />
            </span>
            <span className="eyebrow">Testnet wallet</span>
          </div>
          <h1 className="mt-6 font-display text-title font-medium">Your testnet wallet is ready.</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We created and funded a Stellar testnet keypair for you. Your contracts deploy from this address.
          </p>
        </div>

        <div className="px-8 py-6">
          <p className="eyebrow">Public key</p>
          <button
            onClick={onCopy}
            className="group mt-2 flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-left transition-colors duration-150 hover:border-foreground/30"
            aria-label={`Copy public key ${truncateAddress(wallet?.publicKey ?? '')}`}
          >
            <code className="truncate font-mono text-xs">{wallet?.publicKey}</code>
            {copied ? <Check className="h-4 w-4 shrink-0 text-success" /> : <Copy className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground" />}
          </button>

          <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
            <div>
              <p className="eyebrow">Balance</p>
              <p className="mt-2 font-mono-tnum text-2xl font-medium leading-none">
                {formatXlm(wallet?.balance ?? 0)} <span className="font-mono text-xs text-muted-foreground">XLM</span>
              </p>
            </div>
            <span
              className={cn(
                'rounded-sm border px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em]',
                lowBalance
                  ? 'border-warning/30 bg-warning/10 text-warning'
                  : 'border-success/30 bg-success/10 text-success',
              )}
            >
              {wallet?.funded ? 'Funded' : 'Pending'}
            </span>
          </div>

          <Button className="lit mt-6 w-full gap-2" onClick={() => router.push('/projects')}>
            Continue to your projects <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-3 font-mono text-[0.68rem] text-muted-foreground">
            Your secret key is encrypted on the server and never shown.
          </p>
        </div>
      </div>
    </Shell>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <div className="figure ticks p-8">
            <p className="eyebrow flex items-center gap-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand motion-reduce:animate-none" aria-hidden />
              Loading
            </p>
          </div>
        </Shell>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
