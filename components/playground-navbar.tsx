'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Menu, X, ArrowRight, Github } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NovaMark } from '@/components/nova-mark'

interface PlaygroundNavbarProps {
  onSignInClick?: () => void
}

const links = [
  { href: '/#platform', label: 'Platform' },
  { href: '/pay', label: 'Payments' },
  { href: '/#stellar-local', label: 'WebSoroban Local' },
  { href: '/docs', label: 'Docs' },
]

export default function PlaygroundNavbar({ onSignInClick }: PlaygroundNavbarProps = {}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 px-3 pt-3 sm:px-4"
    >
      <div className="mx-auto max-w-7xl">
        <nav
          className={cn(
            'relative flex h-14 items-center justify-between rounded-2xl border px-3.5 transition-[background-color,border-color,box-shadow] duration-200 sm:px-4',
            scrolled
              ? 'border-border/80 bg-background/90 shadow-lg shadow-foreground/5 backdrop-blur-xl'
              : 'border-border/60 bg-background/75 shadow-sm shadow-foreground/5 backdrop-blur-lg',
          )}
        >
          <Link
            href="/"
            className="group flex min-h-10 items-center gap-2.5 rounded-xl pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <NovaMark className="h-8 w-8 rounded-xl transition-transform duration-200 motion-safe:group-hover:-rotate-3 motion-reduce:transform-none" />
            <span className="font-display text-lg font-semibold tracking-tight">WebSoroban</span>
          </Link>

          <div
            className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-xl border border-border/60 bg-muted/55 p-0.5 lg:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {links.map((l) => {
              const active = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onMouseEnter={() => setHovered(l.href)}
                  className={cn(
                    'relative min-h-10 rounded-lg px-3.5 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {hovered === l.href && !reduce && (
                    <motion.span
                      layoutId="nav-surface"
                      className="absolute inset-0 rounded-lg border border-border/70 bg-background shadow-sm"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="hidden items-center gap-1.5 lg:flex">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-[background-color,color,transform] duration-150 hover:bg-accent hover:text-foreground motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
            >
              <Github className="h-4 w-4" />
            </a>
            {isAuthenticated ? (
              <Button asChild size="sm" className="group gap-1.5 rounded-xl">
                <Link href="/projects">
                  Open app <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5 motion-reduce:transform-none" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="rounded-xl" onClick={onSignInClick}>
                  Sign in
                </Button>
                <Button size="sm" className="group gap-1.5 rounded-xl" onClick={onSignInClick}>
                  Start building <ArrowRight className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5 motion-reduce:transform-none" />
                </Button>
              </>
            )}
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="nova-mobile-menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? 'close' : 'menu'}
                className="grid place-items-center"
                initial={reduce ? false : { opacity: 0, rotate: open ? -20 : 20, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, rotate: open ? 20 : -20, scale: 0.8 }}
                transition={{ duration: 0.14 }}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="nova-mobile-menu"
              initial={reduce ? false : { opacity: 0, height: 0, y: -6 }}
              animate={reduce ? {} : { opacity: 1, height: 'auto', y: 0 }}
              exit={reduce ? {} : { opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-xl shadow-foreground/5 backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col gap-1 p-2.5">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-2 grid gap-2 border-t border-border/60 pt-2.5">
                  {isAuthenticated ? (
                    <Button asChild className="w-full rounded-xl">
                      <Link href="/projects" onClick={() => setOpen(false)}>Open app</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full rounded-xl" onClick={() => { setOpen(false); onSignInClick?.() }}>
                        Sign in
                      </Button>
                      <Button className="w-full rounded-xl" onClick={() => { setOpen(false); onSignInClick?.() }}>
                        Start building
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
