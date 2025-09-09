'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  FileText,
  MessageCircle,
  Settings,
  User,
  Home,
  Crown,
  LogOut,
  ChevronDown,
  Plus,
  BarChart3,
  Zap,
  Bot,
  MapPin,
  TrendingUp,
  Lightbulb,
  PenTool,
  Calendar,
  BookOpen,
  Target
} from 'lucide-react'

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
    icon: Lightbulb, 
    label: 'Blueprint Builder', 
    href: '/blueprints',
    roles: ['user', 'admin', 'owner'],
    badge: 'Strategy DNA'
  },
  { 
    icon: Zap, 
    label: 'Campaign Engine', 
    href: '/campaigns',
    roles: ['user', 'admin', 'owner'],
    badge: 'Execution DNA'
  },
  { 
    icon: Target, 
    label: 'Growth Audit', 
    href: '/audit',
    roles: ['user', 'admin', 'owner']
  },
  { 
    icon: MapPin, 
    label: 'Guided Paths', 
    href: '/guided-paths',
    roles: ['user', 'admin', 'owner'],
    badge: 'Learn'
  },
  { 
    icon: Bot, 
    label: 'AI Co-Pilot', 
    href: '/copilot',
    roles: ['user', 'admin', 'owner']
  },
  { 
    icon: Calendar, 
    label: 'Content Calendar', 
    href: '/content-calendar',
    roles: ['user', 'admin', 'owner']
  },
  { 
    icon: BookOpen, 
    label: 'Framework Library', 
    href: '/library',
    roles: ['user', 'admin', 'owner']
  },
  { 
    icon: BarChart3, 
    label: 'Analytics', 
    href: '/analytics',
    roles: ['admin', 'owner']
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    href: '/settings',
    roles: ['user', 'admin', 'owner']
  }
]

export default function Sidebar({ className = '', onNewCompany }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isHovered, setIsHovered] = useState(false)
  const [showCompanySwitcher, setShowCompanySwitcher] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [businessName, setBusinessName] = useState('Your Business')

  useEffect(() => {
    // Load user data from localStorage
    if (typeof window !== 'undefined') {
      const savedBusinessName = localStorage.getItem('businessName') || 'Your Business'
      setBusinessName(savedBusinessName)
    }
  }, [])

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
    onNewCompany?.()
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
              {businessName.charAt(0).toUpperCase()}
            </span>
          </div>
          {isHovered && (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className="font-semibold text-sm text-gray-900 truncate">{businessName}</span>
              <ChevronDown className="w-3 h-3 flex-shrink-0 text-gray-400" />
            </div>
          )}
        </button>

        {/* Company Switcher Dropdown */}
        {showCompanySwitcher && isHovered && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
              Current Company
            </div>
            <div className="px-3 py-2 text-sm text-gray-900 bg-blue-50 border-l-2 border-blue-500">
              {businessName}
            </div>
            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 mt-2">
              Actions
            </div>
            <button 
              onClick={handleNewCompany}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Company
            </button>
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
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
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
                href="/settings"
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