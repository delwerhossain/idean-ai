'use client'

import { ReactNode, useState, useCallback } from 'react'
import { Menu, User, Settings, Crown, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Check if user is on onboarding
  const isOnboarding = pathname === '/dashboard/onboarding'

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
        onClick={() => !isOnboarding && setIsMenuOpen(!isMenuOpen)}
        disabled={isOnboarding}
        className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation ${
          isOnboarding ? 'opacity-40 cursor-not-allowed' : ''
        }`}
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
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-idean-blue hover:bg-idean-blue-light transition-colors"
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
          <header className="lg:hidden bg-white border-b border-gray-200 px-3 sm:px-4 py-2 flex items-center justify-between min-h-[52px] sm:min-h-[56px] relative z-10">
            {/* Left: Menu Button */}
            <button
              onClick={handleToggleSidebar}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              aria-label="Open menu"
              type="button"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Center: Logo */}
            <div className="grid items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/dashboard">
                <img
                  src="/ideanai_logo.png"
                  alt="iDEAN AI"
                  className="h-10 w-auto object-contain hover:opacity-80 transition-opacity cursor-pointer"
                  onError={(e) => {
                    // Fallback to custom icon if image fails
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center shadow-sm';
                    const inner = document.createElement('div');
                    inner.className = 'w-3 h-3 bg-white rounded-sm flex items-center justify-center';
                    const dot = document.createElement('div');
                    dot.className = 'w-1.5 h-1.5 bg-idean-navy rounded-full';
                    inner.appendChild(dot);
                    fallback.appendChild(inner);
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }}
                />
              </Link>
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