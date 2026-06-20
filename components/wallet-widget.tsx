'use client'

import { useCallback, useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, copyToClipboard, formatXlm, truncateAddress } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { networkApi, type NetWalletInfo } from '@/lib/mainnetApi'
import { getNetwork } from '@/lib/networks'
import { toast } from 'sonner'
import { Wallet, Copy, Check, Droplets, RefreshCw, AlertTriangle, Loader2, KeyRound, HelpCircle } from 'lucide-react'
import { MainnetManual } from '@/components/network/mainnet-manual'
import { ExportKeyModal } from '@/components/network/export-key-modal'

/**
 * Server-managed per-user Stellar wallet — the SAME address on both networks.
 * Shows the active network's balance, funds via faucet on testnet (or the
 * funding guide on mainnet), and offers a hardened private-key export. Never
 * displays the secret inline.
 */
export function WalletWidget({ className }: { className?: string }) {
  const { isAuthenticated } = useAuth()
  const { network } = useNetwork()
  const cfg = getNetwork(network)
  const [wallet, setWallet] = useState<NetWalletInfo | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'funding' | 'error'>('loading')
  const [copied, setCopied] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const lowThreshold = network === 'mainnet' ? 5 : 10

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await networkApi.wallet(network)
      setWallet(data)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }, [network])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  if (!isAuthenticated) return null

  const lowBalance = wallet ? wallet.balance < lowThreshold : false

  const onCopy = async () => {
    if (!wallet) return
    if (await copyToClipboard(wallet.publicKey)) {
      setCopied(true)
      toast.success('Address copied')
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const onFund = async () => {
    if (network === 'mainnet') {
      setManualOpen(true)
      return
    }
    setStatus('funding')
    try {
      const data = await networkApi.fund('testnet')
      await load()
      setStatus('idle')
      toast.success('Faucet top-up requested', { description: `Balance: ${formatXlm((data as any).balance ?? wallet?.balance ?? 0)} XLM` })
    } catch {
      setStatus('error')
      toast.error('Faucet request failed')
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Your wallet"
          className={cn('h-9 gap-2 border-border bg-card/60 px-2.5 font-mono text-xs hover:bg-accent', className)}
        >
          <span className="relative flex h-2 w-2">
            <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping', cfg.dotClass)} />
            <span className={cn('relative inline-flex h-2 w-2 rounded-full', cfg.dotClass)} />
          </span>
          {status === 'loading' && !wallet ? (
            <Skeleton className="h-3.5 w-24" />
          ) : wallet ? (
            <span className="text-foreground">{truncateAddress(wallet.publicKey)}</span>
          ) : (
            <span className="text-muted-foreground">Wallet</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand/15 text-brand">
              <Wallet className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Your wallet</p>
              <p className="text-[11px] text-muted-foreground">Same address on both networks</p>
            </div>
          </div>
          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', cfg.badgeClass)}>
            {cfg.label}
          </span>
        </div>

        {status === 'error' ? (
          <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="text-sm text-muted-foreground">Couldn&apos;t load your wallet.</p>
            <Button size="sm" variant="outline" onClick={load} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        ) : !wallet ? (
          <div className="space-y-3 px-4 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <div className="px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Public key</p>
            <button
              onClick={onCopy}
              className="group mt-1 flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <code className="truncate font-mono text-xs text-foreground">{wallet.publicKey}</code>
              {copied ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
              )}
            </button>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{cfg.label} balance</p>
                <p className="font-mono-tnum text-2xl font-semibold leading-none">
                  {formatXlm(wallet.balance)} <span className="text-sm font-normal text-muted-foreground">XLM</span>
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  wallet.funded ? cfg.badgeClass : 'border border-warning/30 bg-warning/10 text-warning',
                )}
              >
                {wallet.funded ? 'Funded' : 'Unfunded'}
              </span>
            </div>

            {lowBalance && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-warning">
                <AlertTriangle className="h-3 w-3" /> Low balance for {cfg.label} — top up before deploying.
              </p>
            )}

            <Button
              onClick={onFund}
              disabled={status === 'funding'}
              size="sm"
              className="mt-4 w-full gap-2"
              variant={lowBalance ? 'default' : 'outline'}
            >
              {status === 'funding' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : network === 'mainnet' ? (
                <HelpCircle className="h-4 w-4" />
              ) : (
                <Droplets className="h-4 w-4" />
              )}
              {network === 'mainnet' ? 'How to fund' : status === 'funding' ? 'Requesting…' : 'Fund via faucet'}
            </Button>

            <Button onClick={() => setExportOpen(true)} size="sm" variant="ghost" className="mt-2 w-full gap-2 text-muted-foreground hover:text-foreground">
              <KeyRound className="h-3.5 w-3.5" /> Export private key
            </Button>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {network === 'mainnet'
                ? 'On mainnet you sign in your connected wallet by default — your key is never sent to the server.'
                : 'Testnet deploys are signed for you. The secret key stays encrypted on the server.'}
            </p>
          </div>
        )}
      </PopoverContent>

      <MainnetManual open={manualOpen} onOpenChange={setManualOpen} />
      <ExportKeyModal open={exportOpen} onOpenChange={setExportOpen} />
    </Popover>
  )
}
