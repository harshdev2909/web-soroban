'use client'

import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn, copyToClipboard, truncateAddress } from '@/lib/utils'
import { useWalletKit } from '@/contexts/WalletKitContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { getNetwork, MAINNET, TESTNET, type FrontendNetwork } from '@/lib/networks'
import { toast } from 'sonner'
import { Wallet2, Plug, Copy, Check, LogOut, Loader2, AlertTriangle } from 'lucide-react'

/**
 * The CONNECTED BROWSER WALLET — the account that actually signs mainnet
 * transactions. Distinct from <WalletWidget/>, which shows the server-managed
 * custodial wallet. Surfaces the wallet's *live* network and warns when it
 * doesn't match the network you're targeting (the classic wrong-network footgun).
 *
 * Self-hides on testnet unless a wallet is connected, so it only adds a chip when
 * it's actually relevant (mainnet signing, or an existing connection to manage).
 */

/** Resolve the visual/network config from a live wallet passphrase. */
function networkFromPassphrase(passphrase: string | null): FrontendNetwork | null {
  if (!passphrase) return null
  if (passphrase === MAINNET.passphrase) return MAINNET
  if (passphrase === TESTNET.passphrase) return TESTNET
  return null
}

export function ConnectedWalletChip({ className }: { className?: string }) {
  const { address, isConnected, connecting, connect, disconnect, walletNetworkPassphrase, getWalletNetwork } = useWalletKit()
  const { network } = useNetwork()
  const target = getNetwork(network) // the app's target network
  const [copied, setCopied] = useState(false)

  // If the connection was restored from a previous session, the live network
  // isn't known yet — read it once. Silent for an already-allowed wallet; never
  // runs while disconnected, so it can't pop the extension on load.
  useEffect(() => {
    if (address && !walletNetworkPassphrase) {
      getWalletNetwork().catch(() => {})
    }
  }, [address, walletNetworkPassphrase, getWalletNetwork])

  const walletNet = networkFromPassphrase(walletNetworkPassphrase)
  const mismatch = walletNet ? walletNet.id !== network : false

  // Keep the header uncluttered: only show on mainnet, or whenever a wallet is
  // actually connected (so it can always be inspected / disconnected).
  if (network !== 'mainnet' && !isConnected) return null

  const onConnect = async () => {
    try {
      await connect()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to connect wallet')
    }
  }

  const onCopy = async () => {
    if (!address) return
    if (await copyToClipboard(address)) {
      setCopied(true)
      toast.success('Address copied')
      setTimeout(() => setCopied(false), 1500)
    }
  }

  if (!isConnected || !address) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onConnect}
        disabled={connecting}
        aria-label="Connect signing wallet"
        className={cn('h-9 gap-2 border-border bg-card/60 px-2.5 text-xs hover:bg-accent', className)}
      >
        {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">Connect wallet</span>
      </Button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Signing wallet"
          className={cn(
            'h-9 gap-2 border-border bg-card/60 px-2.5 font-mono text-xs hover:bg-accent',
            mismatch && 'border-warning/50',
            className,
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className={cn('relative inline-flex h-2 w-2 rounded-full', mismatch ? 'bg-warning' : walletNet?.dotClass ?? 'bg-muted-foreground')} />
          </span>
          <span className="text-foreground">{truncateAddress(address)}</span>
          {mismatch && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand/15 text-brand">
              <Wallet2 className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Signing wallet</p>
              <p className="text-[11px] text-muted-foreground">Signs your mainnet transactions</p>
            </div>
          </div>
          {walletNet ? (
            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', walletNet.badgeClass)}>
              {walletNet.label}
            </span>
          ) : (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Unknown
            </span>
          )}
        </div>

        <div className="px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Address</p>
          <button
            onClick={onCopy}
            className="group mt-1 flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted"
          >
            <code className="truncate font-mono text-xs text-foreground">{address}</code>
            {copied ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
            )}
          </button>

          {mismatch ? (
            <div className="mt-3 flex items-start gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-[11px] text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Your wallet is on <b>{walletNet?.label}</b>, but you&apos;re targeting <b>{target.label}</b>. Switch the
                network in your wallet before signing.
              </span>
            </div>
          ) : (
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              This account signs your {target.label} deploys and writes — separate from the server wallet above.
            </p>
          )}

          <Button
            onClick={disconnect}
            size="sm"
            variant="ghost"
            className="mt-3 w-full gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Disconnect
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
