'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { authApi } from '@/lib/api'
import { Github, Wallet, Sparkles } from 'lucide-react'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 4.75 12 4.75z" />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const providers = [
  { id: 'google', label: 'Continue with Google', icon: GoogleIcon, onClick: () => authApi.googleLogin() },
  { id: 'github', label: 'Continue with GitHub', icon: Github, onClick: () => authApi.githubLogin() },
  { id: 'discord', label: 'Continue with Discord', icon: DiscordIcon, onClick: () => authApi.discordLogin() },
]

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[420px]">
        {/* Brand header */}
        <div className="relative border-b border-border bg-radial-fade px-6 pb-5 pt-6">
          <div className="flex items-center gap-2.5">
            <img src="/websoroban_logo.png" alt="" className="h-8 w-8 object-contain" aria-hidden />
            <span className="font-display text-lg font-semibold tracking-tight">WebSoroban</span>
          </div>
          <DialogHeader className="mt-4 space-y-1.5 text-left">
            <DialogTitle className="font-display text-2xl">Sign in to start building</DialogTitle>
            <p className="text-sm text-muted-foreground">
              We&apos;ll spin up a funded Stellar testnet wallet for you automatically.
            </p>
          </DialogHeader>
        </div>

        <div className="space-y-2.5 px-6 py-6">
          {providers.map((p) => {
            const Icon = p.icon
            return (
              <button
                key={p.id}
                onClick={p.onClick}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-card text-sm font-medium text-foreground transition-all hover:border-brand/40 hover:bg-accent active:scale-[0.99]"
              >
                <Icon className="h-5 w-5" />
                {p.label}
              </button>
            )
          })}

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              No external wallet needed. Your testnet keypair is created and funded on first login —
              your secret key never leaves the server.
            </p>
          </div>

          <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            By continuing you agree to our terms and privacy policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
