'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign,
  Plus,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  Building,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import { ideanApi } from '@/lib/api/idean-api'
import { Business } from '@/lib/api/idean-api'

interface DashboardData {
  business?: Business
  analytics: {
    totalTemplates: number
    totalDocuments: number
    totalGenerations: number
    recentActivity: any[]
    usage: {
      aiCredits: { used: number; total: number }
      storage: { used: number; total: number }
    }
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      window.location.href = '/login'
      return
    }

    loadDashboardData()
  }, [session, status])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load user's business and analytics data in parallel
      const [businessResponse, analyticsResponse] = await Promise.allSettled([
        ideanApi.business.getMine(),
        ideanApi.analytics.getDashboard()
      ])

      let business: Business | undefined
      let analytics: DashboardData['analytics'] = {
        totalTemplates: 0,
        totalDocuments: 0,
        totalGenerations: 0,
        recentActivity: [],
        usage: {
          aiCredits: { used: 0, total: 1000 },
          storage: { used: 0, total: 5000 }
        }
      }

      // Handle business data
      if (businessResponse.status === 'fulfilled' && businessResponse.value.data) {
        business = businessResponse.value.data
      }

      // Handle analytics data
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.data) {
        analytics = analyticsResponse.value.data
      }

      setDashboardData({ business, analytics })
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  // Redirect to onboarding if no business data
  if (!dashboardData?.business && session?.user) {
    window.location.href = '/dashboard/onboarding'
    return null
  }

  const business = dashboardData!.business!
  const analytics = dashboardData!.analytics

  const quickStats = [
    { 
      icon: FileText, 
      label: 'Templates', 
      value: analytics.totalTemplates.toString(), 
      change: 'Available frameworks', 
      color: 'bg-blue-500' 
    },
    { 
      icon: Sparkles, 
      label: 'AI Credits', 
      value: `${analytics.usage.aiCredits.total - analytics.usage.aiCredits.used}`, 
      change: `${analytics.usage.aiCredits.used}/${analytics.usage.aiCredits.total} used`, 
      color: 'bg-green-500' 
    },
    { 
      icon: Target, 
      label: 'Documents', 
      value: analytics.totalDocuments.toString(), 
      change: 'Knowledge base items', 
      color: 'bg-purple-500' 
    },
    { 
      icon: TrendingUp, 
      label: 'Generations', 
      value: analytics.totalGenerations.toString(), 
      change: 'AI content created', 
      color: 'bg-orange-500' 
    },
  ]



  return (
      <div className="p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session?.user?.name || 'there'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here&apos;s what&apos;s happening with <strong>{business.business_name}</strong> today.
              </p>
              {!session?.backendToken && (
                <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md inline-block">
                  ⚡ Demo mode - Connect backend for full functionality
                </div>
              )}
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/dashboard/templates'}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          {/* Business Info Card */}
          <Card className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{business.business_name}</h3>
                  <p className="text-sm text-gray-600">{business.industry_tag}</p>
                  <p className="text-sm text-blue-600">{business.website_url}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    business.module_select === 'pro' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {business.module_select.toUpperCase()}
                  </span>
                  <span>•</span>
                  <span>{business.language}</span>
                </div>
              </div>
            </div>
            {business.business_context && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {business.business_context}
              </p>
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 text-left"
                onClick={() => window.location.href = '/dashboard/growth-copilot'}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Growth Co-Pilot</p>
                    <p className="text-sm text-gray-500">Strategy & execution frameworks</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 text-left"
                onClick={() => window.location.href = '/dashboard/branding-lab'}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Branding Lab</p>
                    <p className="text-sm text-gray-500">Brand strategy & messaging</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 text-left"
                onClick={() => window.location.href = '/dashboard/copywriting'}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">AI Copywriting</p>
                    <p className="text-sm text-gray-500">Content & campaign generation</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 text-left"
                onClick={() => window.location.href = '/dashboard/templates'}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Templates</p>
                    <p className="text-sm text-gray-500">Reusable frameworks & workflows</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">No recent activity</p>
                  <p className="text-xs text-gray-400">
                    Start by creating your first template or using a framework
                  </p>
                </div>
              )}
            </div>
            
            {/* AI Usage Progress */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">AI Credits</span>
                <span className="text-sm text-gray-500">
                  {analytics.usage.aiCredits.used} / {analytics.usage.aiCredits.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${Math.min((analytics.usage.aiCredits.used / analytics.usage.aiCredits.total) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.usage.aiCredits.total - analytics.usage.aiCredits.used} credits remaining
              </p>
            </div>
          </Card>
        </div>
      </div>
  )
}