import { Suspense } from 'react'
import { VerifyEmailPage } from '@/components/auth/VerifyEmailPage'

export default function VerifyEmailRoute() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-96 w-96 rounded-xl"></div>
        </div>
      </div>
    }>
      <VerifyEmailPage />
    </Suspense>
  )
}

export const metadata = {
  title: 'Verify Email - iDEAN AI',
  description: 'Verify your email address for your iDEAN AI account',
}