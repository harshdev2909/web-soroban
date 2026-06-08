'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { subscriptionApi, paymentApi, SubscriptionPlan } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useWalletKit } from '@/contexts/WalletKitContext'
import { payWithWallet } from '@/lib/pay'
import { toast } from 'sonner'
import { Loader2, Check, Crown, Zap, Wallet, X, CheckCircle2, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  const { address, signTransaction, openWalletModal, isInitialized, disconnect } = useWalletKit()

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Subscription Plans
          </DialogTitle>
          <DialogDescription>
            Choose a plan that fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {paymentSuccess && successDetails ? (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-6">
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Payment Successful!
                </h3>
                <p className="text-lg text-muted-foreground">
                  Your subscription has been upgraded to <strong>{successDetails.planName}</strong>
                </p>
              </div>

              <div className="bg-muted rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold flex items-center gap-2">
                    {successDetails.plan === 'plan2' ? <Zap className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                    {successDetails.planName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold">{successDetails.amount} {successDetails.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transaction</span>
                  <span className="font-mono text-xs break-all">{successDetails.txHash.substring(0, 16)}...</span>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="text-left space-y-1">
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      What's Next?
                    </p>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>• Your subscription is now active</li>
                      <li>• Enjoy unlimited deployments</li>
                      {successDetails.plan === 'plan3' && (
                        <li>• Unlimited function testing available</li>
                      )}
                      {successDetails.plan === 'plan2' && (
                        <li>• 5 function tests per month</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCloseSuccess}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          ) : !paymentInfo ? (
            <>
              {/* Free Plan */}
              <div className={`border rounded-lg p-4 ${currentPlan === 'free' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">Free</h3>
                  {currentPlan === 'free' && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Current</span>}
                </div>
                <p className="text-2xl font-bold mb-2">$0</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Unlimited compilations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    5 deployments/month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    2 function tests/month
                  </li>
                </ul>
              </div>

              {/* Plan 2 */}
              <div className={`border rounded-lg p-4 ${currentPlan === 'plan2' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Pro
                  </h3>
                  {currentPlan === 'plan2' && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Current</span>}
                </div>
                <p className="text-2xl font-bold mb-2">{plans.plan2?.price || 50} {plans.plan2?.currency || 'XLM'}/month</p>
                <ul className="space-y-1 text-sm mb-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Unlimited compilations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Unlimited deployments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    5 function tests/month
                  </li>
                </ul>
                {currentPlan !== 'plan2' && (
                  <Button onClick={() => handleSelectPlan('plan2')} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Upgrade to Pro'}
                  </Button>
                )}
              </div>

              {/* Plan 3 */}
              <div className={`border rounded-lg p-4 ${currentPlan === 'plan3' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Premium
                  </h3>
                  {currentPlan === 'plan3' && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Current</span>}
                </div>
                <p className="text-2xl font-bold mb-2">{plans.plan3?.price || 100} {plans.plan3?.currency || 'XLM'}/month</p>
                <ul className="space-y-1 text-sm mb-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Unlimited compilations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Unlimited deployments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Unlimited function tests
                  </li>
                </ul>
                {currentPlan !== 'plan3' && (
                  <Button onClick={() => handleSelectPlan('plan3')} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Upgrade to Premium'}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <p className="font-semibold mb-2">Payment Instructions:</p>
                  <p className="mb-2">Send <strong>{paymentInfo.amount} {paymentInfo.currency}</strong> to:</p>
                  <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all mb-2">
                    {paymentInfo.address}
                  </p>
                  <p className="mb-2">Memo: <strong className="font-mono">{paymentInfo.memo}</strong></p>
                  <p className="text-xs text-muted-foreground">
                    Network: {paymentInfo.network}
                  </p>
                </AlertDescription>
              </Alert>

              {/* Pay with Wallet Button */}
              <Button
                onClick={handlePayWithWallet}
                disabled={isPaying || isVerifying || !isInitialized}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                size="lg"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    {address ? 'Pay with Wallet' : 'Connect Wallet & Pay'}
                  </>
                )}
              </Button>

              {address && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Paying from: {address.substring(0, 8)}...{address.substring(48)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      disconnect()
                      toast.success('Wallet disconnected')
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Disconnect
                  </Button>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="txHash">Transaction Hash (Manual Payment)</Label>
                <Input
                  id="txHash"
                  placeholder="Enter transaction hash after payment"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  disabled={isVerifying || isPaying}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  If you paid manually, paste the transaction hash here to verify
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setPaymentInfo(null)
                  setSelectedPlan(null)
                  setTxHash('')
                }} disabled={isVerifying || isPaying}>
                  Cancel
                </Button>
                <Button onClick={() => handleVerifyPayment()} disabled={isVerifying || isPaying || !txHash.trim()}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Payment'
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
