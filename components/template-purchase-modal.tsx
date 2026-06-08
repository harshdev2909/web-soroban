'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { templatesApi, TemplateDoc } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useWalletKit } from '@/contexts/WalletKitContext'
import { payWithWallet } from '@/lib/pay'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, Wallet, X, FileCode, LogIn } from 'lucide-react'

interface TemplatePurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateDoc | null
  onSuccess?: () => void
}

export function TemplatePurchaseModal({
  open,
  onOpenChange,
  template,
  onSuccess,
}: TemplatePurchaseModalProps) {
  const [paymentInfo, setPaymentInfo] = useState<{
    purchaseId: string
    address: string
    amount: number
    currency: string
    memo: string
    network: string
  } | null>(null)
  const [txHash, setTxHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const { refreshUser, login } = useAuth()
  const { address, signTransaction, openWalletModal, isInitialized, disconnect } = useWalletKit()

  useEffect(() => {
    if (open) setSessionExpired(false)
  }, [open])

  const handleStartPurchase = async () => {
    if (!template || template.price === 0) return
    setSessionExpired(false)
    try {
      setIsLoading(true)
      const res = await templatesApi.createPurchase(template.id)
      if (res.success && res.payment && res.purchaseId) {
        setPaymentInfo({
          purchaseId: res.purchaseId,
          address: res.payment.address,
          amount: res.payment.amount,
          currency: res.payment.currency,
          memo: res.payment.memo,
          network: res.payment.network,
        })
        toast.info('Send payment to the address shown')
      } else {
        toast.error(res.error || 'Failed to create purchase')
      }
    } catch (e: any) {
      const msg = e?.message || ''
      const isAuthError = (e as { status?: number })?.status === 401 || msg.includes('Invalid token') || msg.includes('session has expired') || msg.includes('expired') || msg.includes('Authentication required')
      if (isAuthError) {
        setSessionExpired(true)
      } else {
        toast.error(msg || 'Failed to create purchase')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayWithWallet = async () => {
    if (!paymentInfo || !template) return
    if (!isInitialized) {
      toast.error('Wallet is initializing, please wait a moment…')
      return
    }

    // Resolve a LIVE payer address — connect on the spot if needed. Reading the
    // `address` state right after openWalletModal() would be stale, so we use the
    // value the modal resolves with.
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
      await handleVerify(hash)
    } catch (e: any) {
      console.error('Template payment error:', e)
      toast.error(e.message || 'Payment failed')
    } finally {
      setIsPaying(false)
    }
  }

  const handleVerify = async (providedTxHash?: string) => {
    const hash = providedTxHash || txHash.trim()
    if (!paymentInfo || !hash) {
      toast.error('Transaction hash required')
      return
    }
    try {
      setIsVerifying(true)
      const res = await templatesApi.verifyTemplatePayment(hash, paymentInfo.purchaseId)
      if (res.success) {
        setPaymentSuccess(true)
        await refreshUser()
        toast.success('Template unlocked!')
        onSuccess?.()
      } else {
        toast.error(res.error || 'Verification failed')
      }
    } catch (e: any) {
      toast.error(e.message || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClose = () => {
    setPaymentInfo(null)
    setTxHash('')
    setPaymentSuccess(false)
    onOpenChange(false)
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            Purchase: {template.name}
          </DialogTitle>
          <DialogDescription>
            Same payment as subscription plans: send XLM to the address below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {paymentSuccess ? (
            <div className="text-center space-y-6 py-6">
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-6">
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                Template unlocked!
              </h3>
              <p className="text-muted-foreground">
                You can now use <strong>{template.name}</strong> in the IDE.
              </p>
              <Button onClick={handleClose} className="w-full" size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          ) : sessionExpired ? (
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertDescription>
                  Your session has expired. Please sign in again to purchase this template.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => {
                  setSessionExpired(false)
                  login()
                }}
                className="w-full"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign in again
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You can close this and reopen the purchase after signing in.
              </p>
            </div>
          ) : !paymentInfo ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-2xl font-bold">{template.price} XLM</p>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
              <Button
                onClick={handleStartPurchase}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                Get payment details
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <p className="font-semibold mb-2">Send {paymentInfo.amount} {paymentInfo.currency} to:</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded break-all mb-2">
                    {paymentInfo.address}
                  </p>
                  <p>Memo: <strong className="font-mono">{paymentInfo.memo}</strong></p>
                  <p className="text-xs text-muted-foreground">Network: {paymentInfo.network}</p>
                </AlertDescription>
              </Alert>

              <Button
                onClick={handlePayWithWallet}
                disabled={isPaying || isVerifying || !isInitialized}
                className="w-full"
                size="lg"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    {address ? 'Pay with Wallet' : 'Connect & Pay'}
                  </>
                )}
              </Button>

              {address && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span className="text-xs text-muted-foreground truncate">
                    From: {address.slice(0, 8)}...{address.slice(-4)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => disconnect()} className="h-6 px-2 text-xs">
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
                  <span className="bg-background px-2 text-muted-foreground">Or paste tx hash</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="txHash">Transaction hash</Label>
                <Input
                  id="txHash"
                  placeholder="Paste hash after payment"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  disabled={isVerifying || isPaying}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPaymentInfo(null)
                    setTxHash('')
                  }}
                  disabled={isVerifying || isPaying}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleVerify()}
                  disabled={isVerifying || isPaying || !txHash.trim()}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
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
