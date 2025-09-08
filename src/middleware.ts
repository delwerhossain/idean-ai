import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const token = req.auth

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register', '/auth/error']
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // If not authenticated, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Role-based route protection
    const userRole = token?.user?.role as string

    // Owner-only routes
    const ownerRoutes = ['/admin/billing', '/admin/organization', '/admin/users']
    if (ownerRoutes.some(route => pathname.startsWith(route)) && userRole !== 'owner') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Admin routes (Owner + Admin access)
    const adminRoutes = ['/admin/team', '/admin/settings', '/admin/templates']
    if (adminRoutes.some(route => pathname.startsWith(route)) && !['owner', 'admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
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