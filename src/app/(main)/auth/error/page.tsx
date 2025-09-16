'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'Default':
        return 'An unexpected error occurred during authentication.'
      default:
        return 'An error occurred during sign in. Please try again.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Authentication Error
            </CardTitle>
            <p className="text-gray-600">
              {getErrorMessage(error)}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">
                  Try Again
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Go Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Authentication Error
              </CardTitle>
              <p className="text-gray-600">
                Loading...
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}