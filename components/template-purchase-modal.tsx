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
  const { address, signTransaction, openWalletModal, isInitialized, disconnect, getWalletNetwork } = useWalletKit()

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
        getWalletNetwork,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display font-medium">
            <FileCode className="h-4 w-4 text-muted-foreground" />
            Purchase: {template.name}
          </DialogTitle>
          <DialogDescription>
            Same payment as subscription plans: send XLM to the address below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {paymentSuccess ? (
            <div className="space-y-5 py-4">
              <span className="grid h-12 w-12 place-items-center rounded-md border border-success/40 text-success">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-xl font-medium text-foreground">Template unlocked.</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  You can now use <strong className="font-medium text-foreground">{template.name}</strong> in the IDE.
                </p>
              </div>
              <Button onClick={handleClose} className="lit w-full" size="lg">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Continue
              </Button>
            </div>
          ) : sessionExpired ? (
            <div className="space-y-4 py-2">
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
                className="lit w-full"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in again
              </Button>
              <p className="font-mono text-[0.68rem] text-muted-foreground">
                You can close this and reopen the purchase after signing in.
              </p>
            </div>
          ) : !paymentInfo ? (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-card p-4">
                <p className="eyebrow">Price</p>
                <p className="mt-2 font-mono-tnum text-2xl font-medium">{template.price} XLM</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</p>
              </div>
              <Button
                onClick={handleStartPurchase}
                disabled={isLoading}
                className="lit w-full"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Get payment details
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <dl className="rounded-md border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <dt className="eyebrow">Send</dt>
                  <dd className="mt-1.5 font-mono-tnum text-lg font-medium">{paymentInfo.amount} {paymentInfo.currency}</dd>
                </div>
                <div className="border-b border-border px-4 py-3">
                  <dt className="eyebrow">To</dt>
                  <dd className="mt-1.5 break-all font-mono text-xs text-foreground">{paymentInfo.address}</dd>
                </div>
                <div className="grid grid-cols-2 gap-px bg-border">
                  <div className="bg-card px-4 py-3">
                    <dt className="eyebrow">Memo</dt>
                    <dd className="mt-1.5 font-mono text-xs text-foreground">{paymentInfo.memo}</dd>
                  </div>
                  <div className="bg-card px-4 py-3">
                    <dt className="eyebrow">Network</dt>
                    <dd className="mt-1.5 font-mono text-xs text-foreground">{paymentInfo.network}</dd>
                  </div>
                </div>
              </dl>

              <Button
                onClick={handlePayWithWallet}
                disabled={isPaying || isVerifying || !isInitialized}
                className="lit w-full"
                size="lg"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    {address ? 'Pay with Wallet' : 'Connect & Pay'}
                  </>
                )}
              </Button>

              {address && (
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="truncate font-mono text-[0.68rem] text-muted-foreground">
                    From: {address.slice(0, 8)}...{address.slice(-4)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => disconnect()} className="h-7 px-2 font-mono text-[0.68rem] uppercase tracking-[0.14em]">
                    <X className="mr-1 h-3 w-3" />
                    Disconnect
                  </Button>
                </div>
              )}

              <p className="rule">Or paste a transaction hash</p>

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
                  variant="outline"
                  onClick={() => handleVerify()}
                  disabled={isVerifying || isPaying || !txHash.trim()}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
