'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TEST_USERS, clearTestData, getCurrentTestUser, type TestUser } from '@/lib/test-users'
import { useAuth } from '@/contexts/AuthContext'
import { Users, LogOut, Database, RefreshCw, Minimize2, Maximize2 } from 'lucide-react'

export default function TestUserPanel() {
  const [currentUser, setCurrentUser] = useState<TestUser | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    setCurrentUser(getCurrentTestUser())
    // Only show in development
    setIsVisible(process.env.NODE_ENV === 'development')
  }, [])

  const handleQuickLogin = async (email: string, password: string) => {
    try {
      // Redirect to login page with pre-filled data
      const loginUrl = `/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      window.location.href = loginUrl
    } catch (error) {
      console.error('Quick login failed:', error)
    }
  }

  const { logout } = useAuth()

  const handleClearData = async () => {
    if (window.confirm('Clear all test data? This will log you out.')) {
      clearTestData()
      await logout()
      window.location.href = '/login'
    }
  }

  const handleRefreshUser = () => {
    setCurrentUser(getCurrentTestUser())
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`bg-gray-900 text-white transition-all duration-200 ${isMinimized ? 'p-2' : 'p-4 max-w-sm'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            {!isMinimized && <span className="text-sm font-medium">Test Users</span>}
          </div>
          <div className="flex items-center space-x-1">
            {!isMinimized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshUser}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {currentUser && (
              <div className="mb-3 p-2 bg-green-900/20 rounded border border-green-700/30">
                <div className="text-xs text-green-300">Currently logged in:</div>
                <div className="text-sm font-medium text-green-100">{currentUser.name}</div>
                <div className="text-xs text-green-300">{currentUser.email}</div>
                <div className="text-xs text-green-300">Role: {currentUser.role}</div>
              </div>
            )}

            <div className="space-y-2">
              {TEST_USERS.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-400 truncate">{user.email}</div>
                    <div className="text-xs text-gray-500">
                      {user.role} • {user.businessName}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickLogin(user.email, user.password)}
                    className="ml-2 h-7 px-2 text-xs bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    Login
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearData}
                className="flex-1 h-7 text-xs bg-red-900/20 border-red-700 text-red-300 hover:bg-red-800/30"
              >
                <Database className="w-3 h-3 mr-1" />
                Clear Data
              </Button>
              {currentUser && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await logout()
                    window.location.href = '/login'
                  }}
                  className="flex-1 h-7 text-xs bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Logout
                </Button>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-500 text-center">
              Development Mode Only
            </div>
          </>
        )}
        
        {isMinimized && currentUser && (
          <div className="text-xs text-green-300 mt-1">
            {currentUser.name.split(' ')[0]}
          </div>
        )}
      </Card>
    </div>
  )
}