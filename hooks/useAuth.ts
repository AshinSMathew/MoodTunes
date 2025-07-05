import { useState, useEffect } from 'react'

interface User {
  id: string
  display_name: string
  email: string
  images: Array<{ url: string }>
}

interface AuthState {
  isLoggedIn: boolean
  isLoading: boolean
  user: User | null
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: true,
    user: null,
    error: null,
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status')
      const data = await response.json()
      
      setAuthState({
        isLoggedIn: data.isLoggedIn,
        isLoading: false,
        user: data.user || null,
        error: null,
      })
    } catch (error) {
      setAuthState({
        isLoggedIn: false,
        isLoading: false,
        user: null,
        error: 'Failed to check auth status',
      })
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setAuthState({
        isLoggedIn: false,
        isLoading: false,
        user: null,
        error: null,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/spotify/refresh', { method: 'POST' })
      if (response.ok) {
        await checkAuthStatus()
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  return {
    ...authState,
    logout,
    refreshToken,
    checkAuthStatus,
  }
}