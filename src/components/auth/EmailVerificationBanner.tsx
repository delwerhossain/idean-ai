'use client'

import { useState } from 'react'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, AlertCircle, CheckCircle, X } from 'lucide-react'

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show if user is verified or banner is dismissed
  if (!user || user.emailVerified || isDismissed) {
    return null
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    setError('')
    
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        await sendEmailVerification(currentUser, {
          url: `${window.location.origin}/dashboard`,
          handleCodeInApp: false,
        })
        setIsSuccess(true)
        setTimeout(() => setIsSuccess(false), 5000)
      }
    } catch (error: any) {
      console.error('Email verification error:', error)
      
      if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.')
      } else {
        setError('Failed to send verification email. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="m-4 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Mail className="w-5 h-5 text-orange-600 mt-0.5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-medium text-orange-800">
                Please verify your email address
              </h3>
            </div>
            
            <p className="mt-1 text-sm text-orange-700">
              We sent a verification link to <span className="font-medium">{user.email}</span>. 
              Please check your inbox and click the link to verify your account.
            </p>

            {error && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}

            {isSuccess && (
              <div className="mt-2 text-sm text-green-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verification email sent! Check your inbox.
              </div>
            )}

            <div className="mt-3 flex items-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendVerification}
                disabled={isResending || isSuccess}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                {isResending ? 'Sending...' : isSuccess ? 'Sent!' : 'Resend Email'}
              </Button>
              
              <button
                onClick={() => setIsDismissed(true)}
                className="text-orange-600 hover:text-orange-800 text-sm"
              >
                Remind me later
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 text-orange-600 hover:text-orange-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}