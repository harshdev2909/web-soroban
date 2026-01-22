'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api'
import { Chrome } from 'lucide-react'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const handleGoogleLogin = () => {
    authApi.googleLogin()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Chrome className="w-6 h-6" />
            Sign In to WebSoroban
          </DialogTitle>
          <DialogDescription>
            Sign in with your Google account to get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-300 shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            <Chrome className="w-5 h-5 mr-3" />
            Continue with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
