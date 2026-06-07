'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

interface PlaygroundNavbarProps {
  onSignInClick?: () => void
}

const links = [
  { href: '/marketplace', label: 'Templates' },
  { href: '/docs', label: 'Docs' },
  { href: '/analytics', label: 'Analytics' },
]

export default function PlaygroundNavbar({ onSignInClick }: PlaygroundNavbarProps = {}) {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/websoroban_logo.png" alt="" className="h-7 w-7 object-contain" aria-hidden />
          <span className="font-display text-lg font-semibold tracking-tight">WebSoroban</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/ide">
                Open IDE <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onSignInClick}>
                Sign in
              </Button>
              <Button size="sm" className="gap-1.5" onClick={onSignInClick}>
                Start building <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border/60 bg-background/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button asChild className="w-full">
                  <Link href="/ide" onClick={() => setOpen(false)}>Open IDE</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full" onClick={() => { setOpen(false); onSignInClick?.() }}>
                    Sign in
                  </Button>
                  <Button className="w-full" onClick={() => { setOpen(false); onSignInClick?.() }}>
                    Start building
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
