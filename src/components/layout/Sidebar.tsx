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
} from "lucide-react";
import UpgradeModal from "@/components/modals/UpgradeModal";

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
  const [currentPlan, setCurrentPlan] = useState("free");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to mobile for better mobile UX
  const prevPathnameRef = useRef(pathname);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
  }, [pathname]);

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
          className={`fixed inset-0 bg-black z-[60] lg:hidden transition-all duration-300 ease-out ${
            isOpen
              ? "opacity-50 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={onToggle}
        />
      )}

      {/* Enhanced Sidebar with Smooth Animations and Performance Optimization */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-[70] flex flex-col
          transition-all duration-300 ease-out will-change-transform
          lg:relative lg:z-auto lg:transition-all lg:duration-200 lg:ease-out
          ${isMobile
            ? `w-80 lg:w-72 ${isOpen ? "translate-x-0" : "-translate-x-full"} shadow-2xl lg:shadow-none`
            : `${isExpanded ? "w-72" : "w-16"} translate-x-0`
          }
          ${className}
        `}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => {
          if (!isMobile) {
            setIsExpanded(false);
            setShowAccountMenu(false);
          }
        }}
      >
        {/* Mobile Header with Close Button */}
        <div className={`flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white transition-all duration-200 ${
          isMobile ? "p-5" : isExpanded ? "p-4" : "px-2 py-4"
        }`}>
          <div className={`flex items-center transition-all duration-200 ${
            isMobile ? "gap-3" : isExpanded ? "gap-2" : "gap-0 justify-center"
          }`}>
            {/* Close Button (Mobile Only) */}
            <button
              onClick={onToggle}
              className="lg:hidden p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 touch-manipulation shadow-md"
              aria-label="Close menu"
              type="button"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg lg:shadow-sm transition-all duration-200 ${
              isMobile ? "w-10 h-10" : isExpanded ? "w-8 h-8" : "w-8 h-8"
            }`}>
              <div className={`bg-white rounded-md flex items-center justify-center ${
                isMobile ? "w-5 h-5" : "w-4 h-4"
              }`}>
                <div className={`bg-idean-navy rounded-full ${
                  isMobile ? "w-2.5 h-2.5" : "w-2 h-2"
                }`}></div>
              </div>
            </div>

            {/* Enhanced title with smooth transitions */}
            <div
              className={`flex flex-col flex-1 min-w-0 transition-all duration-200 ease-out ${
                isMobile || isExpanded
                  ? "opacity-100 scale-100 translate-x-0"
                  : "lg:opacity-0 lg:scale-95 lg:-translate-x-2 lg:w-0 lg:overflow-hidden"
              }`}
            >
              <span className={`font-bold text-gray-900 truncate whitespace-nowrap ${
                isMobile ? "text-xl" : "text-lg"
              }`}>
                iDEAN AI
              </span>
              <span className="text-xs text-gray-500 lg:hidden">
                Business Strategy AI
              </span>
            </div>
          </div>
        </div>

        {/* Business Section - Smart Business Display */}
        <div className={`flex-shrink-0 border-b border-gray-100 bg-gradient-to-r from-gray-25 to-white transition-all duration-200 ${
          isMobile ? "p-4" : isExpanded ? "p-3" : "px-2 py-3"
        }`}>
          {user?.business?.business_name || user?.businessId ? (
            // User has a business - show business info
            <div className={`relative flex items-center transition-colors ${
              isMobile ? "p-2" : "p-1"
            }`}>
              {/* Expandable Background */}
              <div
                className={`absolute inset-0 hover:bg-gray-50 rounded-xl transition-all duration-200 ease-out ${
                  isMobile || isExpanded
                    ? "opacity-100 scale-100"
                    : "lg:opacity-0 lg:scale-95 lg:w-10 lg:h-10"
                }`}
              />

              {/* Fixed Icon Container - Always Visible */}
              <div className={`relative z-20 flex-shrink-0 flex items-center justify-center ${
                isMobile ? "w-12 h-12" : "w-10 h-10"
              }`}>
                <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg lg:shadow-sm ${
                  isMobile ? "w-10 h-10" : "w-8 h-8"
                }`}>
                  <div className={`bg-white rounded-md flex items-center justify-center ${
                    isMobile ? "w-5 h-5" : "w-4 h-4"
                  }`}>
                    <div className={`bg-idean-navy rounded-full ${
                      isMobile ? "w-2.5 h-2.5" : "w-2 h-2"
                    }`}></div>
                  </div>
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
                <span className={`font-semibold text-gray-900 truncate block whitespace-nowrap ${
                  isMobile ? "text-base" : "text-sm"
                }`}>
                  {user.business?.business_name || "My Business"}
                </span>
                <p className={`text-gray-500 truncate whitespace-nowrap ${
                  isMobile ? "text-sm" : "text-xs"
                }`}>
                  {user.business?.industry_tag || "Business"}
                </p>
              </div>
            </div>
          ) : (
            // User doesn't have a business - show add business prompt
            <Link
              href="/dashboard/onboarding"
              className={`relative flex items-center transition-all duration-300 group ${
                isMobile ? "p-2" : "p-1"
              }`}
            >
              {/* Expandable Background */}
              <div
                className={`absolute inset-0 hover:bg-gray-50 rounded-xl transition-all duration-200 ease-out ${
                  isMobile || isExpanded
                    ? "opacity-100 scale-100"
                    : "lg:opacity-0 lg:scale-95 lg:w-10 lg:h-10"
                }`}
              />

              {/* Fixed Icon Container - Always Visible */}
              <div className={`relative z-20 flex-shrink-0 flex items-center justify-center ${
                isMobile ? "w-12 h-12" : "w-10 h-10"
              }`}>
                <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg lg:shadow-sm group-hover:shadow-xl lg:group-hover:shadow-md transition-shadow ${
                  isMobile ? "w-10 h-10" : "w-8 h-8"
                }`}>
                  <div className={`bg-white rounded-md flex items-center justify-center ${
                    isMobile ? "w-5 h-5" : "w-4 h-4"
                  }`}>
                    <div className={`bg-idean-navy rounded-full ${
                      isMobile ? "w-2.5 h-2.5" : "w-2 h-2"
                    }`}></div>
                  </div>
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
                <span className={`font-semibold text-gray-900 group-hover:text-orange-600 transition-colors block whitespace-nowrap ${
                  isMobile ? "text-base" : "text-sm"
                }`}>
                  Add Business
                </span>
                <p className={`text-gray-500 group-hover:text-orange-500 transition-colors whitespace-nowrap ${
                  isMobile ? "text-sm" : "text-xs"
                }`}>
                  Set up your business profile
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Scrollable Navigation Content */}
        <div
          className={`flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${
            isExpanded ? "lg:overflow-y-auto" : "lg:overflow-y-hidden"
          }`}
        >
          <nav className={`space-y-2 lg:space-y-1 transition-all duration-200 ${
            isMobile ? "p-4" : isExpanded ? "p-3" : "p-2"
          }`}>
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center transition-all duration-300 group touch-manipulation ${
                    isMobile
                      ? "p-3 min-h-[60px]"
                      : "p-2"
                  }`}
                  title={!isExpanded && !isMobile ? item.label : undefined}
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
                        : "lg:opacity-0 lg:scale-95 lg:w-10 lg:h-10"
                    }`}
                  />

                  {/* Fixed Icon Container - Always Visible */}
                  <div className={`relative z-20 flex-shrink-0 flex items-center justify-center ${
                    isMobile ? "w-12 h-12" : "w-10 h-10"
                  }`}>
                    <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg lg:shadow-sm ${
                      isMobile ? "w-10 h-10" : "w-8 h-8"
                    }`}>
                      <div className={`bg-white rounded-md flex items-center justify-center ${
                        isMobile ? "w-5 h-5" : "w-4 h-4"
                      }`}>
                        <div className={`${isActive ? "bg-blue-600" : "bg-idean-navy"} rounded-full ${
                          isMobile ? "w-2.5 h-2.5" : "w-2 h-2"
                        }`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div
                    className={`relative z-10 ml-3 flex items-center justify-between flex-1 transition-all duration-200 ease-out ${
                      isMobile || isExpanded
                        ? "opacity-100 scale-100 translate-x-0 w-auto"
                        : "lg:opacity-0 lg:scale-95 lg:-translate-x-2 lg:w-0 lg:overflow-hidden"
                    }`}
                  >
                    <span className={`whitespace-nowrap font-semibold lg:font-medium ${
                      isMobile ? "text-base" : "text-sm"
                    } ${isActive ? "text-idean-navy" : "text-gray-700"}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold lg:font-medium flex-shrink-0 transition-colors duration-200 ${
                          isMobile ? "px-3 py-1.5" : "px-2 py-1"
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

        {/* Fixed Bottom Section */}
        <div className={`flex-shrink-0 border-t border-gray-100 bg-gray-50/50 transition-all duration-200 ${
          isMobile ? "p-4 space-y-3" : isExpanded ? "p-3 space-y-2" : "px-2 py-3 space-y-2"
        }`}>
          {/* Upgrade Button */}
          <button
            onClick={() => setShowUpgradeModal(true)}
            className={`relative flex items-center w-full transition-all duration-300 touch-manipulation ${
              isMobile
                ? "p-2"
                : "p-1"
            }`}
          >
            {/* Expandable Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl lg:rounded-lg transition-all duration-200 ease-out ${
                isMobile || isExpanded
                  ? "opacity-100 scale-100"
                  : "lg:opacity-0 lg:scale-95 lg:w-10 lg:h-10"
              }`}
            />

            {/* Fixed Icon Container - Always Visible */}
            <div className={`relative z-20 flex-shrink-0 flex items-center justify-center ${
              isMobile ? "w-12 h-12" : "w-10 h-10"
            }`}>
              <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg lg:shadow-sm ${
                isMobile ? "w-10 h-10" : "w-8 h-8"
              }`}>
                <div className={`bg-white rounded-md flex items-center justify-center ${
                  isMobile ? "w-5 h-5" : "w-4 h-4"
                }`}>
                  <div className={`bg-idean-navy rounded-full ${
                    isMobile ? "w-2.5 h-2.5" : "w-2 h-2"
                  }`}></div>
                </div>
              </div>
            </div>

            {/* Text Label */}
            <span
              className={`relative z-10 ml-3 font-semibold lg:font-medium text-amber-700 transition-all duration-200 ease-out ${
                isMobile || isExpanded
                  ? "opacity-100 scale-100 translate-x-0"
                  : "lg:opacity-0 lg:scale-95 lg:-translate-x-2 lg:w-0 lg:overflow-hidden"
              } ${isMobile ? "text-base" : "text-sm"}`}
            >
              Upgrade Plan
            </span>
          </button>

          {/* User Profile with Dropdown - Hidden on mobile since it's in header */}
          <div className="relative lg:block hidden">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className={`relative flex items-center w-full cursor-pointer transition-all duration-300 group ${
                isMobile ? "p-2" : "p-1"
              }`}
            >
              {/* Expandable Background */}
              <div
                className={`absolute inset-0 hover:bg-gray-50 rounded-lg transition-all duration-200 ease-out ${
                  isMobile || isExpanded
                    ? "opacity-100 scale-100"
                    : "lg:opacity-0 lg:scale-95 lg:w-10 lg:h-10"
                }`}
              />

              {/* Fixed Icon Container - Always Visible */}
              <div className={`relative z-20 flex-shrink-0 flex items-center justify-center ${
                isMobile ? "w-12 h-12" : "w-10 h-10"
              }`}>
                <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg lg:shadow-sm ${
                  isMobile ? "w-10 h-10" : "w-8 h-8"
                }`}>
                  <div className={`bg-white rounded-md flex items-center justify-center ${
                    isMobile ? "w-5 h-5" : "w-4 h-4"
                  }`}>
                    <div className={`bg-idean-navy rounded-full ${
                      isMobile ? "w-2.5 h-2.5" : "w-2 h-2"
                    }`}></div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div
                className={`relative z-10 ml-3 flex items-center justify-between flex-1 min-w-0 transition-all duration-200 ease-out ${
                  isMobile || isExpanded
                    ? "opacity-100 scale-100 translate-x-0 w-auto"
                    : "lg:opacity-0 lg:scale-95 lg:-translate-x-2 lg:w-0 lg:overflow-hidden"
                }`}
              >
                <p className="text-sm font-medium text-gray-900 truncate whitespace-nowrap">
                  Account
                </p>
              </div>
            </button>

            {/* Enhanced Account Menu Dropdown with Animation */}
            {showAccountMenu && (
              <div
                className={`absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-xl lg:rounded-lg shadow-xl lg:shadow-lg z-20 py-2 lg:py-1 min-w-52 lg:min-w-48
                  animate-in slide-in-from-bottom-2 fade-in duration-200
                  ${isExpanded ? "lg:right-0" : "lg:left-12"}
                `}
              >
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-3 lg:px-3 lg:py-2 text-base lg:text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap rounded-lg lg:rounded-none mx-1 lg:mx-0"
                  onClick={() => setShowAccountMenu(false)}
                >
                  <Settings className="w-5 h-5 lg:w-4 lg:h-4" />
                  Settings
                </Link>
                <hr className="my-2 lg:my-1 border-gray-100" />
                <button
                  className="flex items-center gap-3 w-full px-4 py-3 lg:px-3 lg:py-2 text-base lg:text-sm text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap rounded-lg lg:rounded-none mx-1 lg:mx-0"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 lg:w-4 lg:h-4" />
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
  );
}
