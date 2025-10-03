import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  // Client-side auth check is handled by the LoginForm component and AuthContext

  return (
    <div className="h-screen bg-gradient-to-br from-[var(--idean-blue-light)] to-white overflow-hidden">
      {/* Header with navigation */}
      <div className="flex justify-between items-center p-6 border-b border-[var(--idean-blue-pale)]">
        <Link href="/">
          <Image
            src="/ideanai_logo.png"
            alt="iDEAN AI"
            width={120}
            height={40}
            className="h-10 w-auto hover:opacity-80 transition-opacity"
            priority
          />
        </Link>
        <div className="flex space-x-4">
          <Link href="/signup">
            <Button className="bg-[var(--idean-blue)] hover:bg-[var(--idean-blue-dark)] text-white font-medium">
              Create Account
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
      <div className="absolute bottom-4 left-0 right-0 px-4 text-center text-sm text-gray-500">
        <p className="max-w-sm mx-auto">
          Private & secure. See our{' '}
          <Link href="/privacy" className="underline hover:text-[var(--idean-blue)]">
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