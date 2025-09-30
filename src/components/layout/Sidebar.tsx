"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
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
  X,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import UpgradeModal from "@/components/modals/UpgradeModal";
import HelpModal from "@/components/modals/HelpModal";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
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
    label: "Dashboard",
    href: "/dashboard",
    roles: ["user", "admin", "owner"],
  },
  {
    icon: PenTool,
    label: "Brand & Content Studio",
    href: "/dashboard/copywriting",
    roles: ["user", "admin", "owner"],
    badge: "Studio",
  },
  // {
  //   icon: TrendingUp,
  //   label: "Growth Co-Pilot",
  //   href: "/dashboard/growth-copilot",
  //   roles: ["user", "admin", "owner"],
  //   modules: ["growthx"],
  //   badge: "Strategy",
  // },
  // {
  //   icon: Palette,
  //   label: "Branding Lab",
  //   href: "/dashboard/branding-lab",
  //   roles: ["user", "admin", "owner"],
  //   modules: ["imarketing"],
  //   badge: "Brand",
  // },
  {
    icon: FileText,
    label: "Templates",
    href: "/dashboard/templates",
    roles: ["user", "admin", "owner"],
  },
  {
    icon: Building,
    label: "Business Knowledge",
    href: "/dashboard/business",
    roles: ["admin", "owner"],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
    roles: ["user", "admin", "owner"],
  },
];

export default function Sidebar({
  className = "",
  isOpen = false,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : true); // Default to mobile for better mobile UX
  const prevPathnameRef = useRef(pathname);

  // Check if user is on onboarding (hasn't completed it yet)
  const isOnboarding = pathname === '/dashboard/onboarding';

  // Check if we're on mobile with debounced resize handling
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);

    // Debounce resize events for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedCheckMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };

    checkMobile();
    window.addEventListener('resize', debouncedCheckMobile, { passive: true });
    return () => {
      window.removeEventListener('resize', debouncedCheckMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Load current plan from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem("currentPlan") || "free";
    setCurrentPlan(savedPlan);
  }, []);

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    // Only close menu when navigating to a different page
    if (prevPathnameRef.current !== pathname && isOpen && isMobile && onToggle) {
      // Add a small delay to ensure the navigation is intentional
      const timer = setTimeout(() => {
        onToggle();
      }, 50);

      // Update the ref
      prevPathnameRef.current = pathname;

      return () => clearTimeout(timer);
    }
    prevPathnameRef.current = pathname;
    setShowAccountMenu(false);
  }, [pathname, isOpen, isMobile, onToggle]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && isMobile && onToggle) {
        onToggle();
      }
    };

    if (isOpen && isMobile) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling when sidebar is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile, onToggle]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setShowAccountMenu(false);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Filter navigation items based on user role
  const getFilteredNavigationItems = () => {
    const userRole = user?.role || "user";

    return navigationItems.filter((item) => {
      // Check if user role has access to this item
      if (item.roles && !item.roles.includes(userRole)) {
        return false;
      }

      // TODO: Add module-based filtering when modules are implemented
      // if (item.modules && !userHasModule(item.modules)) {
      //   return false
      // }

      return true;
    });
  };

  const filteredItems = getFilteredNavigationItems();

  return (
    <>
      {/* Enhanced Mobile Overlay with Smooth Fade */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black z-[60] lg:hidden transition-all duration-300 ease-out transform-gpu ${
            isOpen
              ? "opacity-50 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={onToggle}
          style={{ backdropFilter: isOpen ? 'blur(2px)' : 'none' }}
        />
      )}

      {/* Enhanced Sidebar with Smooth Animations and Performance Optimization */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-[70] flex flex-col
          transition-all duration-300 ease-out will-change-transform backdrop-blur-sm
          lg:relative lg:z-auto lg:transition-all lg:duration-200 lg:ease-out
          ${isMobile
            ? `w-[280px] sm:w-[320px] lg:w-72 ${isOpen ? "translate-x-0" : "-translate-x-full"} shadow-2xl lg:shadow-none`
            : `${isExpanded ? "w-72" : "w-20"} translate-x-0`
          }
          ${className}
          transform-gpu
        `}
        onMouseEnter={() => !isMobile && !isOpen && setIsExpanded(true)}
        onMouseLeave={() => {
          if (!isMobile && !isOpen) {
            setIsExpanded(false);
            setShowAccountMenu(false);
          }
        }}
        onFocus={() => !isMobile && !isOpen && setIsExpanded(true)}
        onBlur={(e) => {
          if (!isMobile && !isOpen && !e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsExpanded(false);
            setShowAccountMenu(false);
          }
        }}
      >
        {/* Header with Logo - Always Prominent */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white relative min-h-[60px] lg:min-h-[64px] flex items-center">
          {/* Close Button (Mobile Only) */}
          <button
            onClick={onToggle}
            className="lg:hidden absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 transition-colors z-10"
            aria-label="Close menu"
            type="button"
            tabIndex={0}
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Logo Section - Always Visible and Responsive */}
          <div className="p-2 flex items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              {isMobile || isExpanded ? (
                // Full logo when expanded or on mobile - no icon, just full logo with left margin
                <div className="flex items-center ml-5">
                  <img
                    src="/ideanai_logo.png"
                    alt="iDEAN AI"
                    className="h-10 w-auto transition-all duration-200 ease-out object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'font-bold text-xl text-blue-600';
                      fallback.textContent = 'iDEAN AI';
                      e.currentTarget.parentNode?.appendChild(fallback);
                    }}
                  />
                </div>
              ) : (
                // Icon only when collapsed on desktop - aligned with other icons
                <div className="flex items-center justify-center w-12 h-12 pl-2">
                  <img
                    src="/ideanai_logo_icon.png"
                    alt="iDEAN AI"
                    className="w-10 h-10 transition-all duration-200 ease-out object-contain drop-shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg';
                      fallback.textContent = 'iA';
                      e.currentTarget.parentNode?.appendChild(fallback);
                    }}
                  />
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Business Section - Smart Business Display */}
        <div className="flex-shrink-0 border-b border-gray-100 bg-gradient-to-r from-gray-25 to-white p-2">
          {user?.business?.business_name || user?.businessId ? (
            // User has a business - show business info
            <div className="relative flex items-center transition-colors p-2">
              {/* Expandable Background */}
              <div
                className={`absolute inset-0 hover:bg-gray-50 rounded-xl transition-all duration-200 ease-out ${
                  isMobile || isExpanded
                    ? "opacity-100 scale-100"
                    : "lg:opacity-0 lg:scale-95 lg:w-12 lg:h-12"
                }`}
              />

              {/* Fixed Icon Container - Always Same Position */}
              <div className="relative z-20 flex-shrink-0 flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg lg:shadow-sm w-10 h-10 lg:w-8 lg:h-8 touch-manipulation">
                  <span className="text-white font-bold text-base lg:text-sm select-none">
                    {user.business?.business_name?.[0]?.toUpperCase() || "B"}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div
                className={`relative z-10 ml-3 flex-1 min-w-0 transition-all duration-200 ease-out ${
                  isMobile || isExpanded
                    ? "opacity-100 scale-100 translate-x-0"
                    : "lg:opacity-0 lg:scale-95 lg:-translate-x-2 lg:w-0 lg:overflow-hidden"
                }`}
              >
                <span className={`font-semibold text-gray-900 truncate block whitespace-nowrap select-none ${
                  isMobile ? "text-sm sm:text-base" : "text-sm"
                }`}>
                  {user.business?.business_name || "My Business"}
                </span>
                <p className={`text-gray-500 truncate whitespace-nowrap select-none ${
                  isMobile ? "text-xs sm:text-sm" : "text-xs"
                }`}>
                  {user.business?.industry_tag || "Business"}
                </p>
              </div>
            </div>
          ) : (
            // User doesn't have a business - show add business prompt
            <Link
              href="/dashboard/onboarding"
              className="relative flex items-center transition-all duration-300 group p-2"
            >
              {/* Expandable Background */}
              <div
                className={`absolute inset-0 hover:bg-gray-50 rounded-xl transition-all duration-200 ease-out ${
                  isMobile || isExpanded
                    ? "opacity-100 scale-100"
                    : "lg:opacity-0 lg:scale-95 lg:w-12 lg:h-12"
                }`}
              />

              {/* Fixed Icon Container - Always Same Position */}
              <div className="relative z-20 flex-shrink-0 flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10">
                <div className="bg-gradient-to-br from-idean-blue to-blue-600 rounded-xl flex items-center justify-center shadow-lg lg:shadow-sm group-hover:shadow-xl lg:group-hover:shadow-md transition-shadow w-10 h-10 lg:w-8 lg:h-8 touch-manipulation">
                  <Plus className="text-white w-5 h-5 lg:w-4 lg:h-4" />
                </div>
              </div>

              {/* Text Content */}
              <div
                className={`relative z-10 ml-3 flex-1 min-w-0 transition-all duration-200 ease-out ${
                  isMobile || isExpanded
                    ? "opacity-100 scale-100 translate-x-0"
                    : "lg:opacity-0 lg:scale-95 lg:-translate-x-2 lg:w-0 lg:overflow-hidden"
                }`}
              >
                <span className={`font-semibold text-gray-900 group-hover:text-idean-blue transition-colors block whitespace-nowrap select-none ${
                  isMobile ? "text-sm sm:text-base" : "text-sm"
                }`}>
                  Add Business
                </span>
                <p className={`text-gray-500 group-hover:text-blue-500 transition-colors whitespace-nowrap select-none ${
                  isMobile ? "text-xs sm:text-sm" : "text-xs"
                }`}>
                  Set up your business profile
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Scrollable Navigation Content */}
        <div
          className={`flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent transform-gpu ${
            isExpanded ? "lg:overflow-y-auto" : "lg:overflow-y-hidden hover:lg:overflow-y-auto"
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollBehavior: 'smooth'
          }}
        >
          <nav className="space-y-1 p-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isDisabled = isOnboarding && item.href !== '/dashboard/onboarding';

              return (
                <Link
                  key={item.href}
                  href={isDisabled ? '#' : item.href}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    }
                  }}
                  className={`relative flex items-center transition-all duration-200 ease-out group touch-manipulation p-2 transform-gpu ${
                    isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                  }`}
                  title={!isExpanded && !isMobile ? item.label : undefined}
                  tabIndex={isDisabled ? -1 : 0}
                  aria-disabled={isDisabled}
                >
                  {/* Expandable Background */}
                  <div
                    className={`absolute inset-0 rounded-2xl lg:rounded-lg transition-all duration-200 ease-out ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 shadow-lg lg:shadow-sm"
                        : "hover:bg-gray-50 hover:shadow-md lg:hover:shadow-none"
                    } ${
                      isMobile || isExpanded
                        ? "opacity-100 scale-100"
                        : "lg:opacity-0 lg:scale-95 lg:w-12 lg:h-12"
                    }`}
                  />

                  {/* Fixed Icon Container - Always Same Position */}
                  <div className="relative z-20 flex-shrink-0 flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10 touch-manipulation">
                    <Icon
                      className={`w-6 h-6 lg:w-5 lg:h-5 transition-colors duration-200 ${isActive ? "text-blue-600" : "text-gray-700"}`}
                    />
                  </div>

                  {/* Text Content */}
                  <div
                    className={`relative z-10 ml-3 flex items-center justify-between flex-1 transition-all duration-200 ease-out ${
                      isMobile || isExpanded
                        ? "opacity-100 scale-100 translate-x-0 w-auto"
                        : "lg:opacity-0 lg:scale-95 lg:-translate-x-2 lg:w-0 lg:overflow-hidden"
                    }`}
                  >
                    <span className={`whitespace-nowrap font-semibold lg:font-medium select-none ${
                      isMobile ? "text-sm sm:text-base" : "text-sm"
                    } ${isActive ? "text-idean-navy" : "text-gray-700"} transition-colors duration-200`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold lg:font-medium flex-shrink-0 transition-colors duration-200 select-none ${
                          isMobile ? "px-2 py-1 sm:px-3 sm:py-1.5" : "px-2 py-1"
                        } ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Fixed Bottom Section - ChatGPT Style */}
        <div className="flex-shrink-0 border-t border-gray-200 p-2">
          {/* Upgrade Button - ChatGPT Style */}
          <button
            onClick={() => !isOnboarding && setShowUpgradeModal(true)}
            disabled={isOnboarding}
            className={`w-full flex items-center justify-between rounded-lg bg-gray-800/5 hover:bg-gray-800/10 transition-all duration-200 group mb-1 ${
              isOnboarding ? 'opacity-40 cursor-not-allowed' : ''
            } ${isMobile || isExpanded ? 'p-2.5' : 'lg:p-2 lg:justify-center'}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                <Crown className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={`font-medium text-gray-900 text-sm transition-all duration-200 ${
                isMobile || isExpanded ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
              }`}>
                Upgrade your plan
              </span>
            </div>
            <div className={`transition-all duration-200 ${
              isMobile || isExpanded ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
            }`}>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* User Profile - ChatGPT Style */}
          <div className="relative">
            <button
              onClick={() => !isOnboarding && setShowAccountMenu(!showAccountMenu)}
              disabled={isOnboarding}
              className={`w-full flex items-center rounded-lg hover:bg-gray-800/5 transition-all duration-200 group ${
                isOnboarding ? 'opacity-40 cursor-not-allowed' : ''
              } ${isMobile || isExpanded ? 'gap-2.5 p-2.5' : 'lg:p-2 lg:justify-center'}`}
            >
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className={`flex-1 text-left transition-all duration-200 ${
                isMobile || isExpanded ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
              }`}>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || user?.email?.split('@')[0] || 'Account'}
                </p>
                <p className="text-xs text-gray-500">
                  Free
                </p>
              </div>
            </button>

            {/* Account Menu Dropdown */}
            {showAccountMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowAccountMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => !isOnboarding && setShowHelpModal(true)}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help & Guide
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
            )}
          </div>
        </div>

      </aside>

      {/* Help Modal - Rendered outside sidebar for full-screen coverage */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Upgrade Modal - Rendered outside sidebar for full-screen coverage */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
      />
    </>
  );
}
