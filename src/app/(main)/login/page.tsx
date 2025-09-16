import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
  // Client-side auth check is handled by the LoginForm component and AuthContext

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Header with navigation */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">iA</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">iDEAN AI</span>
        </Link>
        <div className="flex space-x-4">
          <Link href="/onboarding">
            <Button className="bg-black hover:bg-gray-800 text-white font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="flex items-center justify-center" style={{height: 'calc(100vh - 89px)'}}>
        <div className="w-full max-w-sm px-6">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
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
  title: 'Sign In - iDEAN AI',
  description: 'Sign in to your iDEAN AI account to access your business strategy tools',
}