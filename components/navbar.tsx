"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
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
  Crown,
  LogIn,
  Search,
  Menu,
  X,
  Command,
  Coins,
} from 'lucide-react'
import { toast } from 'sonner'
import { WalletWidget } from './wallet-widget'
import { ConnectedWalletChip } from './connected-wallet-chip'
import { NetworkSwitcher } from './network/network-switcher'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/lib/api'
import { billingApi } from '@/lib/billingApi'
import { CREDITS_UPDATED_EVENT } from '@/components/billing/credit-badge'
import { NovaMark } from '@/components/nova-mark'
import { cn } from '@/lib/utils'

interface NavbarProps {
  projectSelector?: React.ReactNode
  user?: User | null
  onLoginClick?: () => void
  onSubscriptionClick?: () => void
  onOpenCommandPalette?: () => void
}

const planMeta: Record<string, { label: string; className: string; icon?: boolean }> = {
  free: { label: 'Free', className: 'border-border text-muted-foreground' },
  plan2: { label: 'Pro', className: 'border-brand/40 text-brand bg-brand/10' },
  plan3: { label: 'Premium', className: 'border-warning/40 text-warning bg-warning/10', icon: true },
}

// Quiet 32px icon control used across the bar.
const iconControl =
  'grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground'

/**
 * The IDE's top bar: a single 48px hairline row. Mark and project on the left,
 * the command palette in the middle, network, plan, wallet, and account on the
 * right. Flat surface, no blur, no shadow.
 */
export function Navbar({
  projectSelector,
  user,
  onLoginClick,
  onSubscriptionClick,
  onOpenCommandPalette,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuth()
  const plan = user ? planMeta[user.subscription.plan] ?? planMeta.free : null

  return (
    <header className="relative z-30 flex h-12 items-center justify-between gap-3 border-b border-border bg-background px-3">
      {/* Left: brand + project */}
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-md" aria-label="WebSoroban home">
          <NovaMark className="h-6 w-6 rounded-md" />
          <span className="hidden font-display text-sm font-semibold tracking-[-0.02em] sm:inline">
            WebSoroban
          </span>
        </Link>
        <div className="h-5 w-px bg-border" aria-hidden="true" />
        {projectSelector && <div className="min-w-0">{projectSelector}</div>}
      </div>

      {/* Center: command palette trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="group hidden h-8 max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-card px-2.5 font-mono text-[0.72rem] text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground lg:flex"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search files, run actions…</span>
        <kbd className="flex items-center gap-0.5 rounded-sm border border-border bg-muted px-1 py-0.5 text-[0.6rem] text-muted-foreground">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <div className="hidden md:block">
          <NetworkSwitcher />
        </div>

        <button onClick={onOpenCommandPalette} className={cn(iconControl, 'lg:hidden')} aria-label="Open command palette">
          <Search className="h-4 w-4" />
        </button>

        <Button asChild variant="ghost" size="sm" className="hidden h-8 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground md:inline-flex">
          <Link href="/marketplace" title="Templates">
            <FileCode className="h-3.5 w-3.5 md:mr-1" />
            <span className="hidden md:inline">Templates</span>
          </Link>
        </Button>

        {user ? (
          <>
            <NavCredits initial={user.credits} />
            {plan && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    title="Plan & usage"
                    aria-label="Plan and usage"
                    className={cn('inline-flex h-8 items-center gap-1 rounded-md border px-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors duration-150', plan.className)}
                  >
                    {plan.icon && <Crown className="h-3 w-3" />}
                    {plan.label}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="eyebrow">Plan</span>
                    <span className="text-xs font-medium text-foreground">{plan.label}</span>
                  </div>
                  <UsageMeter
                    label="Deploys"
                    count={user.usage.deployments.count}
                    limit={user.usage.deployments.limit}
                    tint="bg-brand"
                  />
                  <div className="h-3" />
                  <UsageMeter
                    label="Function tests"
                    count={user.usage.functionTests.count}
                    limit={user.usage.functionTests.limit}
                    tint="bg-cosmic"
                  />
                  {onSubscriptionClick && user.subscription.plan === 'free' && (
                    <Button size="sm" className="mt-3 w-full" onClick={onSubscriptionClick}>
                      <Crown className="mr-1.5 h-3.5 w-3.5" /> Upgrade plan
                    </Button>
                  )}
                  {onSubscriptionClick && user.subscription.plan !== 'free' && (
                    <Button size="sm" variant="outline" className="mt-3 w-full" onClick={onSubscriptionClick}>
                      Manage subscription
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            )}
            <ConnectedWalletChip />
            <WalletWidget />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground" aria-label="Account menu">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate font-mono text-[0.68rem] font-normal text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onSubscriptionClick && (
                  <DropdownMenuItem onClick={onSubscriptionClick}>
                    <Crown className="mr-2 h-4 w-4" /> Subscription
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/billing"><Coins className="mr-2 h-4 w-4" /> Credits &amp; billing</Link>
                </DropdownMenuItem>
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
            <Button size="sm" className="lit h-8" onClick={onLoginClick}>
              <LogIn className="mr-1.5 h-4 w-4" /> Sign in
            </Button>
          )
        )}

        <button
          className={cn(iconControl, 'md:hidden')}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-12 z-40 border-b border-border bg-background p-2 md:hidden">
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1.5"><NetworkSwitcher /></div>
            {user && (
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/billing" onClick={() => setMobileOpen(false)}>
                  <Coins className="mr-2 h-4 w-4" /> Credits &amp; billing
                </Link>
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

/**
 * AI credit balance pill in the navbar — links to the /billing page. Seeds from
 * the user prop, refreshes on mount, and live-updates after each Copilot run via
 * the `credits:updated` window event.
 */
function NavCredits({ initial }: { initial?: number }) {
  const [balance, setBalance] = useState<number | null>(typeof initial === 'number' ? initial : null)

  useEffect(() => {
    let alive = true
    billingApi.getBalance().then((r) => { if (alive) setBalance(r.balance) }).catch(() => {})
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (typeof detail === 'number') setBalance(detail)
      else billingApi.getBalance().then((r) => setBalance(r.balance)).catch(() => {})
    }
    window.addEventListener(CREDITS_UPDATED_EVENT, onUpdate)
    return () => { alive = false; window.removeEventListener(CREDITS_UPDATED_EVENT, onUpdate) }
  }, [])

  const low = balance !== null && balance <= 0
  return (
    <Link
      href="/billing"
      title="AI credits — view billing & buy more"
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-md border px-2 font-mono text-[0.68rem] transition-colors duration-150',
        low
          ? 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20'
          : 'border-border bg-card text-foreground hover:border-foreground/30 hover:bg-accent',
      )}
    >
      <Coins className={cn('h-3.5 w-3.5', low ? 'text-destructive' : 'text-brand')} />
      <span className="font-mono-tnum">{(balance ?? 0).toLocaleString()}</span>
      <span className="hidden uppercase tracking-[0.12em] text-muted-foreground sm:inline">credits</span>
    </Link>
  )
}

function UsageMeter({ label, count, limit, tint }: { label: string; count: number; limit: number; tint: string }) {
  const unlimited = limit === -1
  const pct = unlimited ? 8 : limit > 0 ? Math.min(100, Math.round((count / limit) * 100)) : 0
  const nearLimit = !unlimited && limit > 0 && count / limit >= 0.8
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between font-mono text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono-tnum text-foreground/90">
          {count}
          <span className="text-muted-foreground">/{unlimited ? '∞' : limit}</span>
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-sm bg-muted">
        <div
          className={cn('h-full rounded-sm transition-[width] duration-300 ease-out', nearLimit ? 'bg-warning' : tint, unlimited && 'opacity-40')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
