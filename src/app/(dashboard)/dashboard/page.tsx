'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  FileText, 
  TrendingUp, 
  ArrowRight,
  Zap,
  Target,
  Building,
  AlertTriangle,
  Sparkles,
  Palette,
  PenTool,
  Star,
  Clock,
  CheckCircle2,
  Brain,
  Rocket,
  Globe,
  Crown,
  Activity,
  Eye,
  ChevronRight
} from 'lucide-react'
import { ideanApi } from '@/lib/api/idean-api'
import { Business } from '@/lib/api/idean-api'

interface DashboardData {
  business?: Business
  analytics: {
    totalTemplates: number
    totalDocuments: number
    totalGenerations: number
    recentActivity: { id: string; type: string; title: string; time: string }[]
    usage: {
      aiCredits: { used: number; total: number }
      storage: { used: number; total: number }
    }
    frameworks: {
      completed: number
      total: number
      recent: string[]
    }
    growth: {
      score: number
      trend: 'up' | 'down' | 'stable'
      recommendations: string[]
    }
  }
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      window.location.href = '/login'
      return
    }

    loadDashboardData()
  }, [user, authLoading])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📊 Loading dashboard data...')

      // Load user and analytics data from API
      const [userResponse, analyticsResponse] = await Promise.allSettled([
        ideanApi.user.getMe(),
        ideanApi.analytics.getDashboard()
      ])

      let business: Business | undefined

      // Handle business data from user API
      if (userResponse.status === 'fulfilled' && userResponse.value.business) {
        business = userResponse.value.business as any
        console.log('✅ Business data loaded:', business?.business_name)
      } else if (userResponse.status === 'rejected') {
        console.warn('⚠️ User data failed to load:', userResponse.reason?.message)

        // If user not found (404), redirect should be handled by layout
        if (userResponse.reason?.status === 404 || userResponse.reason?.status === 400) {
          console.log('📋 User not found, layout should handle redirect')
          return
        }
      } else if (userResponse.status === 'fulfilled' && !userResponse.value.business) {
        console.log('📋 User has no business, layout should handle redirect')
        return
      }

      let analytics: DashboardData['analytics'] = {
        totalTemplates: 0,
        totalDocuments: 0,
        totalGenerations: 0,
        recentActivity: [],
        usage: {
          aiCredits: { used: 150, total: 1000 },
          storage: { used: 250, total: 5000 }
        },
        frameworks: {
          completed: 3,
          total: 12,
          recent: ['Customer Value Journey', 'Brand DNA Foundation', 'NeuroCopywriting']
        },
        growth: {
          score: 72,
          trend: 'up',
          recommendations: [
            'Complete your Blue Ocean Strategy framework',
            'Upload business documents for better AI insights',
            'Set up your first marketing campaign'
          ]
        }
      }

      // Handle analytics data from API
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value) {
        analytics = { ...analytics, ...analyticsResponse.value as Record<string, unknown> }
        console.log('📈 Analytics data loaded')
      } else if (analyticsResponse.status === 'rejected') {
        console.warn('⚠️ Analytics data failed to load, using defaults:', analyticsResponse.reason?.message)
      }

      setDashboardData({ business, analytics })
      console.log('🎉 Dashboard data loaded successfully')

    } catch (err: unknown) {
      console.error('❌ Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get daily insights based on business data
  const getDailyInsight = () => {
    const insights = [
      {
        icon: Target,
        title: "Strategy Focus",
        message: "Your Customer Value Journey framework needs completion. Focus on mapping your customer touchpoints today.",
        action: "Complete Framework",
        href: "/dashboard/growth-copilot"
      },
      {
        icon: Palette,
        title: "Brand Consistency",
        message: "Your brand voice is 85% defined. Complete your brand messaging framework for stronger market positioning.",
        action: "Refine Brand",
        href: "/dashboard/branding-lab"
      },
      {
        icon: PenTool,
        title: "Content Creation", 
        message: "Generate engaging social media content using your NeuroCopywriting framework. 3 posts ready to create.",
        action: "Create Content",
        href: "/dashboard/copywriting"
      }
    ]
    
    return insights[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % insights.length]
  }

  // Show loading state with skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto animate-pulse">
        {/* Hero Section Skeleton */}
        <div className="bg-gray-200 rounded-2xl p-8 mb-8 h-48"></div>
        
        {/* Module Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-gray-200 rounded-xl h-48"></div>
          <div className="bg-gray-200 rounded-xl h-48"></div>
          <div className="bg-gray-200 rounded-xl h-48"></div>
        </div>
        
        {/* Quick Start and Analytics Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-xl h-32"></div>
          <div className="bg-gray-200 rounded-xl h-32"></div>
        </div>
        
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Loading your strategic command center...</span>
          </div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            Retry Loading
          </Button>
        </Card>
      </div>
    )
  }

  if (!dashboardData) return null

  const dailyInsight = getDailyInsight()
  const businessName = dashboardData.business?.business_name || 'Your Business'
  const industry = dashboardData.business?.industry_tag || 'General'
  const currentTime = new Date().getHours()
  const greeting = currentTime < 12 ? 'Good morning' : currentTime < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-3 space-y-4 max-w-7xl mx-auto">
      {/* Hero Section - Business Welcome */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-4 mb-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">Welcome to iDEAN AI: Your Growth Co-Pilot! 🚀</h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  Powering <span className="font-semibold text-blue-700">{businessName}</span>&apos;s strategic success
                </p>
              </div>
            </div>
            
            {/* Daily Strategic Insight */}
            <Card className="bg-white border-blue-200 mt-4 sm:mt-6">
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                  <dailyInsight.icon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{dailyInsight.title}</h3>
                  <span className="text-xs bg-gray-100 text-idean-navy px-2 py-1 rounded-full font-medium">Today&apos;s Focus</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{dailyInsight.message}</p>
                <Button
                  onClick={() => router.push(dailyInsight.href)}
                  className="bg-idean-navy text-idean-white hover:bg-idean-navy-dark text-sm w-full sm:w-auto"
                  size="sm"
                >
                  {dailyInsight.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-row lg:flex-col gap-4 sm:gap-6 lg:gap-4 lg:ml-8 w-full lg:w-auto">
            <div className="text-center flex-1 lg:flex-none">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{dashboardData.analytics.growth.score}</div>
              <div className="text-gray-500 text-xs sm:text-sm">Growth Score</div>
            </div>
            <div className="text-center flex-1 lg:flex-none">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardData.analytics.frameworks.completed}/{dashboardData.analytics.frameworks.total}</div>
              <div className="text-gray-500 text-xs sm:text-sm">Frameworks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Brand & Content Studio Card - Prominent */}
        <Card className="p-4 hover:shadow-xl transition-all duration-300 border-2 border-orange-300 hover:border-orange-400 group cursor-pointer md:col-span-2 lg:col-span-2 bg-gradient-to-br from-orange-50 to-amber-50"
              onClick={() => router.push('/dashboard/copywriting')}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full font-medium shadow-sm">Available Now</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Brand & Content Studio</h3>
          <p className="text-gray-700 text-sm mb-3 leading-relaxed">
            Create powerful brand content with AI-powered copywriting, design frameworks, and marketing materials. Generate everything from social posts to complete campaigns.
          </p>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/50 rounded-lg p-2">
              <div className="text-base font-bold text-orange-600">12+</div>
              <div className="text-xs text-gray-600">Content Types</div>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <div className="text-base font-bold text-orange-600">AI-Powered</div>
              <div className="text-xs text-gray-600">Generation</div>
            </div>
          </div>

          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 text-sm">
            Start Creating Content
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* Coming Soon Cards */}
        <div className="space-y-3">
          {/* Growth Co-Pilot Card - Coming Soon */}
          <Card className="p-3 opacity-60 border-2 border-dashed border-gray-300 cursor-not-allowed">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">Coming Soon</span>
            </div>
            <h3 className="text-sm font-bold text-gray-600 mb-2">Growth Co-Pilot</h3>
            <p className="text-gray-500 text-xs mb-3 leading-relaxed">
              Strategic frameworks for business growth including Customer Value Journey and Blue Ocean Strategy
            </p>
            <Button className="w-full py-1 text-xs" variant="outline" disabled>
              Coming Soon
              <Clock className="w-3 h-3 ml-1" />
            </Button>
          </Card>

          {/* Branding Lab Card - Coming Soon */}
          <Card className="p-3 opacity-60 border-2 border-dashed border-gray-300 cursor-not-allowed">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-xl flex items-center justify-center">
                <Palette className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">Coming Soon</span>
            </div>
            <h3 className="text-sm font-bold text-gray-600 mb-2">Branding Lab</h3>
            <p className="text-gray-500 text-xs mb-3 leading-relaxed">
              Strategic brand frameworks including Brand Foundation and Voice & Messaging systems
            </p>
            <Button className="w-full py-1 text-xs" variant="outline" disabled>
              Coming Soon
              <Clock className="w-3 h-3 ml-1" />
            </Button>
          </Card>
        </div>
      </div>

      {/* Quick Start Wizard */}
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Start: Create powerful content today</h3>
            <p className="text-gray-600 text-sm">Jump into our Brand & Content Studio and start creating engaging content</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            variant={selectedQuickAction === 'content' ? 'default' : 'outline'}
            className="h-auto p-3 justify-start w-full bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
            onClick={() => {
              setSelectedQuickAction('content')
              setTimeout(() => router.push('/dashboard/copywriting'), 300)
            }}
          >
            <div className="flex items-center gap-3">
              <PenTool className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Brand & Content Studio</div>
                <div className="text-xs opacity-90">Copy, campaigns & content</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-3 justify-start w-full opacity-60 cursor-not-allowed"
            disabled
          >
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Business Strategy</div>
                <div className="text-xs opacity-80">Coming Soon</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-3 justify-start w-full opacity-60 cursor-not-allowed"
            disabled
          >
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Brand Identity</div>
                <div className="text-xs opacity-80">Coming Soon</div>
              </div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Business Health Dashboard & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Business Health Dashboard */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Business Health Score</h3>
          </div>
          
          {/* Growth Score Circle */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-200" fill="none" stroke="currentColor" strokeWidth="3"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-green-500" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${dashboardData.analytics.growth.score}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{dashboardData.analytics.growth.score}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Strategic Completeness</h4>
              <p className="text-sm text-gray-600 mb-2">Your business frameworks are {dashboardData.analytics.growth.score}% complete</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Trending Up</span>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Next Actions:</h4>
            {dashboardData.analytics.growth.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity & Templates */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/templates')}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {/* Recent Frameworks */}
          <div className="space-y-4">
            {dashboardData.analytics.frameworks.recent.map((framework, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-idean-navy rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{framework}</p>
                  <p className="text-xs text-gray-500">Completed {Math.floor(Math.random() * 7) + 1} days ago</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Templates Summary */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Saved Templates</span>
              <span className="font-medium">{dashboardData.analytics.totalTemplates}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">AI Generations</span>
              <span className="font-medium">{dashboardData.analytics.totalGenerations}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics & Usage Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              {dashboardData.analytics.usage.aiCredits.used}
            </span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1 text-sm">AI Credits Used</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-idean-navy h-2 rounded-full"
              style={{ width: `${(dashboardData.analytics.usage.aiCredits.used / dashboardData.analytics.usage.aiCredits.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600">of {dashboardData.analytics.usage.aiCredits.total} monthly</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{dashboardData.analytics.frameworks.completed}</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1 text-sm">Frameworks</h3>
          <p className="text-xs text-gray-600">Completed this month</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{dashboardData.analytics.totalDocuments}</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1 text-sm">Documents</h3>
          <p className="text-xs text-gray-600">In knowledge base</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-lg font-bold text-gray-900">{industry}</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1 text-sm">Industry</h3>
          <p className="text-xs text-gray-600">Business vertical</p>
        </Card>
      </div>
    </div>
  )
}