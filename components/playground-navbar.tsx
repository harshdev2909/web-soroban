'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NovaMark } from '@/components/nova-mark'
import { useSiteLink } from '@/lib/hosts'

interface PlaygroundNavbarProps {
  onSignInClick?: () => void
}

const links = [
  { href: '/#build', label: 'Build' },
  { href: '/pay', label: 'Pay' },
  { href: '/payloop', label: 'PayLoop' },
  { href: '/#local', label: 'Local' },
  { href: '/ideas', label: 'Idea Bank' },
  { href: '/docs', label: 'Docs' },
]

/**
 * Site navigation for every page outside the IDE. A single hairline bar: the
 * mark, mono links, and one lit action. It gains a backdrop only once the page
 * has scrolled, so the hero sculpture starts uncovered.
 */
export default function PlaygroundNavbar({ onSignInClick }: PlaygroundNavbarProps = {}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const site = useSiteLink()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300',
        scrolled || open ? 'border-border bg-background/85 backdrop-blur-xl' : 'border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6" aria-label="Primary">
        <Link {...site('/')} className="group flex min-h-10 items-center gap-3 rounded-md pr-2">
          <NovaMark className="h-7 w-7 rounded-md" />
          <span className="font-display text-[0.95rem] font-semibold tracking-[-0.02em]">WebSoroban</span>
          <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:inline">beta</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const base = link.href.split('#')[0] || '/'
            const active = link.href.includes('#') ? false : pathname === base || pathname.startsWith(`${base}/`)
            return (
              <li key={link.href}>
                <Link
                  {...site(link.href)}
                  className={cn(
                    'relative flex min-h-10 items-center rounded-md px-3 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors duration-150',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {link.label}
                  {active && <span aria-hidden="true" className="absolute inset-x-3 -bottom-[1.35rem] h-px bg-brand" />}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <Button asChild size="sm" className="lit group gap-1.5">
              <Link {...site('/projects')}>
                Open app <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground" onClick={onSignInClick}>
                Sign in
              </Button>
              <Button size="sm" className="lit group gap-1.5" onClick={onSignInClick}>
                Start building <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5" />
              </Button>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="site-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-border bg-background lg:hidden"
          >
            <ul className="mx-auto max-w-7xl px-6 py-3">
              {links.map((link, index) => (
                <li key={link.href} className={cn(index > 0 && 'border-t border-border')}>
                  <Link {...site(link.href)} className="flex min-h-12 items-center justify-between font-mono text-[0.78rem] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
                    {link.label}
                    <span className="text-[0.6rem]">0{index + 1}</span>
                  </Link>
                </li>
              ))}
              <li className="grid gap-2 border-t border-border pt-3">
                {isAuthenticated ? (
                  <Button asChild className="w-full"><Link {...site('/projects')}>Open app</Link></Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" onClick={onSignInClick}>Sign in</Button>
                    <Button className="w-full" onClick={onSignInClick}>Start building</Button>
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
