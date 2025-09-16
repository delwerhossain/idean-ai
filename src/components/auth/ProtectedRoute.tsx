'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, AlertCircle } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
  feature?: string
  fallback?: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  feature,
  fallback,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, hasRole, canAccess } = useAuth()
  const router = useRouter()

  // Handle redirect in useEffect to avoid React render state update issues
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check role-based access
  const hasAccess = requiredRoles 
    ? hasRole(requiredRoles) 
    : feature 
    ? canAccess(feature)
    : true

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Access Denied
              </h3>
              <p className="text-gray-600">
                You don&apos;t have permission to access this feature. 
                Contact your administrator if you believe this is an error.
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['owner', 'admin']}>
      {children}
    </ProtectedRoute>
  )
}

export function OwnerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['owner']}>
      {children}
    </ProtectedRoute>
  )
}