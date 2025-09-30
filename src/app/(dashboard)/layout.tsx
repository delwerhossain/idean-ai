'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ideanApi } from '@/lib/api/idean-api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { BusinessProvider } from '@/lib/contexts/BusinessContext'
import AuthLoading from '@/components/ui/auth-loading'

function BusinessStatusChecker({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for complete authentication readiness (includes localStorage hydration)
    if (!isAuthReady) {
      console.log('🔄 Auth not ready, waiting for complete authentication state...')
      return
    }

    // If no user after auth is fully ready, redirect to login
    if (!user) {
      console.log('🔐 No authenticated user found, redirecting to login')
      router.push('/login')
      return
    }

    // Use JWT data for business status (no API call needed)
    console.log('✅ User authenticated, checking business status from JWT...')
    checkBusinessStatusFromJWT()
  }, [user, isAuthReady, router])

  const checkBusinessStatusFromJWT = () => {
    try {
      // Check if user has business data from JWT
      const hasBusiness = user?.businessId || user?.business

      if (!hasBusiness) {
        // No business found - redirect to onboarding
        console.log('📋 No business found in JWT, redirecting to onboarding')
        if (window.location.pathname !== '/dashboard/onboarding') {
          router.push('/dashboard/onboarding')
        }
        return
      }

      console.log('✅ Business found in JWT:', user?.business?.business_name || `ID: ${user?.businessId}`)

      // Check if we're on the onboarding page but have a business
      if (window.location.pathname === '/dashboard/onboarding') {
        console.log('🏠 Business exists, redirecting to dashboard')
        router.push('/dashboard')
        return
      }

    } catch (error: any) {
      console.warn('⚠️ Business status check failed:', error.message)
      // Fallback to onboarding if something goes wrong
      if (window.location.pathname !== '/dashboard/onboarding') {
        router.push('/dashboard/onboarding')
      }
    }
  }

  // Show loading UI while authentication is being resolved
  if (!isAuthReady) {
    return <AuthLoading message="Authenticating..." showProgress={true} />
  }

  // If no user after auth is ready, let the redirect happen
  if (!user) {
    return <AuthLoading message="Redirecting to login..." showProgress={false} />
  }

  // Render children - the business status check happens in the background
  return <>{children}</>
}

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isOnboarding = pathname === '/dashboard/onboarding'

  return (
    <BusinessProvider>
      <BusinessStatusChecker>
        {isOnboarding ? (
          // Render onboarding without DashboardLayout (no sidebar/header)
          <div className="min-h-screen bg-white">
            {children}
          </div>
        ) : (
          <DashboardLayout>{children}</DashboardLayout>
        )}
      </BusinessStatusChecker>
    </BusinessProvider>
  )
}