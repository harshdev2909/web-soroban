'use client'

import { useState, type ReactNode } from 'react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import { LoginModal } from '@/components/login-modal'

export function HackMeridianFrame({ children }: { children: ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />
      {children}
      <PlaygroundFooter />
    </main>
  )
}
