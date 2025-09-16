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
  Building
} from 'lucide-react'
import UpgradeModal from '@/components/modals/UpgradeModal'

interface SidebarProps {
  className?: string
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
    label: 'Business Management', 
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

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('free')

  // Load current plan from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('currentPlan') || 'free'
    setCurrentPlan(savedPlan)
  }, [])


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
    <div 
      className={`${isHovered ? 'w-72' : 'w-16'} transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col h-screen ${className} relative z-50`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowAccountMenu(false)
      }}
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          {isHovered && (
            <>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-lg text-gray-900 truncate">iDEAN AI</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Business Section - Simplified */}
      <div className="flex-shrink-0 p-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          {isHovered && (
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm text-gray-900 truncate">My Business</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Navigation Content */}
      <div className={`flex-1 overflow-x-hidden ${isHovered ? 'overflow-y-auto' : 'overflow-y-hidden'}`}>
        <nav className="p-2 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!isHovered ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isHovered && (
                  <>
                    <span className="flex-1 whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-2 border-t border-gray-200 space-y-1 relative">
        {/* Upgrade Button */}
        <button 
          onClick={() => setShowUpgradeModal(true)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
        >
          <Crown className="w-5 h-5 flex-shrink-0 text-yellow-600" />
          {isHovered && <span>Upgrade</span>}
        </button>

        {/* User Profile with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-gray-600" />
            </div>
            {isHovered && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">Account</p>
                </div>
              </div>
            )}
          </button>

          {/* Account Menu Dropdown */}
          {showAccountMenu && isHovered && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowAccountMenu(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <hr className="my-1 border-gray-100" />
              <button 
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => setShowAccountMenu(false)}
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
    </div>
  )
}