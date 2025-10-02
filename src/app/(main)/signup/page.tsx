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

  // Clear signup flag on mount if it exists
  useEffect(() => {
    localStorage.removeItem('readyForSignup')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate inputs
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your full name')
      return
    }

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const { ideanApi } = await import('@/lib/api/idean-api')

      // Register user
      const response = await ideanApi.auth.register({
        email: email.trim(),
        password,
        name: `${firstName.trim()} ${lastName.trim()}`,
        provider: 'email'
      })

      // Store token
      localStorage.setItem('authToken', response.token)

      // Process onboarding data and create business
      const onboardingData = localStorage.getItem('onboardingData')
      if (onboardingData) {
        try {
          const data = JSON.parse(onboardingData)

          const businessData = {
            business_name: data.businessName,
            website_url: data.website || '',
            industry_tag: data.industry,
            business_documents: [],
            business_context: data.businessContext || '',
            language: data.language || 'en',
            mentor_approval: data.mentorApproval ? 'approved' : 'pending',
            module_select: 'standard' as const,
            readiness_checklist: 'pending'
          }

          await ideanApi.business.create(businessData)

          // Clear onboarding data
          localStorage.removeItem('onboardingData')
          localStorage.removeItem('onboardingCompleted')
          localStorage.removeItem('readyForSignup')
          localStorage.setItem('hasCompletedOnboarding', 'true')

          // Redirect to dashboard
          router.push('/dashboard')
        } catch (apiError) {
          console.error('Failed to create business:', apiError)
          setError('Failed to create business. Please try again.')
        }
      } else {
        // No onboarding data, just go to dashboard
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      // Show detailed error for debugging
      const errorMessage = error.message || error.details?.message || 'Failed to sign up. Please try again.'
      setError(errorMessage)
    }
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

          // Import and create business using backend API
          const { ideanApi } = await import('@/lib/api/idean-api')

          // Create business (files will be handled separately since they can't be stored in localStorage)
          const businessData = {
            business_name: data.businessName,
            website_url: data.website || '',
            industry_tag: data.industry,
            business_documents: [],
            business_context: data.businessContext || '',
            language: data.language || 'en',
            mentor_approval: data.mentorApproval ? 'approved' : 'pending',
            module_select: 'standard' as const,
            readiness_checklist: 'pending'
          }

          const result = await ideanApi.business.create(businessData)
          console.log('Business created:', result)

          // Note: File uploads need to be handled differently since File objects
          // cannot be stored in localStorage. For MVP, business is created without documents.

          // Clear onboarding data
          localStorage.removeItem('onboardingData')
          localStorage.removeItem('onboardingCompleted')
          localStorage.removeItem('readyForSignup')
          localStorage.setItem('hasCompletedOnboarding', 'true')

          // Redirect to dashboard
          router.push('/dashboard')

        } catch (apiError) {
          console.error('Failed to create business:', apiError)
          setError('Failed to create business. Please try again.')
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
        <Link href="/">
          <img
            src="/ideanai_logo.png"
            alt="iDEAN AI"
            className="h-10 w-auto hover:opacity-80 transition-opacity"
          />
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
                      maxLength={50}
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
                      maxLength={50}
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
                    maxLength={254}
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
                      className="pr-10 h-11 border-gray-300 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 rounded-md [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                      maxLength={128}
                      required
                      autoComplete="new-password"
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
                  className="w-full h-11 bg-idean-navy hover:bg-idean-navy-dark text-idean-white font-medium rounded-md"
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

