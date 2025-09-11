import { Suspense } from 'react'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  // Client-side auth check is handled by the component and AuthContext

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        }>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Reset Password - iDEAN AI',
  description: 'Reset your iDEAN AI account password',
}