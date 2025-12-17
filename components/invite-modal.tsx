"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { inviteApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface InviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail?: string
  onSuccess?: () => void
}

export function InviteModal({ open, onOpenChange, userEmail, onSuccess }: InviteModalProps) {
  const router = useRouter()
  const [email, setEmail] = useState(userEmail || '')
  const [inviteCode, setInviteCode] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [hasInvite, setHasInvite] = useState<boolean | null>(null)
  const [isWaitlist, setIsWaitlist] = useState(false)
  const [checkMessage, setCheckMessage] = useState('')
  const [error, setError] = useState('')

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      const emailToUse = userEmail || email || ''
      setEmail(emailToUse)
      setInviteCode('')
      setHasInvite(null)
      setIsWaitlist(false)
      setCheckMessage('')
      setError('')
      // Don't auto-check - user must click "Verify" button
    }
  }, [open, userEmail])

  const checkInviteStatus = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsChecking(true)
    setError('')
    setHasInvite(null)
    setIsWaitlist(false)
    setCheckMessage('')

    try {
      const result = await inviteApi.checkInvite(emailToCheck)
      
      // Handle different response states
      if (result.hasInvite) {
        // Invite exists (used or not) - always show invite code input for verification
        setHasInvite(true)
        setIsWaitlist(false)
        if (result.used) {
          setCheckMessage('Please enter your invite code to verify access.')
        } else {
          setCheckMessage(result.message || 'Invite code has been sent to your email. Please enter it below.')
        }
      } else if (result.isWaitlist) {
        // On waitlist (either new or existing)
        setHasInvite(false)
        setIsWaitlist(true)
        if (result.isNew) {
          setCheckMessage('You have been added to the waitlist. An invite code will be sent to your email soon.')
        } else {
          setCheckMessage('You are already on the waitlist. An invite code will be sent to your email soon.')
        }
      } else {
        // Fallback
        setHasInvite(false)
        setIsWaitlist(true)
        setCheckMessage(result.message || 'You are on the waitlist')
      }
    } catch (err) {
      console.error('Failed to check invite:', err)
      setError('Failed to verify email. Please try again.')
      setHasInvite(null)
      setIsWaitlist(false)
    } finally {
      setIsChecking(false)
    }
  }

  const handleVerifyEmail = () => {
    checkInviteStatus(email)
  }

  const handleValidateCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!inviteCode || inviteCode.trim().length === 0) {
      setError('Please enter your invite code')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      const result = await inviteApi.validateInvite(email, inviteCode.trim().toUpperCase())
      
      if (result.success) {
        toast.success('Invite code validated successfully!')
        
        // Close modal immediately
        onOpenChange(false)
        
        // Call success callback if provided (for backward compatibility)
        if (onSuccess) {
          onSuccess()
        }
        
        // Redirect directly to /ide - no localStorage dependency
        router.push('/ide')
      } else {
        if (result.error === 'waitlist') {
          setIsWaitlist(true)
          setHasInvite(false)
          setError(result.message || 'You are on the waitlist')
        } else {
          // Don't show "already used" errors - codes can be reused
          const errorMsg = result.error || result.message || 'Invalid invite code'
          if (!errorMsg.toLowerCase().includes('already used')) {
            setError(errorMsg)
          } else {
            // If it's an "already used" error, treat it as invalid code
            setError('Invalid invite code. Please check and try again.')
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to validate invite:', err)
      
      // Check if it's a waitlist error
      if (err.message?.includes('waitlist') || err.message?.includes('Waitlist')) {
        setIsWaitlist(true)
        setHasInvite(false)
        setError('You are on the waitlist. An invite code will be sent to your email soon.')
      } else {
        // Don't show "already used" errors - codes can be reused
        const errorMsg = err.message || 'Failed to validate invite code. Please check and try again.'
        if (!errorMsg.toLowerCase().includes('already used')) {
          setError(errorMsg)
        } else {
          setError('Invalid invite code. Please check and try again.')
        }
      }
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite Code Access
          </DialogTitle>
          <DialogDescription>
            Enter your email to join the waitlist or verify your invite code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isChecking || isValidating || !!userEmail}
                className="flex-1"
              />
              <Button
                onClick={handleVerifyEmail}
                disabled={isChecking || !email || !email.includes('@')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {isChecking && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Verifying email...</AlertDescription>
            </Alert>
          )}

          {/* Waitlist Message */}
          {hasInvite === false && isWaitlist && !isChecking && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                {checkMessage || 'You are on the waitlist. An invite code will be sent to your email soon.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Invite Available Message */}
          {hasInvite === true && !isChecking && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {checkMessage || 'Invite code has been sent to your email. Please enter it below.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Invite Code Input */}
          {hasInvite === true && (
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="INV-XXXX-XXXX-XXXX"
                value={inviteCode}
                onChange={(e) => {
                  // Auto-format to uppercase and add dashes
                  let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                  // Add dashes in the right places
                  if (value.length > 3 && value[3] !== '-') {
                    value = value.slice(0, 3) + '-' + value.slice(3)
                  }
                  if (value.length > 8 && value[8] !== '-') {
                    value = value.slice(0, 8) + '-' + value.slice(8)
                  }
                  if (value.length > 13 && value[13] !== '-') {
                    value = value.slice(0, 13) + '-' + value.slice(13)
                  }
                  // Limit to INV-XXXX-XXXX-XXXX format (18 chars: INV- + 4 + - + 4 + - + 4)
                  if (value.length > 18) {
                    value = value.slice(0, 18)
                  }
                  setInviteCode(value)
                  setError('')
                }}
                disabled={isValidating}
                className="font-mono text-lg tracking-wider text-center"
              />
              <p className="text-xs text-muted-foreground">
                Enter the invite code sent to your email
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isValidating || isChecking}
            >
              Cancel
            </Button>
            {hasInvite === true && (
              <Button
                onClick={handleValidateCode}
                disabled={isValidating || !inviteCode || inviteCode.trim().length === 0}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Validate Code'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

