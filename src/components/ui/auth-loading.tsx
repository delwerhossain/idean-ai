'use client'

interface AuthLoadingProps {
  message?: string
  className?: string
}

export default function AuthLoading({
  message = "Loading...",
  className = "min-h-screen"
}: AuthLoadingProps) {
  return (
    <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}