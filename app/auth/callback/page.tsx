'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { authApi, walletApi, type WalletInfo } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, copyToClipboard, formatXlm, truncateAddress } from '@/lib/utils'
import { Loader2, Wallet, Check, Copy, ArrowRight, AlertTriangle } from 'lucide-react'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
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

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get('token')
      const success = searchParams.get('success')
      const error = searchParams.get('error')

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
        setPhase('ready')
      } catch (err) {
        console.error('Auth callback failed:', err)
        // Auth likely still succeeded; let them into the IDE.
        setPhase('error')
      }
    }
    run()
  }, [searchParams, router, refreshUser])

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
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" />
          <p className="mt-4 font-display text-lg font-semibold">
            {phase === 'auth' ? 'Signing you in…' : 'Provisioning your testnet wallet…'}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {phase === 'auth' ? 'Verifying your session.' : 'Creating and funding a keypair via Friendbot.'}
          </p>
          {phase === 'wallet' && (
            <div className="mt-5 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          )}
        </div>
      </Shell>
    )
  }

  if (phase === 'error') {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <AlertTriangle className="mx-auto h-7 w-7 text-warning" />
          <p className="mt-4 font-display text-lg font-semibold">You&apos;re signed in</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your wallet will finish provisioning in the IDE.
          </p>
          <Button className="mt-6 w-full gap-2" onClick={() => router.push('/ide')}>
            Continue to the IDE <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Shell>
    )
  }

  // ready
  const lowBalance = wallet ? wallet.balance < 10 : false
  return (
    <Shell>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="border-b border-border bg-radial-fade px-8 py-6 text-center">
          <span className="grid mx-auto h-12 w-12 place-items-center rounded-xl bg-brand/15 text-brand">
            <Wallet className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold">Your testnet wallet is ready</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We created and funded a Stellar testnet keypair for you. Contracts deploy from this address.
          </p>
        </div>

        <div className="px-8 py-6">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Public key</p>
          <button
            onClick={onCopy}
            className="group mt-1 flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-left hover:bg-muted"
          >
            <code className="truncate font-mono text-xs">{wallet?.publicKey}</code>
            {copied ? <Check className="h-4 w-4 shrink-0 text-success" /> : <Copy className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />}
          </button>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Balance</p>
              <p className="font-mono-tnum text-2xl font-semibold leading-none">
                {formatXlm(wallet?.balance ?? 0)} <span className="text-sm font-normal text-muted-foreground">XLM</span>
              </p>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
                lowBalance
                  ? 'border border-warning/30 bg-warning/10 text-warning'
                  : 'border border-success/30 bg-success/10 text-success',
              )}
            >
              {wallet?.funded ? 'Funded' : 'Pending'}
            </span>
          </div>

          <Button className="mt-6 w-full gap-2" onClick={() => router.push('/ide')}>
            Enter the IDE <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
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
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" />
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          </div>
        </Shell>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
