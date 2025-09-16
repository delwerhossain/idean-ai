'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getStoredBackendToken } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, RefreshCcw } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
  data?: unknown
  duration?: number
}

export default function TestBackendPage() {
  const { user } = useAuth()
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Health Check', status: 'pending' },
    { name: 'Authentication Status', status: 'pending' },
    { name: 'Session Verification', status: 'pending' },
    { name: 'User Data Fetch', status: 'pending' },
    { name: 'Business API Test', status: 'pending' }
  ])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ))
  }

  const runTests = async () => {
    setIsRunning(true)
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, message: undefined, data: undefined, duration: undefined })))

    // Test 1: Backend Health Check
    const start1 = Date.now()
    try {
      const health = await apiClient.healthCheck()
      updateTest(0, {
        status: 'success',
        message: `Backend is healthy (${health.environment})`,
        data: health,
        duration: Date.now() - start1
      })
    } catch (error: unknown) {
      updateTest(0, {
        status: 'error',
        message: error.message || 'Health check failed',
        duration: Date.now() - start1
      })
    }

    // Test 2: Authentication Status
    updateTest(1, {
      status: session?.user ? 'success' : 'error',
      message: user ? `Signed in as ${user.email}` : 'Not authenticated',
      data: user || null
    })

    // Test 3: Session Verification
    const start3 = Date.now()
    if (getStoredBackendToken()) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${session.backendToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          updateTest(2, {
            status: 'success',
            message: 'Backend token is valid',
            data: data,
            duration: Date.now() - start3
          })
        } else {
          updateTest(2, {
            status: 'error',
            message: `Token verification failed: ${response.status}`,
            duration: Date.now() - start3
          })
        }
      } catch (error: unknown) {
        updateTest(2, {
          status: 'error',
          message: error.message || 'Session verification failed',
          duration: Date.now() - start3
        })
      }
    } else {
      updateTest(2, {
        status: 'error',
        message: 'No backend token in session'
      })
    }

    // Test 4: User Data Fetch
    const start4 = Date.now()
    if (getStoredBackendToken()) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
          headers: {
            'Authorization': `Bearer ${session.backendToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          updateTest(3, {
            status: 'success',
            message: `User data fetched for ${userData.user?.email || 'unknown'}`,
            data: userData,
            duration: Date.now() - start4
          })
        } else {
          updateTest(3, {
            status: 'error',
            message: `User fetch failed: ${response.status}`,
            duration: Date.now() - start4
          })
        }
      } catch (error: unknown) {
        updateTest(3, {
          status: 'error',
          message: error.message || 'User data fetch failed',
          duration: Date.now() - start4
        })
      }
    } else {
      updateTest(3, {
        status: 'error',
        message: 'No backend token available'
      })
    }

    // Test 5: Business API Test
    const start5 = Date.now()
    if (getStoredBackendToken()) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/businesses`, {
          headers: {
            'Authorization': `Bearer ${session.backendToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const businessData = await response.json()
          updateTest(4, {
            status: 'success',
            message: `Business API accessible (${businessData.businesses?.length || 0} businesses found)`,
            data: businessData,
            duration: Date.now() - start5
          })
        } else {
          updateTest(4, {
            status: 'error',
            message: `Business API failed: ${response.status}`,
            duration: Date.now() - start5
          })
        }
      } catch (error: unknown) {
        updateTest(4, {
          status: 'error',
          message: error.message || 'Business API test failed',
          duration: Date.now() - start5
        })
      }
    } else {
      updateTest(4, {
        status: 'error',
        message: 'No backend token available'
      })
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const successCount = tests.filter(t => t.status === 'success').length
  const errorCount = tests.filter(t => t.status === 'error').length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Backend Integration Test
        </h1>
        <p className="text-gray-600">
          Test the connection between your frontend and the Express.js backend
        </p>
      </div>

      {/* Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-gray-500">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{tests.length}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
              <span>{isRunning ? 'Running Tests...' : 'Run Tests'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="space-y-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <span>{test.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {test.duration && (
                    <Badge variant="outline" className="text-xs">
                      {test.duration}ms
                    </Badge>
                  )}
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            {test.message && (
              <CardContent className="pt-0">
                <p className="text-gray-600">{test.message}</p>
                {test.data && (
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                      Show Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Environment Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </div>
            <div>
              <strong>API Timeout:</strong> {process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'}ms
            </div>
            <div>
              <strong>Session Status:</strong> {session ? 'Authenticated' : 'Not authenticated'}
            </div>
            <div>
              <strong>Backend Token:</strong> {getStoredBackendToken() ? 'Present' : 'Missing'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}