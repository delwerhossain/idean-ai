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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section - Business Welcome */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1 text-gray-900">{greeting}! 🚀</h1>
                <p className="text-gray-600 text-lg">
                  Welcome to <span className="font-semibold text-blue-700">{businessName}</span>&apos;s strategic command center
                </p>
              </div>
            </div>
            
            {/* Daily Strategic Insight */}
            <Card className="bg-white border-blue-200 mt-6">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <dailyInsight.icon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{dailyInsight.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Today&apos;s Focus</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{dailyInsight.message}</p>
                <Button 
                  onClick={() => router.push(dailyInsight.href)}
                  className="bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  size="sm"
                >
                  {dailyInsight.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex flex-col gap-4 ml-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{dashboardData.analytics.growth.score}</div>
              <div className="text-gray-500 text-sm">Growth Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{dashboardData.analytics.frameworks.completed}/{dashboardData.analytics.frameworks.total}</div>
              <div className="text-gray-500 text-sm">Frameworks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Three Core Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Growth Co-Pilot Card */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 group cursor-pointer"
              onClick={() => router.push('/dashboard/growth-copilot')}>
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Strategy DNA</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Growth Co-Pilot</h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            Strategic frameworks for business growth including Customer Value Journey, Blue Ocean Strategy, and Niche Fortune™
          </p>
          
          {/* Quick Stats */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Frameworks Available</span>
              <span className="font-medium">4 Active</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Completion Rate</span>
              <span className="font-medium text-green-600">75%</span>
            </div>
          </div>
          
          <Button className="w-full group-hover:bg-blue-600 group-hover:text-white" variant="outline">
            Start Strategic Planning
            <Rocket className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* Branding Lab Card */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 group cursor-pointer"
              onClick={() => router.push('/dashboard/branding-lab')}>
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">Brand DNA</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Branding Lab</h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            Strategic brand frameworks including Brand Foundation, NeuroBranding™, and Voice & Messaging systems
          </p>
          
          {/* Quick Stats */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Brand Elements</span>
              <span className="font-medium">3 Defined</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Brand Score</span>
              <span className="font-medium text-purple-600">85%</span>
            </div>
          </div>
          
          <Button className="w-full group-hover:bg-purple-600 group-hover:text-white" variant="outline">
            Build Your Brand
            <Crown className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* AI Copywriting Card */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-200 group cursor-pointer"
              onClick={() => router.push('/dashboard/copywriting')}>
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">Content DNA</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">AI Copywriting</h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            Content generation frameworks including NeuroCopywriting™, Nuclear Content™, and conversion-focused copy systems
          </p>
          
          {/* Quick Stats */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Copy Frameworks</span>
              <span className="font-medium">6 Ready</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Content Created</span>
              <span className="font-medium text-orange-600">24 Pieces</span>
            </div>
          </div>
          
          <Button className="w-full group-hover:bg-orange-600 group-hover:text-white" variant="outline">
            Generate Content
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>

      {/* Quick Start Wizard */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Quick Start: What do you want to create today?</h3>
            <p className="text-gray-600">Choose your goal and let iDEAN AI guide you through the perfect framework</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant={selectedQuickAction === 'strategy' ? 'default' : 'outline'}
            className="h-auto p-4 justify-start"
            onClick={() => {
              setSelectedQuickAction('strategy')
              setTimeout(() => router.push('/dashboard/growth-copilot'), 300)
            }}
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Business Strategy</div>
                <div className="text-xs opacity-80">Growth frameworks & planning</div>
              </div>
            </div>
          </Button>
          
          <Button 
            variant={selectedQuickAction === 'brand' ? 'default' : 'outline'}
            className="h-auto p-4 justify-start"
            onClick={() => {
              setSelectedQuickAction('brand')
              setTimeout(() => router.push('/dashboard/branding-lab'), 300)
            }}
          >
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Brand Identity</div>
                <div className="text-xs opacity-80">Brand positioning & voice</div>
              </div>
            </div>
          </Button>
          
          <Button 
            variant={selectedQuickAction === 'content' ? 'default' : 'outline'}
            className="h-auto p-4 justify-start"
            onClick={() => {
              setSelectedQuickAction('content')
              setTimeout(() => router.push('/dashboard/copywriting'), 300)
            }}
          >
            <div className="flex items-center gap-3">
              <PenTool className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Marketing Content</div>
                <div className="text-xs opacity-80">Copy, campaigns & content</div>
              </div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Business Health Dashboard & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Business Health Dashboard */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {dashboardData.analytics.usage.aiCredits.used}
            </span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">AI Credits Used</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${(dashboardData.analytics.usage.aiCredits.used / dashboardData.analytics.usage.aiCredits.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">of {dashboardData.analytics.usage.aiCredits.total} monthly</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{dashboardData.analytics.frameworks.completed}</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Frameworks</h3>
          <p className="text-sm text-gray-600">Completed this month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{dashboardData.analytics.totalDocuments}</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Documents</h3>
          <p className="text-sm text-gray-600">In knowledge base</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{industry}</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Industry</h3>
          <p className="text-sm text-gray-600">Business vertical</p>
        </Card>
      </div>
    </div>
  )
}