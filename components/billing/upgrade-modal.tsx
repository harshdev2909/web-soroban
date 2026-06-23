"use client"

/**
 * Out-of-credits / buy-credits modal. Shows the 3 credit packs (price + credits)
 * and starts a Dodo checkout on Buy → redirects to the hosted checkout URL.
 */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Coins, Loader2, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { billingApi, type CreditPack } from '@/lib/billingApi'

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
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-brand" />
            {outOfCredits ? 'You’re out of credits' : 'Buy AI credits'}
          </DialogTitle>
          <DialogDescription>
            {outOfCredits
              ? 'Top up to keep using the Copilot. Credits are charged per run based on actual model cost.'
              : 'One-time credit packs. Credits are charged per run based on actual model cost.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-3">
            {plans.map((p, i) => (
              <div
                key={p.key}
                className={`relative flex flex-col rounded-xl border p-3 ${i === 1 ? 'border-brand/50 bg-brand/5' : 'border-border bg-card/50'}`}
              >
                {i === 1 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-brand px-2 py-0.5 text-[9px] font-semibold text-brand-foreground">
                    Popular
                  </span>
                )}
                <span className="text-sm font-semibold text-foreground">{p.name}</span>
                <span className="mt-1 text-2xl font-bold text-foreground">{p.priceLabel}</span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-brand" /> {p.credits.toLocaleString()} credits
                </span>
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  disabled={!p.available || buying !== null}
                  onClick={() => buy(p)}
                >
                  {buying === p.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : p.available ? 'Buy' : 'Unavailable'}
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="text-center text-[10px] text-muted-foreground">
          Secure checkout via Dodo Payments — {crypto ? 'card or stablecoin (USDC/USDT)' : 'card'}. New accounts start with 10 free credits.
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default UpgradeModal
