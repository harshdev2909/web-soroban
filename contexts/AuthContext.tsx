'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi, User } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      const token = authApi.getToken()
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      const response = await authApi.getCurrentUser()
      if (response.success && response.user) {
        setUser(response.user)
        authApi.setToken(token) // Ensure token is stored
      } else {
        setUser(null)
        authApi.clearToken()
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
      authApi.clearToken()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check for token in URL (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const success = urlParams.get('success')

    if (token && success === 'true') {
      authApi.setToken(token)
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
      refreshUser()
    } else {
      refreshUser()
    }
  }, [])

  const login = () => {
    authApi.googleLogin()
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      authApi.clearToken()
      router.push('/')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
