'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthStateDebugProps {
  showInProduction?: boolean
}

export function AuthStateDebug({ showInProduction = false }: AuthStateDebugProps) {
  const { user, firebaseUser, loading, authLoading, isNewUser, isHydrated } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [storageData, setStorageData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    
    // Check localStorage data
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('authToken')
      
      setStorageData({
        hasUser: !!storedUser,
        hasToken: !!storedToken,
        userEmail: storedUser ? JSON.parse(storedUser)?.email : null,
        tokenLength: storedToken?.length || 0
      })
    }
  }, [])

  // Only show in development unless explicitly enabled for production
  if (!showInProduction && process.env.NODE_ENV === 'production') {
    return null
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔍 Auth State Debug</div>
      <div className="space-y-1">
        <div>
          <strong>Firebase User:</strong> {firebaseUser ? '✅ Present' : '❌ Null'}
        </div>
        <div>
          <strong>App User:</strong> {user ? '✅ Present' : '❌ Null'}
        </div>
        <div>
          <strong>Loading:</strong> {loading ? '🔄 True' : '✅ False'}
        </div>
        <div>
          <strong>Auth Loading:</strong> {authLoading ? '🔄 True' : '✅ False'}
        </div>
        <div>
          <strong>Is New User:</strong> {isNewUser ? '🆕 True' : '✅ False'}
        </div>
        <div>
          <strong>User Email:</strong> {user?.email || 'None'}
        </div>
        <div>
          <strong>User Role:</strong> {user?.role || 'None'}
        </div>
        <div>
          <strong>Storage User:</strong> {storageData?.hasUser ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Storage Token:</strong> {storageData?.hasToken ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Mounted:</strong> {mounted ? '✅ True' : '❌ False'}
        </div>
        <div>
          <strong>Hydrated:</strong> {isHydrated ? '✅ True' : '❌ False'}
        </div>
        <div>
          <strong>Current Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}
        </div>
      </div>
    </div>
  )
}
