'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { applyActionCode } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Mail } from 'lucide-react'

export function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const oobCode = searchParams?.get('oobCode')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!oobCode) {
        setError('Invalid or missing verification code.')
        setIsLoading(false)
        return
      }

      try {
        await applyActionCode(auth, oobCode)
        setIsSuccess(true)
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard?message=email-verified')
        }, 3000)
      } catch (error: any) {
        console.error('Email verification error:', error)
        
        if (error.code === 'auth/expired-action-code') {
          setError('This verification link has expired. Please request a new one.')
        } else if (error.code === 'auth/invalid-action-code') {
          setError('This verification link is invalid or has already been used.')
        } else {
          setError('Failed to verify email. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [oobCode, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email address...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Email Verified Successfully
            </CardTitle>
            <p className="text-gray-600">
              Your email address has been confirmed. You now have full access to your account.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 text-sm">
                Redirecting to your dashboard in a few seconds...
              </p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verification Failed
          </CardTitle>
          <p className="text-gray-600">
            {error}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Need a new verification link?</p>
                <p>Sign in to your account and we&apos;ll send you a fresh verification email.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Sign In to Your Account
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Go to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}