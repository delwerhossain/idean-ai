'use client'

import { useAuth as useFirebaseAuth } from '@/contexts/AuthContext'
import { AuthSession } from '@/types/auth'

export function useAuth() {
  const { user, loading, authLoading, isHydrated } = useFirebaseAuth()

  const hasRole = (requiredRoles: string[]) => {
    if (!user?.role) return false
    return requiredRoles.includes(user.role)
  }

  const canAccess = (feature: string) => {
    const permissions = {
      // Owner permissions
      billing: ['owner'],
      organizationSettings: ['owner'],
      userManagement: ['owner'],
      exportUsage: ['owner'],
      
      // Admin permissions  
      teamManagement: ['owner', 'admin'],
      templates: ['owner', 'admin'],
      integrations: ['owner', 'admin'],
      dataRetention: ['owner', 'admin'],
      
      // User permissions (regular users)
      contentGeneration: ['owner', 'admin', 'user'],
      uploadFiles: ['owner', 'admin', 'user'],
      viewAnalytics: ['owner', 'admin', 'user'],
      manageOwnContent: ['owner', 'admin', 'user'],
      
      // Basic dashboard access
      dashboardAccess: ['owner', 'admin', 'user'],
      
      // Viewer permissions (if needed for future expansion)
      readReports: ['owner', 'admin', 'user', 'viewer']
    }
    
    return hasRole(permissions[feature as keyof typeof permissions] || [])
  }

  const isOwner = () => user?.role === 'owner'
  const isAdmin = () => user?.role === 'admin' || user?.role === 'owner'
  const isUser = () => ['user', 'admin', 'owner'].includes(user?.role || '')
  const isMember = () => !!user?.role

  return {
    session: null, // For backward compatibility
    isLoading: authLoading || !isHydrated, // Wait for both auth state and hydration
    isAuthenticated: !!user && isHydrated,
    user: user,
    hasRole,
    canAccess,
    isOwner,
    isAdmin,
    isUser,
    isMember,
  }
}