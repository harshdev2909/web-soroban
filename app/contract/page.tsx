'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// INVITE SYSTEM DISABLED - Redirect to IDE which uses Google OAuth
export default function ContractPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to IDE page which will show login modal
    router.push('/ide')
  }, [router])

  return (
    <div className="relative grid min-h-screen place-items-center bg-background px-6 text-foreground">
      <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
      <div className="figure ticks relative w-full max-w-md p-8">
        <p className="eyebrow flex items-center gap-3">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand motion-reduce:animate-none" aria-hidden />
          Redirecting
        </p>
        <h1 className="mt-6 font-display text-title font-medium">Opening the IDE.</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Please sign in with Google to access the IDE.</p>
      </div>
    </div>
  )
}
