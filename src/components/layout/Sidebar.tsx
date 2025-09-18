'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import {
  FileText,
  Settings,
  User,
  Home,
  Crown,
  LogOut,
  TrendingUp,
  PenTool,
  Palette,
  Building,
  Plus,
  X
} from 'lucide-react'
import UpgradeModal from '@/components/modals/UpgradeModal'

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onToggle?: () => void
}

// Define navigation items based on iDEAN AI features
interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  roles?: string[]; // Required roles to see this item
  modules?: string[]; // Required modules (iMarketing, GrowthX, iMBA)
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  { 
    icon: Home, 
    label: 'Dashboard', 
    href: '/dashboard',
    roles: ['user', 'admin', 'owner']
  },
  { 
    icon: TrendingUp, 
    label: 'Growth Co-Pilot', 
    href: '/dashboard/growth-copilot',
    roles: ['user', 'admin', 'owner'],
    modules: ['growthx'],
    badge: 'Strategy'
  },
  { 
    icon: Palette, 
    label: 'Branding Lab', 
    href: '/dashboard/branding-lab',
    roles: ['user', 'admin', 'owner'],
    modules: ['imarketing'],
    badge: 'Brand'
  },
  { 
    icon: PenTool, 
    label: 'AI Copywriting', 
    href: '/dashboard/copywriting',
    roles: ['user', 'admin', 'owner'],
    badge: 'Content'
  },
  { 
    icon: FileText, 
    label: 'Templates', 
    href: '/dashboard/templates',
    roles: ['user', 'admin', 'owner']
  },
  { 
    icon: Building, 
    label: 'Business Knowledged', 
    href: '/dashboard/business',
    roles: ['admin', 'owner']
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    href: '/dashboard/settings',
    roles: ['user', 'admin', 'owner']
  }
]

export default function Sidebar({ className = '', isOpen = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [isExpanded, setIsExpanded] = useState(false)

  // Load current plan from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('currentPlan') || 'free'
    setCurrentPlan(savedPlan)
  }, [])

  // Close mobile menu when pathname changes
  useEffect(() => {
    if (onToggle && isOpen) {
      onToggle()
    }
    setShowAccountMenu(false)
  }, [pathname, isOpen, onToggle])

  // Handle logout
  const handleLogout = async () => {
    try {
      setShowAccountMenu(false)
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Filter navigation items based on user role
  const getFilteredNavigationItems = () => {
    const userRole = user?.role || 'user'

    return navigationItems.filter(item => {
      // Check if user role has access to this item
      if (item.roles && !item.roles.includes(userRole)) {
        return false
      }

      // TODO: Add module-based filtering when modules are implemented
      // if (item.modules && !userHasModule(item.modules)) {
      //   return false
      // }

      return true
    })
  }

  const filteredItems = getFilteredNavigationItems()

  return (
    <>
      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      <div
        className={`
          fixed inset-0 bg-black transition-opacity duration-300 lg:hidden z-40
          ${isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onToggle}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-auto lg:border-r
          ${isExpanded ? 'lg:w-72' : 'lg:w-16'}
          ${className}
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false)
          setShowAccountMenu(false)
        }}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {/* Close Button (Mobile Only) */}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              aria-label="Close menu"
              type="button"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-idean-navy rounded-full"></div>
              </div>
            </div>

            {/* Always show title on mobile, conditionally on desktop */}
            <div className={`flex flex-col flex-1 min-w-0 ${isExpanded ? 'lg:block' : 'lg:hidden'}`}>
              <span className="font-bold text-lg text-gray-900 truncate">iDEAN AI</span>
            </div>
          </div>
        </div>

        {/* Business Section - Smart Business Display */}
        <div className="flex-shrink-0 p-3 border-b border-gray-100">
          {user?.business?.business_name || user?.businessId ? (
            // User has a business - show business info
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-sm">
                  {user.business?.business_name?.[0]?.toUpperCase() || 'B'}
                </span>
              </div>
              {/* Always show on mobile, conditionally on desktop */}
              <div className={`flex-1 min-w-0 ${isExpanded ? 'lg:block' : 'lg:hidden'}`}>
                <span className="font-semibold text-sm text-gray-900 truncate block">
                  {user.business?.business_name || 'My Business'}
                </span>
                <p className="text-xs text-gray-500 truncate">
                  {user.business?.industry_tag || 'Business'}
                </p>
              </div>
            </div>
          ) : (
            // User doesn't have a business - show add business prompt
            <Link href="/dashboard/onboarding" className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors group">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                <Plus className="w-4 h-4 text-white" />
              </div>
              {/* Always show on mobile, conditionally on desktop */}
              <div className={`flex-1 min-w-0 ${isExpanded ? 'lg:block' : 'lg:hidden'}`}>
                <span className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 transition-colors block">
                  Add Business
                </span>
                <p className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors">
                  Set up your business profile
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Scrollable Navigation Content */}
        <div className={`flex-1 overflow-x-hidden ${isExpanded ? 'lg:overflow-y-auto' : 'lg:overflow-y-hidden'} overflow-y-auto`}>
          <nav className="p-3 space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-4 lg:px-3 lg:py-2 rounded-xl lg:rounded-lg text-sm font-medium transition-all duration-200 group relative touch-manipulation ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-idean-navy border border-blue-100 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  }`}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                  {/* Always show labels on mobile, conditionally on desktop */}
                  <div className={`flex items-center justify-between flex-1 ${isExpanded ? 'lg:flex' : 'lg:hidden'}`}>
                    <span className="whitespace-nowrap font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-shrink-0 p-3 border-t border-gray-100 space-y-2 bg-gray-50/50">
          {/* Upgrade Button */}
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-4 w-full px-4 py-3 lg:px-3 lg:py-2 rounded-xl lg:rounded-lg text-sm font-medium bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 hover:from-amber-100 hover:to-orange-100 border border-amber-200 transition-all duration-200 touch-manipulation shadow-sm"
          >
            <Crown className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <span className={`font-medium ${isExpanded ? 'lg:block' : 'lg:hidden'}`}>Upgrade Plan</span>
          </button>

          {/* User Profile with Dropdown - Hidden on mobile since it's in header */}
          <div className="relative lg:block hidden">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-gray-600" />
              </div>
              <div className={`flex items-center justify-between flex-1 min-w-0 ${isExpanded ? 'lg:flex' : 'lg:hidden'}`}>
                <p className="text-sm font-medium text-gray-900 truncate">Account</p>
              </div>
            </button>

            {/* Account Menu Dropdown - Desktop Only */}
            {showAccountMenu && (
              <div className={`absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-48 ${
                isExpanded ? 'lg:right-0' : 'lg:left-12'
              }`}>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                  onClick={() => setShowAccountMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={currentPlan}
        />
      </aside>
    </>
  )
}