import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/auth/error', '/forgot-password', '/reset-password', '/verify-email']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Static files and API routes (let them handle their own auth)
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // For now, allow all routes through since Firebase auth is handled client-side
  // In production, you could check for auth cookies or tokens here
  return NextResponse.next()
}

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