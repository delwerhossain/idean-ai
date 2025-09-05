'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText,
  BookOpen,
  MessageCircle,
  Presentation,
  Radar,
  Search,
  Calculator,
  Building,
  Settings,
  User,
  Home,
  Crown,
  LogOut,
  ChevronDown,
  Plus,
  Target,
  BarChart3,
  Users,
  Briefcase,
  TrendingUp,
  Globe
} from 'lucide-react'

interface SidebarProps {
  className?: string
  onNewCompany?: () => void
}

const navigationItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Plans', href: '/plans' },
  { icon: BookOpen, label: 'Guides', href: '/guides' },
  { icon: MessageCircle, label: 'AI Consultant', href: '/ai-consultant' },
  { icon: Presentation, label: 'Pitch', href: '/pitch' },
  { icon: Radar, label: 'Radar', href: '/radar' },
  { icon: Search, label: 'Market Research', href: '/market-research' },
  { icon: Calculator, label: 'Financials', href: '/financials' },
  { icon: Building, label: 'Formation', href: '/formation' },
  { icon: Target, label: 'Goals', href: '/goals' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: Briefcase, label: 'Projects', href: '/projects' },
  { icon: TrendingUp, label: 'Growth', href: '/growth' },
  { icon: Globe, label: 'Markets', href: '/markets' },
]

export default function Sidebar({ className = '', onNewCompany }: SidebarProps) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)
  const [showCompanySwitcher, setShowCompanySwitcher] = useState(false)
  const [businessName, setBusinessName] = useState('Your Business')
  const [userName, setUserName] = useState('User')

  useEffect(() => {
    // Load user data from localStorage
    if (typeof window !== 'undefined') {
      const savedBusinessName = localStorage.getItem('businessName') || 'Your Business'
      const savedUserName = localStorage.getItem('userName') || 'User'
      setBusinessName(savedBusinessName)
      setUserName(savedUserName)
    }
  }, [])

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
                <button 
                  onClick={() => setShowCompanySwitcher(!showCompanySwitcher)}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors truncate"
                >
                  <span className="truncate">{businessName}</span>
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Company Switcher Dropdown */}
        {showCompanySwitcher && isHovered && (
          <div className="absolute top-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2">
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="p-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!isHovered ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isHovered && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-2 border-t border-gray-200 space-y-1">
        {/* Upgrade Button */}
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
          <Crown className="w-5 h-5 flex-shrink-0 text-yellow-600" />
          {isHovered && <span>Upgrade</span>}
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
          title={!isHovered ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isHovered && <span>Settings</span>}
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
          <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 text-gray-600" />
          </div>
          {isHovered && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500">Account</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors group">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isHovered && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )
}