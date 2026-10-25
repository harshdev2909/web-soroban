'use client'

import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn, copyToClipboard, truncateAddress } from '@/lib/utils'
import { useWalletKit } from '@/contexts/WalletKitContext'
import { useNetwork } from '@/contexts/NetworkContext'
import { getNetwork, MAINNET, TESTNET, type FrontendNetwork } from '@/lib/networks'
import { toast } from 'sonner'
import { Plug, Copy, Check, LogOut, Loader2, AlertTriangle } from 'lucide-react'

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
        className={cn('h-9 gap-2 rounded-md border-border bg-card px-2.5 font-mono text-[0.72rem] uppercase tracking-[0.12em] hover:border-foreground/30 hover:bg-accent', className)}
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
            'h-9 gap-2.5 rounded-md border-border bg-card px-2.5 font-mono text-xs hover:border-foreground/30 hover:bg-accent',
            mismatch && 'border-warning/50',
            className,
          )}
        >
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', mismatch ? 'bg-warning' : walletNet?.dotClass ?? 'bg-muted-foreground')} />
          <span className="text-foreground">{truncateAddress(address)}</span>
          {mismatch && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 rounded-lg border-border bg-popover p-0 shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="leading-tight">
            <p className="eyebrow">Signing wallet</p>
            <p className="mt-1.5 text-xs text-muted-foreground">Signs your mainnet transactions</p>
          </div>
          {walletNet ? (
            <span className={cn('rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em]', walletNet.badgeClass)}>
              {walletNet.label}
            </span>
          ) : (
            <span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
              Unknown
            </span>
          )}
        </div>

        <div className="px-4 py-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Address</p>
          <button
            onClick={onCopy}
            className="group mt-1.5 flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-left transition-colors duration-150 hover:border-foreground/30"
          >
            <code className="truncate font-mono text-xs text-foreground">{address}</code>
            {copied ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground" />
            )}
          </button>

          {mismatch ? (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-border border-l-2 border-l-warning bg-card px-3 py-2.5 text-xs leading-5 text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Your wallet is on <b className="font-medium">{walletNet?.label}</b>, but you&apos;re targeting <b className="font-medium">{target.label}</b>. Switch the
                network in your wallet before signing.
              </span>
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              This account signs your {target.label} deploys and writes, separate from the server wallet.
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
