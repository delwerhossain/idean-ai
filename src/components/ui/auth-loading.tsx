'use client'

import { useEffect, useState } from 'react'

interface AuthLoadingProps {
  message?: string
  className?: string
  showProgress?: boolean
}

export default function AuthLoading({
  message = "Loading...",
  className = "min-h-screen",
  showProgress = false
}: AuthLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    if (!showProgress) return

    // Progress simulation for better UX
    const messages = [
      "Checking authentication...",
      "Validating session...",
      "Loading dashboard..."
    ]

    let step = 0
    const interval = setInterval(() => {
      if (step < messages.length) {
        setCurrentMessage(messages[step])
        setProgress((step + 1) * 33)
        step++
      } else {
        clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [showProgress])

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}>
      <div className="text-center max-w-md mx-auto p-8">
        {/* Raw Logo Image */}
        <img
          src="/ideanai_logo.png"
          alt="iDEAN AI"
          className="w-auto h-auto mb-6"
        />

        {/* Loading spinner */}
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          {showProgress && progress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
          )}
        </div>

        {/* Dynamic message */}
        <div className="space-y-2">
          <p className="text-gray-700 font-medium">{currentMessage}</p>
          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          <p className="text-gray-500 text-sm">Please wait a moment...</p>
        </div>

        {/* Skeleton content preview */}
        <div className="mt-8 space-y-3 opacity-30">
          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    </div>
  )
}