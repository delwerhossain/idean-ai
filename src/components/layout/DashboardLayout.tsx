'use client'

import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import TestUserPanel from '@/components/dev/TestUserPanel'

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
  onNewCompany?: () => void
}

export default function DashboardLayout({ children, className = '', onNewCompany }: DashboardLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={['owner', 'admin', 'user']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar onNewCompany={onNewCompany} />
        <main className={`flex-1 overflow-auto ${className}`}>
          {children}
        </main>
        <TestUserPanel />
      </div>
    </ProtectedRoute>
  )
}