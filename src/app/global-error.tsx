'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console but don't let EPIPE errors crash the app
    if (error.message.includes('EPIPE') || error.message.includes('write EPIPE')) {
      // Silently handle EPIPE errors
      console.warn('EPIPE error handled:', error.message)
    } else {
      // Log other errors normally
      console.error('Global error:', error)
    }
  }, [error])

  if (error.message.includes('EPIPE')) {
    // Don't show error UI for EPIPE errors, just reset
    reset()
    return null
  }

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-6">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}