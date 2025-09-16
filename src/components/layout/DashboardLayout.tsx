'use client'

import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import TestUserPanel from '@/components/dev/TestUserPanel'
import { AuthStateDebug } from '@/components/debug/AuthStateDebug'

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
}

export default function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={['owner', 'admin', 'user']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className={`flex-1 overflow-auto ${className}`}>
          {children}
        </main>
        <TestUserPanel />
        <AuthStateDebug showInProduction={true} />
      </div>
    </ProtectedRoute>
  )
}