'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Chrome } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signInWithGoogle, loading } = useAuth()

  // Check if user came from onboarding
  useEffect(() => {
    const readyForSignup = localStorage.getItem('readyForSignup')
    const onboardingCompleted = localStorage.getItem('onboardingCompleted')

    if (!readyForSignup || !onboardingCompleted) {
      // Redirect to onboarding if they haven't completed it
      router.push('/onboarding')
      return
    }

    // Clear the signup flag
    localStorage.removeItem('readyForSignup')
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('Email/password signup is not currently available. Please use Google sign-up.')
  }

  const handleGoogleSignup = async () => {
    setError('')
    try {
      await signInWithGoogle()
      // After successful signup, process onboarding data and create business
      const onboardingData = localStorage.getItem('onboardingData')
      if (onboardingData) {
        try {
          const data = JSON.parse(onboardingData)
          // The user will be redirected to dashboard creation flow
          localStorage.setItem('pendingBusinessData', onboardingData)
          localStorage.setItem('hasCompletedOnboarding', 'true')
        } catch (error) {
          console.error('Failed to parse onboarding data:', error)
        }
      }
    } catch (error: any) {
      console.error('Google sign-up error:', error)
      setError('Failed to sign up with Google. Please try again.')
    }
  }

  return (
    <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Header with login link */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">iA</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">iDEAN AI</span>
        </Link>
        <Link
          href="/login"
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Login
        </Link>
      </div>

      <div className="w-full max-w-sm px-6 py-8 max-h-screen overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Sign up to save your Strategy
            </h1>
          </div>

          <Card className="border-0 shadow-none bg-transparent p-0">
            <CardContent className="p-0 space-y-3 sm:space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-gray-300 hover:bg-gray-50 font-medium"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <Chrome className="w-5 h-5 mr-2" />
                {loading ? 'Signing up...' : 'Sign up with Google'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-gray-500">Or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11 border-gray-300 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 rounded-md"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-11 border-gray-300 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 rounded-md"
                      required
                    />
                  </div>
                </div>

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

                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-11 border-gray-300 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 rounded-md"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium rounded-md"
                  disabled={loading}
                >
                  {loading ? 'Signing up...' : 'Sign up'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Privacy Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
        <p>
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

export const metadata = {
  title: 'Sign Up - iDEAN AI',
  description: 'Create your iDEAN AI account to save your business strategy',
}