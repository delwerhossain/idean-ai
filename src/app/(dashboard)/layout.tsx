'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

    // Check business status
    console.log('✅ User authenticated, checking business status...')
    checkBusinessStatus()
  }, [user, isAuthReady, router])

  const checkBusinessStatus = async () => {
    try {
      // Check user profile which includes business information
      const userResponse = await ideanApi.user.getMe()

      if (!userResponse.business) {
        // No business found - redirect to onboarding
        console.log('📋 No business found, redirecting to onboarding')
        router.push('/dashboard/onboarding')
        return
      }

      console.log('✅ Business found:', userResponse.business.business_name)

      // Check if we're on the onboarding page but have a business
      if (window.location.pathname === '/dashboard/onboarding') {
        console.log('🏠 Business exists, redirecting to dashboard')
        router.push('/dashboard')
        return
      }

    } catch (error: any) {
      // If it's a 404 or similar, user likely doesn't have a business
      if (error.status === 404 || error.status === 400) {
        // Only redirect to onboarding if not already there
        if (window.location.pathname !== '/dashboard/onboarding') {
          console.log('📋 No business found (API error), redirecting to onboarding')
          router.push('/dashboard/onboarding')
        }
        return
      }

      // For other errors (500, network, etc.), log but don't redirect
      console.warn('⚠️ Business status check failed:', error.message)

      // Could show a toast or error message here instead of blocking access
    }
  }

  // Show loading UI while authentication is being resolved
  if (!isAuthReady) {
    return <AuthLoading message="Authenticating..." />
  }

  // If no user after auth is ready, let the redirect happen
  if (!user) {
    return null // Don't render children while redirecting
  }

  // Render children - the business status check happens in the background
  return <>{children}</>
}

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BusinessProvider>
      <BusinessStatusChecker>
        <DashboardLayout>{children}</DashboardLayout>
      </BusinessStatusChecker>
    </BusinessProvider>
  )
}