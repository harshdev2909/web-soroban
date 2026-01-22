'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// INVITE SYSTEM DISABLED - Redirect to IDE which uses Google OAuth
export default function ContractPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to IDE page which will show login modal
    router.push('/ide')
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Redirecting...</h1>
          <p className="text-gray-400">Please sign in with Google to access the IDE</p>
        </div>
      </div>
    </div>
  )
}