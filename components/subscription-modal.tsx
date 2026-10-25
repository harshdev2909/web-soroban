'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { subscriptionApi, paymentApi, SubscriptionPlan } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useWalletKit } from '@/contexts/WalletKitContext'
import { payWithWallet } from '@/lib/pay'
import { toast } from 'sonner'
import { Loader2, Check, Wallet, X, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface SubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PlanId = 'free' | 'plan2' | 'plan3'

const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: ['Unlimited compilations', '5 deployments/month', '2 function tests/month'],
  plan2: ['Unlimited compilations', 'Unlimited deployments', '5 function tests/month'],
  plan3: ['Unlimited compilations', 'Unlimited deployments', 'Unlimited function tests'],
}

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({})
  const [selectedPlan, setSelectedPlan] = useState<'plan2' | 'plan3' | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [txHash, setTxHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [successDetails, setSuccessDetails] = useState<any>(null)
  const { user, refreshUser } = useAuth()
  const { address, signTransaction, openWalletModal, isInitialized, disconnect, getWalletNetwork } = useWalletKit()

  useEffect(() => {
    if (open) {
      loadPlans()
    }
  }, [open])

  const loadPlans = async () => {
    try {
      const response = await subscriptionApi.getPlans()
      if (response.success && response.plans) {
        setPlans(response.plans)
      }
    } catch (error) {
      console.error('Failed to load plans:', error)
    }
  }

  const handleSelectPlan = async (plan: 'plan2' | 'plan3') => {
    try {
      setIsLoading(true)
      setSelectedPlan(plan)

      const response = await subscriptionApi.create(plan)
      if (response.success && response.payment) {
        setPaymentInfo(response.payment)
        toast.info('Please send payment to the address shown')
      } else {
        toast.error(response.error || 'Failed to create subscription')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayWithWallet = async () => {
    if (!paymentInfo || !selectedPlan) {
      toast.error('Payment information not available')
      return
    }

    if (!isInitialized) {
      toast.error('Wallet kit is initializing, please wait...')
      return
    }

    // Resolve a LIVE payer address — connect on the spot if needed (reading the
    // `address` state right after openWalletModal() would be stale).
    let payerAddress = address
    if (!payerAddress) {
      payerAddress = await openWalletModal()
      if (!payerAddress) {
        toast.error('Connect a wallet to continue')
        return
      }
    }

    try {
      setIsPaying(true)
      const { hash } = await payWithWallet({
        signTransaction,
        payerAddress,
        destination: paymentInfo.address,
        amount: paymentInfo.amount,
        memo: paymentInfo.memo,
        network: paymentInfo.network,
        getWalletNetwork,
      })
      setTxHash(hash)
      toast.success('Payment sent — verifying…')
      await handleVerifyPayment(hash)
    } catch (error: any) {
      console.error('Subscription payment error:', error)
      toast.error(error.message || 'Failed to send payment')
    } finally {
      setIsPaying(false)
    }
  }

  const handleVerifyPayment = async (providedTxHash?: string) => {
    const hashToVerify = providedTxHash || txHash.trim()

    if (!selectedPlan || !hashToVerify) {
      toast.error('Please enter transaction hash')
      return
    }

    try {
      setIsVerifying(true)
      const response = await paymentApi.verify(hashToVerify, selectedPlan)

      if (response.success) {
        // Show success modal
        setSuccessDetails({
          plan: selectedPlan,
          planName: selectedPlan === 'plan2' ? 'Pro' : 'Premium',
          txHash: hashToVerify,
          amount: paymentInfo?.amount || (selectedPlan === 'plan2' ? 50 : 100),
          currency: paymentInfo?.currency || 'XLM'
        })
        setPaymentSuccess(true)
        await refreshUser()
        toast.success('Payment verified! Subscription upgraded.')
      } else {
        toast.error(response.error || 'Payment verification failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCloseSuccess = () => {
    setPaymentSuccess(false)
    setSuccessDetails(null)
    setTxHash('')
    setPaymentInfo(null)
    setSelectedPlan(null)
    onOpenChange(false)
  }

  const currentPlan = user?.subscription.plan || 'free'

  const planRows: { id: PlanId; name: string; price: string; action?: 'plan2' | 'plan3' }[] = [
    { id: 'free', name: 'Free', price: '$0' },
    { id: 'plan2', name: 'Pro', price: `${plans.plan2?.price || 50} ${plans.plan2?.currency || 'XLM'} / month`, action: 'plan2' },
    { id: 'plan3', name: 'Premium', price: `${plans.plan3?.price || 100} ${plans.plan3?.currency || 'XLM'} / month`, action: 'plan3' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg border-border bg-popover p-0 shadow-lg sm:max-w-[600px]">
        <DialogHeader className="border-b border-border px-6 pb-5 pt-6 text-left">
          <p className="eyebrow">Plan &amp; usage</p>
          <DialogTitle className="font-display text-2xl font-medium">Subscription plans</DialogTitle>
          <DialogDescription>Choose the plan that fits how much you deploy and test.</DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {paymentSuccess && successDetails ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-success/40 text-success">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-medium text-foreground">Payment verified.</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Your subscription is now <span className="text-foreground">{successDetails.planName}</span>.
                  </p>
                </div>
              </div>

              <dl className="border-t border-border">
                {[
                  ['Plan', successDetails.planName],
                  ['Amount', `${successDetails.amount} ${successDetails.currency}`],
                  ['Transaction', `${successDetails.txHash.substring(0, 16)}…`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-border py-3 font-mono text-[0.72rem]">
                    <dt className="uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
                    <dd className="truncate text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="rounded-md border border-border border-l-2 border-l-success bg-card px-4 py-3">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-success">What&apos;s next</p>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                  <li>Your subscription is now active.</li>
                  <li>Unlimited deployments are enabled.</li>
                  {successDetails.plan === 'plan3' && <li>Unlimited function testing is available.</li>}
                  {successDetails.plan === 'plan2' && <li>5 function tests per month.</li>}
                </ul>
              </div>

              <Button onClick={handleCloseSuccess} className="lit w-full" size="lg">
                Continue
              </Button>
            </div>
          ) : !paymentInfo ? (
            <ul className="border-t border-border">
              {planRows.map((plan, index) => {
                const current = currentPlan === plan.id
                return (
                  <li key={plan.id} className={cn('grid gap-4 border-b border-border py-5 sm:grid-cols-[2.5rem_1fr_auto]', current && 'bg-card/60 -mx-2 px-2 sm:-mx-3 sm:px-3')}>
                    <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground">0{index + 1}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-lg font-medium text-foreground">{plan.name}</h3>
                        {current && (
                          <span className="rounded-sm border border-brand/40 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-brand">Current</span>
                        )}
                      </div>
                      <p className="font-mono-tnum mt-1 text-sm text-muted-foreground">{plan.price}</p>
                      <ul className="mt-3 space-y-1.5">
                        {PLAN_FEATURES[plan.id].map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-foreground/90">
                            <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {plan.action && !current && (
                      <div className="sm:self-center">
                        <Button
                          onClick={() => handleSelectPlan(plan.action!)}
                          disabled={isLoading}
                          variant={plan.id === 'plan3' ? 'default' : 'outline'}
                          className={cn('w-full sm:w-auto', plan.id === 'plan3' && 'lit')}
                        >
                          {isLoading && selectedPlan === plan.action ? <Loader2 className="h-4 w-4 animate-spin" /> : `Upgrade to ${plan.name}`}
                        </Button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="space-y-5">
              <div className="rounded-md border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="eyebrow">Payment instructions</p>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">{paymentInfo.network}</span>
                </div>
                <dl className="px-4">
                  <div className="flex items-center justify-between gap-4 border-b border-border py-3 font-mono text-[0.72rem]">
                    <dt className="uppercase tracking-[0.14em] text-muted-foreground">Amount</dt>
                    <dd className="text-foreground">{paymentInfo.amount} {paymentInfo.currency}</dd>
                  </div>
                  <div className="border-b border-border py-3 font-mono text-[0.72rem]">
                    <dt className="uppercase tracking-[0.14em] text-muted-foreground">Send to</dt>
                    <dd className="mt-1.5 break-all text-foreground">{paymentInfo.address}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3 font-mono text-[0.72rem]">
                    <dt className="uppercase tracking-[0.14em] text-muted-foreground">Memo</dt>
                    <dd className="text-foreground">{paymentInfo.memo}</dd>
                  </div>
                </dl>
              </div>

              {/* Pay with Wallet Button */}
              <Button
                onClick={handlePayWithWallet}
                disabled={isPaying || isVerifying || !isInitialized}
                className="lit w-full gap-2"
                size="lg"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing payment…
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    {address ? 'Pay with wallet' : 'Connect wallet & pay'}
                  </>
                )}
              </Button>

              {address && (
                <div className="flex items-center justify-between gap-3 border-y border-border py-2">
                  <p className="font-mono text-[0.72rem] text-muted-foreground">
                    Paying from <span className="text-foreground">{address.substring(0, 8)}…{address.substring(48)}</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      disconnect()
                      toast.success('Wallet disconnected')
                    }}
                    className="h-8 gap-1 px-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    Disconnect
                  </Button>
                </div>
              )}

              <p className="rule">or verify manually</p>

              <div className="space-y-2">
                <Label htmlFor="txHash" className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Transaction hash</Label>
                <Input
                  id="txHash"
                  placeholder="Paste the hash after paying"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  disabled={isVerifying || isPaying}
                  className="rounded-md border-border bg-card font-mono text-xs"
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  If you paid from another wallet, paste the transaction hash here to verify.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => {
                  setPaymentInfo(null)
                  setSelectedPlan(null)
                  setTxHash('')
                }} disabled={isVerifying || isPaying}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={() => handleVerifyPayment()} disabled={isVerifying || isPaying || !txHash.trim()}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    'Verify payment'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
