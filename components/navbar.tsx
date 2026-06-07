"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  LogOut,
  Settings,
  FileCode,
  PlayCircle,
  Crown,
  LogIn,
  Search,
  Menu,
  X,
  Command,
} from 'lucide-react'
import { toast } from 'sonner'
import { WalletWidget } from './wallet-widget'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/lib/api'

interface NavbarProps {
  projectSelector?: React.ReactNode
  user?: User | null
  onLoginClick?: () => void
  onSubscriptionClick?: () => void
  onHowItWorksClick?: () => void
  onOpenCommandPalette?: () => void
}

const planMeta: Record<string, { label: string; className: string; icon?: boolean }> = {
  free: { label: 'Free', className: 'border-border text-muted-foreground' },
  plan2: { label: 'Pro', className: 'border-brand/40 text-brand bg-brand/10' },
  plan3: { label: 'Premium', className: 'border-warning/40 text-warning bg-warning/10', icon: true },
}

export function Navbar({
  projectSelector,
  user,
  onLoginClick,
  onSubscriptionClick,
  onHowItWorksClick,
  onOpenCommandPalette,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuth()
  const plan = user ? planMeta[user.subscription.plan] ?? planMeta.free : null

  return (
    <header className="relative z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-4">
      {/* Left: brand + project */}
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="WebSoroban home">
          <img src="/websoroban_logo.png" alt="" className="h-7 w-7 object-contain" aria-hidden />
          <span className="hidden font-display text-base font-semibold tracking-tight sm:inline">
            WebSoroban
          </span>
        </Link>
        <div className="h-6 w-px bg-border" />
        {projectSelector && <div className="min-w-0">{projectSelector}</div>}
      </div>

      {/* Center: command palette trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="group hidden h-9 max-w-sm flex-1 items-center gap-2 rounded-lg border border-border bg-card/60 px-3 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:bg-accent lg:flex"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search files, run actions…</span>
        <kbd className="flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Testnet
        </span>

        <button
          onClick={onOpenCommandPalette}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4" />
        </button>

        {onHowItWorksClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onHowItWorksClick}
            className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
            title="How it works"
          >
            <PlayCircle className="h-4 w-4 md:mr-1.5" />
            <span className="hidden md:inline">How it works</span>
          </Button>
        )}

        <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground hover:text-foreground md:inline-flex">
          <Link href="/marketplace" title="Templates">
            <FileCode className="h-4 w-4 md:mr-1.5" />
            <span className="hidden md:inline">Templates</span>
          </Link>
        </Button>

        {user ? (
          <>
            {plan && (
              <button onClick={onSubscriptionClick} title="Manage subscription">
                <Badge variant="outline" className={`gap-1 px-2.5 py-1 font-medium ${plan.className}`}>
                  {plan.icon && <Crown className="h-3 w-3" />}
                  {plan.label}
                </Badge>
              </button>
            )}
            <WalletWidget />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" aria-label="Account menu">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onSubscriptionClick && (
                  <DropdownMenuItem onClick={onSubscriptionClick}>
                    <Crown className="mr-2 h-4 w-4" /> Subscription
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/marketplace"><FileCode className="mr-2 h-4 w-4" /> Templates</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={async () => {
                    await logout()
                    toast.success('Signed out')
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          onLoginClick && (
            <Button size="sm" onClick={onLoginClick}>
              <LogIn className="mr-1.5 h-4 w-4" /> Sign in
            </Button>
          )
        )}

        <button
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-accent md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-14 border-b border-border bg-background/95 p-3 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {onHowItWorksClick && (
              <Button variant="ghost" className="justify-start" onClick={() => { setMobileOpen(false); onHowItWorksClick() }}>
                <PlayCircle className="mr-2 h-4 w-4" /> How it works
              </Button>
            )}
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/marketplace" onClick={() => setMobileOpen(false)}>
                <FileCode className="mr-2 h-4 w-4" /> Templates
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
