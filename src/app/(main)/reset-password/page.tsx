import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  // Client-side auth check is handled by the component and AuthContext

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Reset Password - iDEAN AI',
  description: 'Create a new password for your iDEAN AI account',
}