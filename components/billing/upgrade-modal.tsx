"use client"

/**
 * Out-of-credits / buy-credits modal. Shows the 3 credit packs (price + credits)
 * and starts a Dodo checkout on Buy → redirects to the hosted checkout URL.
 */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Coins, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Index } from '@/components/landing/chapter'
import { billingApi, type CreditPack } from '@/lib/billingApi'
import { cn } from '@/lib/utils'

export function UpgradeModal({
  open,
  onOpenChange,
  outOfCredits,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  outOfCredits?: boolean
}) {
  const [plans, setPlans] = useState<CreditPack[]>([])
  const [crypto, setCrypto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    billingApi
      .getPlans()
      .then((r) => { setPlans(r.plans); setCrypto(!!r.crypto) })
      .catch((e) => toast.error(e.message || 'Failed to load plans'))
      .finally(() => setLoading(false))
  }, [open])

  const buy = async (pack: CreditPack) => {
    setBuying(pack.key)
    try {
      const { checkout_url } = await billingApi.checkout(pack.key)
      window.location.href = checkout_url
    } catch (e: any) {
      toast.error(e.message || 'Could not start checkout')
      setBuying(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display font-medium">
            <Coins className="h-4 w-4 text-brand" />
            {outOfCredits ? 'You’re out of credits' : 'Buy AI credits'}
          </DialogTitle>
          <DialogDescription>
            {outOfCredits
              ? 'Top up to keep using the Copilot. Credits are charged per run based on actual model cost.'
              : 'One-time credit packs. Credits are charged per run based on actual model cost.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-background p-4">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="mt-5 h-6 w-16" />
                <Skeleton className="mt-2 h-3 w-20" />
                <Skeleton className="mt-4 h-8 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
            {plans.map((p, i) => (
              <div key={p.key} className="flex flex-col bg-background p-4">
                <div className="flex items-center justify-between">
                  <Index>{String(i + 1).padStart(2, '0')}</Index>
                  {i === 1 && <Index className="text-brand">popular</Index>}
                </div>
                <span className="mt-4 text-sm font-medium text-foreground">{p.name}</span>
                <span className="mt-1 font-display text-2xl font-medium text-foreground">{p.priceLabel}</span>
                <span className="mt-1 font-mono-tnum text-xs text-muted-foreground">{p.credits.toLocaleString()} credits</span>
                <Button
                  size="sm"
                  variant={i === 1 ? 'default' : 'outline'}
                  className={cn('mt-4 w-full', i === 1 && 'lit')}
                  disabled={!p.available || buying !== null}
                  onClick={() => buy(p)}
                >
                  {buying === p.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : p.available ? 'Buy' : 'Unavailable'}
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="font-mono text-[0.65rem] leading-5 text-muted-foreground">
          Secure checkout via Dodo Payments, {crypto ? 'card or stablecoin (USDC/USDT)' : 'card'}. New accounts start with 50 free credits.
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default UpgradeModal
