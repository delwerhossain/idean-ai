'use client'

import { ReactNode, useState, useCallback } from 'react'
import { Menu, User, Settings, Crown, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from './Sidebar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import TestUserPanel from '@/components/dev/TestUserPanel'
import { AuthStateDebug } from '@/components/debug/AuthStateDebug'

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
}

// Mobile Account Menu Component
function MobileAccountMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false)
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="relative">
      {/* Account Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
        type="button"
        aria-label="Account menu"
      >
        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'Account'}
              </p>
              {user?.business?.business_name && (
                <p className="text-xs text-gray-500 truncate">
                  {user.business.business_name}
                </p>
              )}
            </div>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>

            <button
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Crown className="w-4 h-4" />
              Upgrade Plan
            </button>

            <hr className="my-1 border-gray-100" />

            <button
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])

  return (
    <ProtectedRoute requiredRoles={['owner', 'admin', 'user']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
        />

        <div className="flex flex-col flex-1 lg:ml-0 transition-all duration-200 ease-out">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between min-h-[60px] relative z-10">
            {/* Left: Menu Button */}
            <button
              onClick={handleToggleSidebar}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              aria-label="Open menu"
              type="button"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Center: Logo */}
            <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center shadow-sm">
                <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-idean-navy rounded-full"></div>
                </div>
              </div>
              <span className="font-bold text-sm text-gray-900">iDEAN AI</span>
            </div>

            {/* Right: Account Options */}
            <MobileAccountMenu />
          </header>

          <main className={`flex-1 overflow-auto ${className}`}>
            {children}
          </main>
        </div>

        {/* <TestUserPanel /> */}
        <AuthStateDebug showInProduction={true} />
      </div>
    </ProtectedRoute>
  )
}