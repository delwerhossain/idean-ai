'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getStoredBackendToken, getCurrentFirebaseUser } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCcw, LogIn, LogOut, Copy } from 'lucide-react'

export default function AuthDebugPage() {
  const { user, firebaseUser, loading, signInWithGoogle, logout } = useAuth()
  const [backendTest, setBackendTest] = useState<any>(null)
  const [isTestingBackend, setIsTestingBackend] = useState(false)

  const testBackendConnection = async () => {
    setIsTestingBackend(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      // Test 1: Health check (no auth required)
      const healthResponse = await fetch(`${backendUrl}/health`)
      const healthData = await healthResponse.json()
      
      let backendAuthTest = null
      
      // Test 2: Try backend authentication if we have a user
      if (user && getStoredBackendToken()) {
        try {
          const authResponse = await fetch(`${backendUrl}/api/v1/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${getStoredBackendToken()}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (authResponse.ok) {
            backendAuthTest = await authResponse.json()
          } else {
            backendAuthTest = { error: `Auth failed: ${authResponse.status}` }
          }
        } catch (error) {
          backendAuthTest = { error: `Auth error: ${error}` }
        }
      } else {
        backendAuthTest = { error: 'No backend token available' }
      }
      
      setBackendTest({
        health: healthData,
        auth: backendAuthTest,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setBackendTest({
        error: `Connection failed: ${error}`,
        timestamp: new Date().toISOString()
      })
    }
    setIsTestingBackend(false)
  }

  const forceSessionUpdate = async () => {
    try {
      // Firebase Auth doesn't need session updates like NextAuth
      // Force a re-render by updating the backend test
      await testBackendConnection()
      console.log('Firebase auth state refreshed')
    } catch (error) {
      console.error('Auth refresh failed:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Authentication Debug
        </h1>
        <p className="text-gray-600">
          Debug Firebase authentication and backend token integration
        </p>
      </div>

      {/* Session Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Firebase Auth Status
            <Badge className={
              user ? 'bg-green-100 text-green-800' :
              loading ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {loading ? 'loading' : user ? 'authenticated' : 'unauthenticated'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {!user ? (
              <Button onClick={signInWithGoogle}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            ) : (
              <>
                <Button onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                <Button onClick={forceSessionUpdate} variant="outline">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Update Session
                </Button>
              </>
            )}
          </div>
          
          {user && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">User Info:</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div>Email: {user?.email}</div>
                  <div>Name: {user?.name}</div>
                  <div>Role: {user?.role}</div>
                  <div>Business ID: {user?.businessId || 'None'}</div>
                  <div>Provider: {user?.provider}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">Backend Token:</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {getStoredBackendToken() ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓ Present</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(getStoredBackendToken())}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-red-600">✗ Missing</span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">Full User Data:</h3>
                <details className="bg-gray-50 rounded">
                  <summary className="p-3 cursor-pointer text-sm">Show Raw User Data</summary>
                  <pre className="p-3 text-xs overflow-x-auto">
                    {JSON.stringify({ user, firebaseUser }, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backend Connection Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Backend Connection Test
            <Button 
              onClick={testBackendConnection}
              disabled={isTestingBackend}
              size="sm"
            >
              {isTestingBackend ? 'Testing...' : 'Test Connection'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backendTest && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">Health Check:</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <pre>{JSON.stringify(backendTest.health, null, 2)}</pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">Authentication Test:</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <pre>{JSON.stringify(backendTest.auth, null, 2)}</pre>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Last tested: {backendTest.timestamp}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}
            </div>
            <div>
              <strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}
            </div>
            <div>
              <strong>NextAuth URL:</strong> {process.env.NEXTAUTH_URL || 'http://localhost:3001'}
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}