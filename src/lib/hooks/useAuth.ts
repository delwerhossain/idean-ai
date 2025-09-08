'use client'

import { useSession } from 'next-auth/react'
import { AuthSession } from '@/types/auth'

export function useAuth() {
  const { data: session, status } = useSession()

  const hasRole = (requiredRoles: string[]) => {
    if (!session?.user?.role) return false
    return requiredRoles.includes(session.user.role)
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
      
      // Member permissions
      contentGeneration: ['owner', 'admin', 'member'],
      uploadFiles: ['owner', 'admin', 'member'],
      viewAnalytics: ['owner', 'admin', 'member'],
      manageOwnContent: ['owner', 'admin', 'member'],
      
      // Viewer permissions (if needed for future expansion)
      readReports: ['owner', 'admin', 'member', 'viewer']
    }
    
    return hasRole(permissions[feature as keyof typeof permissions] || [])
  }

  const isOwner = () => session?.user?.role === 'owner'
  const isAdmin = () => session?.user?.role === 'admin' || session?.user?.role === 'owner'
  const isMember = () => !!session?.user?.role

  return {
    session: session as AuthSession | null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    hasRole,
    canAccess,
    isOwner,
    isAdmin,
    isMember,
  }
}