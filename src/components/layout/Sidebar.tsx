'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  FileText,
  Settings,
  User,
  Home,
  Crown,
  LogOut,
  ChevronDown,
  Plus,
  TrendingUp,
  PenTool,
  Palette,
  Building,
  Check,
  Loader2
} from 'lucide-react'
import { useBusiness } from '@/lib/contexts/BusinessContext'

interface SidebarProps {
  className?: string
  onNewCompany?: () => void
}

// Define navigation items based on iDEAN AI features
interface NavigationItem {
  icon: any;
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

export default function Sidebar({ className = '', onNewCompany }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [showCompanySwitcher, setShowCompanySwitcher] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [switchingBusiness, setSwitchingBusiness] = useState<string | null>(null)
  
  // Use business context
  const { currentBusiness, businesses, loading: loadingBusinesses, switchBusiness } = useBusiness()

  const handleBusinessSwitch = async (businessId: string) => {
    try {
      setSwitchingBusiness(businessId)
      await switchBusiness(businessId)
      setShowCompanySwitcher(false)
    } catch (error) {
      console.error('Failed to switch business:', error)
    } finally {
      setSwitchingBusiness(null)
    }
  }

  // Filter navigation items based on user role
  const getFilteredNavigationItems = () => {
    const userRole = session?.user?.role || 'user'
    
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

  const handleNewCompany = () => {
    setShowCompanySwitcher(false)
    // Navigate to onboarding for new business creation
    router.push('/dashboard/onboarding')
  }

  return (
    <div 
      className={`${isHovered ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col h-screen ${className} relative z-50`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowCompanySwitcher(false)
        setShowAccountMenu(false)
      }}
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">iD</span>
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

      {/* Company Section - Always Visible */}
      <div className="flex-shrink-0 p-3 border-b border-gray-100 relative">
        <button
          onClick={() => isHovered && setShowCompanySwitcher(!showCompanySwitcher)}
          className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
          disabled={!isHovered}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">
              {currentBusiness?.business_name?.charAt(0).toUpperCase() || 'B'}
            </span>
          </div>
          {isHovered && (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className="font-semibold text-sm text-gray-900 truncate">
                {currentBusiness?.business_name || 'No Business Selected'}
              </span>
              <ChevronDown className="w-3 h-3 flex-shrink-0 text-gray-400" />
            </div>
          )}
        </button>

        {/* Company Switcher Dropdown */}
        {showCompanySwitcher && isHovered && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2 max-h-80 overflow-y-auto">
            {loadingBusinesses ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading businesses...</span>
              </div>
            ) : (
              <>
                {/* Current Business */}
                {currentBusiness && (
                  <>
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                      Current Business
                    </div>
                    <div className="px-3 py-2 text-sm text-gray-900 bg-blue-50 border-l-2 border-blue-500">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium">{currentBusiness.business_name}</div>
                          <div className="text-xs text-gray-500">{currentBusiness.industry_tag}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Available Businesses */}
                {businesses.length > 0 && businesses.some(b => b.id !== currentBusiness?.id) && (
                  <>
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 mt-2">
                      Switch to Business
                    </div>
                    {businesses
                      .filter(business => business.id !== currentBusiness?.id)
                      .map((business) => (
                        <button
                          key={business.id}
                          onClick={() => handleBusinessSwitch(business.id)}
                          disabled={switchingBusiness === business.id}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {switchingBusiness === business.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">
                                {business.business_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="text-left">
                            <div className="font-medium">{business.business_name}</div>
                            <div className="text-xs text-gray-500">{business.industry_tag}</div>
                          </div>
                        </button>
                      ))}
                  </>
                )}

                {/* Actions */}
                <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 mt-2">
                  Actions
                </div>
                <button 
                  onClick={handleNewCompany}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Business
                </button>

                {/* No Business Message */}
                {!currentBusiness && businesses.length === 0 && !loadingBusinesses && (
                  <div className="px-3 py-4 text-center">
                    <div className="text-sm text-gray-600 mb-2">No businesses found</div>
                    <button 
                      onClick={handleNewCompany}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create your first business
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
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
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">
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
          onClick={() => router.push('/dashboard/settings')}
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
    </div>
  )
}