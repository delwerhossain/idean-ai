'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('Password reset is not currently available. Please contact support.')
  }

  if (isSubmitted) {
    return (
      <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-sm px-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-600 text-sm mb-6">
              We've sent password reset instructions to {email}
            </p>
            <Link href="/login">
              <Button className="bg-black hover:bg-gray-800 text-white font-medium">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <Link href="/">
          <img
            src="/ideanai_logo.png"
            alt="iDEAN AI"
            className="w-auto h-auto"
          />
        </Link>
        <Link href="/login">
          <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
            Back to Login
          </Button>
        </Link>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center" style={{height: 'calc(100vh - 89px)'}}>
        <div className="w-full max-w-sm px-6">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Reset your password
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <Card className="border-0 shadow-none bg-transparent p-0">
            <CardContent className="p-0 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-gray-300 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 rounded-md"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium rounded-md"
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="text-center pt-4">
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Privacy Footer */}
      <div className="absolute bottom-4 left-0 right-0 px-4 text-center text-sm text-gray-500">
        <p className="max-w-sm mx-auto">
          Private & secure. See our{' '}
          <Link href="/privacy" className="underline hover:text-gray-700">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

