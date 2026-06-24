'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WalletWidget } from '@/components/wallet-widget'
import { NetworkSwitcher } from '@/components/network/network-switcher'
import { ThemeToggle } from './theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Coins, FileCode, LogOut, Settings } from 'lucide-react'

// Quiet, typographic top bar for the catalog. A single Guides link on the left
// of center; theme + network + wallet + account on the right. Network/wallet are
// the existing compact widgets so the bar surfaces wallet/network state without
// shouting.
const NAV: { label: string; href: string; external?: boolean }[] = [
  { label: 'Guides', href: '/docs' },
]

function initials(user?: User | null): string {
  const base = user?.name?.trim() || user?.email || '?'
  const parts = base.split(/[\s@._-]+/).filter(Boolean)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || base[0].toUpperCase()
}

export function CatalogTopBar({ user }: { user?: User | null }) {
  const { logout } = useAuth()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-5">
      {/* Left: wordmark + nav */}
      <div className="flex min-w-0 items-center gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="WebSoroban home">
          <img src="/websoroban_logo.png" alt="" className="h-7 w-7 object-contain" aria-hidden />
          <span className="hidden font-display text-base font-semibold tracking-tight sm:inline">WebSoroban</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((l) => {
            const active = l.href !== '/' && pathname?.startsWith(l.href)
            return (
              <Link
                key={l.label}
                href={l.href}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-sm transition-colors hover:text-foreground',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden md:block">
          <NetworkSwitcher />
        </div>
        <ThemeToggle />
        <WalletWidget className="hidden sm:flex" />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8 border border-border">
                  {user.picture && <AvatarImage src={user.picture} alt="" />}
                  <AvatarFallback className="bg-brand/15 text-xs font-semibold text-brand">
                    {initials(user)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/billing"><Coins className="mr-2 h-4 w-4" /> Credits &amp; billing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/marketplace"><FileCode className="mr-2 h-4 w-4" /> Templates</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing"><Settings className="mr-2 h-4 w-4" /> Account settings</Link>
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
        )}
      </div>
    </header>
  )
}
