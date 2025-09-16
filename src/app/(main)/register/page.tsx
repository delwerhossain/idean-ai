import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  // Client-side auth check is handled by the RegisterForm component and AuthContext

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Sign Up - iDEAN AI',
  description: 'Create your iDEAN AI account and start building better business strategies',
}