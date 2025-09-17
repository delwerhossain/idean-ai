'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Handle EPIPE errors gracefully
    if (error.message.includes('EPIPE') || error.message.includes('write EPIPE')) {
      // Silently handle EPIPE errors and reset automatically
      setTimeout(reset, 100)
      return
    }
    
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Page error:', error)
    }
  }, [error, reset])

  // Don't render error UI for EPIPE errors
  if (error.message.includes('EPIPE')) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          An error occurred while loading this page.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}