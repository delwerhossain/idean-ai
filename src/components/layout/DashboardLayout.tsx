'use client'

import { ReactNode, useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import TestUserPanel from '@/components/dev/TestUserPanel'
import { AuthStateDebug } from '@/components/debug/AuthStateDebug'

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
}

export default function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <ProtectedRoute requiredRoles={['owner', 'admin', 'user']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
        />

        <div className="flex flex-col flex-1 lg:ml-0">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              aria-label="Open menu"
              type="button"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center shadow-sm">
                <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-idean-navy rounded-full"></div>
                </div>
              </div>
              <span className="font-bold text-sm text-gray-900">iDEAN AI</span>
            </div>
          </header>

          <main className={`flex-1 overflow-auto ${className}`}>
            {children}
          </main>
        </div>

        <TestUserPanel />
        <AuthStateDebug showInProduction={true} />
      </div>
    </ProtectedRoute>
  )
}