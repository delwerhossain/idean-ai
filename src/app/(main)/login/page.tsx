import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { LoginForm } from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const session = await auth()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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