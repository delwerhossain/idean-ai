'use client'

import { signOut } from 'next-auth/react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LogOut, User, Building, Crown, Shield, Users } from 'lucide-react'

export function UserProfile() {
  const { user, isOwner, isAdmin } = useAuth()

  if (!user) return null

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />
      case 'admin': return <Shield className="w-4 h-4" />
      case 'member': return <Users className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'member': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Role</span>
            <Badge className={`${getRoleColor(user.role)} border`}>
              <span className="mr-1">{getRoleIcon(user.role)}</span>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Provider</span>
            <Badge variant="outline" className="capitalize">
              {user.provider || 'email'}
            </Badge>
          </div>

          {user.businessId && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Business</span>
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-1" />
                Business #{user.businessId.slice(-6)}
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Permissions:</span>
            </div>
            <div></div>
            
            {isOwner() && (
              <div className="col-span-2 text-purple-600">
                • Full access & billing control
              </div>
            )}
            
            {isAdmin() && !isOwner() && (
              <div className="col-span-2 text-blue-600">
                • Manage team & settings
              </div>
            )}
            
            <div className="col-span-2 text-green-600">
              • Generate & manage content
            </div>
          </div>
        </div>

        <Separator />

        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}