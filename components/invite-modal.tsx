/* 
 * INVITE MODAL - COMMENTED OUT
 * This component has been disabled as the invite system has been replaced
 * with premium gifting functionality. Users should now use Google OAuth to sign in.
 */

/*
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
  // ... entire component code commented out ...
  return null
}
*/

// Disabled component - redirects to login
"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface InviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail?: string
  onSuccess?: () => void
}

export function InviteModal({ open, onOpenChange }: InviteModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (open) {
      // Redirect to IDE page which will show login modal
      router.push('/ide')
    }
  }, [open, router])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Invite System Disabled
          </DialogTitle>
          <DialogDescription>
            The invite system has been replaced with Google authentication
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Alert>
            <AlertDescription>
              Please use Google OAuth to sign in. The invite code system is no longer available.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => {
              onOpenChange(false)
              router.push('/ide')
            }}
            className="w-full"
          >
            Go to Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
