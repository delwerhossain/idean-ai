import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const token = req.auth

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/auth/error', '/forgot-password', '/reset-password', '/verify-email']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Static files and API routes (let them handle their own auth)
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // If not authenticated, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role-based route protection with updated roles (user, admin, owner)
  const userRole = token?.user?.role as string

  // Owner-only routes
  const ownerRoutes = ['/admin/billing', '/admin/business', '/admin/users', '/admin/settings/billing']
  if (ownerRoutes.some(route => pathname.startsWith(route)) && userRole !== 'owner') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Admin routes (Owner + Admin access)
  const adminRoutes = ['/admin/team', '/admin/settings', '/admin/templates', '/admin/analytics']
  if (adminRoutes.some(route => pathname.startsWith(route)) && !['owner', 'admin'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Business setup required routes - redirect to onboarding if no business
  // Note: Temporarily disabled businessId check for frontend-only setup
  // In production with backend, uncomment the businessId check
  const businessRequiredRoutes = ['/dashboard', '/tools', '/generate-document']
  if (businessRequiredRoutes.some(route => pathname.startsWith(route)) && 
      false && // Disabled: !token.user?.businessId && 
      pathname !== '/dashboard/onboarding') {
    return NextResponse.redirect(new URL('/dashboard/onboarding', req.url))
  }

  // Redirect authenticated users from auth pages
  if (['/login', '/register'].includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}