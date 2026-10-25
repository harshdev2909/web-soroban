"use client"

/**
 * Credit balance indicator for the Copilot/IDE header. Fetches the balance, and
 * live-updates after each run via the `credits:updated` window event the Copilot
 * panel dispatches (from the run's socket events). Click to buy more.
 */
import { useCallback, useEffect, useState } from 'react'
import { Coins, Loader2 } from 'lucide-react'
import { billingApi } from '@/lib/billingApi'
import { UpgradeModal } from './upgrade-modal'

/** Other components dispatch this with the new balance after a run completes. */
export const CREDITS_UPDATED_EVENT = 'credits:updated'

export function emitCreditsUpdated(balance?: number) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CREDITS_UPDATED_EVENT, { detail: balance }))
}

export function CreditBadge({ compact = false }: { compact?: boolean }) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const { balance } = await billingApi.getBalance()
      setBalance(balance)
    } catch {
      /* offline-tolerant */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (typeof detail === 'number') setBalance(detail)
      else refresh()
    }
    window.addEventListener(CREDITS_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(CREDITS_UPDATED_EVENT, onUpdate)
  }, [refresh])

  const low = balance !== null && balance <= 0
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="AI credits — click to buy more"
        className={`flex min-h-7 items-center gap-1.5 rounded-sm border px-2 font-mono text-[0.68rem] transition-[background-color,border-color,color] duration-150 ${
          low
            ? 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20'
            : 'border-border text-foreground hover:border-foreground/30'
        }`}
      >
        <Coins className={`h-3 w-3 ${low ? 'text-destructive' : 'text-brand'}`} />
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="font-mono-tnum">{(balance ?? 0).toLocaleString()}</span>}
        {!compact && <span className="uppercase tracking-[0.12em] text-muted-foreground">credits</span>}
      </button>
      <UpgradeModal open={open} onOpenChange={setOpen} outOfCredits={low} />
    </>
  )
}

export default CreditBadge
