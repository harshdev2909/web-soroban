'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Menu, X, ArrowRight, Github } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PlaygroundNavbarProps {
  onSignInClick?: () => void
}

const links = [
  { href: '/marketplace', label: 'Templates' },
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
      className={cn(
        'sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled
          ? 'border-b border-border/70 bg-background/70 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <img
            src="/websoroban_logo.png"
            alt=""
            className="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-105"
            aria-hidden
          />
          <span className="font-display text-lg font-semibold tracking-tight">WebSoroban</span>
        </Link>

        {/* Center nav with animated hover pill */}
        <div
          className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex"
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
                  'relative rounded-md px-3.5 py-2 text-sm transition-colors duration-200',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {hovered === l.href && !reduce && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-md bg-accent"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                {l.label}
              </Link>
            )
          })}
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
          {isAuthenticated ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/projects">
                Open app <ArrowRight className="h-4 w-4" />
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={reduce ? {} : { opacity: 1, height: 'auto' }}
            exit={reduce ? {} : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
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
                    <Link href="/projects" onClick={() => setOpen(false)}>Open app</Link>
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
