'use client'

import { useEffect, useState } from 'react'

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check')
        if (!res.ok) throw new Error('Auth check failed')
        
        const { authenticated } = await res.json()
        setIsLoggedIn(authenticated)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
    const interval = setInterval(checkAuth, 300000) // Check every 5 minutes
    return () => clearInterval(interval)
  }, [])

  return { isLoggedIn, isLoading }
}