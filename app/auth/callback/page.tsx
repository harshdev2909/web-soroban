'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const success = searchParams.get('success')
      const error = searchParams.get('error')

      if (error) {
        console.error('Auth error:', error)
        router.push('/?error=' + encodeURIComponent(error))
        return
      }

      if (success === 'true' && token) {
        try {
          authApi.setToken(token)
          await refreshUser()
          router.push('/ide')
        } catch (err) {
          console.error('Failed to process auth callback:', err)
          router.push('/?error=auth_failed')
        }
      } else {
        router.push('/')
      }
    }

    handleCallback()
  }, [searchParams, router, refreshUser])

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
        <p className="text-gray-400">Completing authentication...</p>
      </div>
    </div>
  )
}
