import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  // Client-side auth check is handled by the LoginForm component and AuthContext

  return (
    <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-sm px-6 py-8 max-h-screen overflow-y-auto">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Sign In - iDEAN AI',
  description: 'Sign in to your iDEAN AI account to access your business strategy tools',
}