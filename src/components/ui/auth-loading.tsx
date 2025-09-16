'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthLoadingProps {
  message?: string
  className?: string
  timeout?: number
}

export default function AuthLoading({
  message = "Loading...",
  className = "min-h-screen",
  timeout = 5000 // 5 seconds default timeout
}: AuthLoadingProps) {
  const [showTimeout, setShowTimeout] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true)
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout])

  const handleRetry = () => {
    window.location.reload()
  }

  const handleLogin = () => {
    router.push('/login')
  }

  return (
    <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-idean-navy mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm mb-4">{message}</p>

        {showTimeout && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm mb-4">
              Authentication is taking longer than expected.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Retry
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-idean-navy text-idean-white rounded-md hover:bg-idean-navy-dark text-sm"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}