'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Chrome } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signInWithGoogle, loading, user } = useAuth()

  // Pre-fill form from URL params and handle success messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get('email')
    const passwordParam = urlParams.get('password')
    const messageParam = urlParams.get('message')
    
    if (emailParam) setEmail(emailParam)
    if (passwordParam) setPassword(passwordParam)
    
    if (messageParam === 'registration-success') {
      setError('') // Clear any existing errors
      // You can add a success message here if needed
    }
  }, [])

  // Email/password auth is handled by Firebase directly in this implementation
  // For now, we'll focus on Google OAuth which your backend supports
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('Email/password login is not currently available. Please use Google sign-in.')
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      await signInWithGoogle()
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      setError('Failed to sign in with Google. Please try again.')
    }
  }

  // Redirect based on user state and onboarding completion
  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding (has business data)
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')
      const userHasBusiness = user.business || user.businessId

      if (hasCompletedOnboarding || userHasBusiness) {
        // User has completed onboarding, go to dashboard
        router.push('/dashboard')
      } else {
        // New user or user without business, need onboarding
        localStorage.setItem('isNewUser', 'false') // They have an account but need onboarding
        router.push('/dashboard/onboarding')
      }
    }
  }, [user, router])

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <div className="mx-auto w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-3 sm:mb-4">
          <span className="text-lg font-bold text-white">iA</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Login
        </h1>
      </div>

      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0 space-y-3 sm:space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-gray-300 hover:bg-gray-50 font-medium"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="w-5 h-5 mr-2" />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-500">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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

            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium rounded-md"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}