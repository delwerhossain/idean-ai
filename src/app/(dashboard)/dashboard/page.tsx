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
  Brain,
  Globe
} from 'lucide-react'
import { ideanApi } from '@/lib/api/idean-api'
import { Business } from '@/lib/api/idean-api'
import TutorialModal from '@/components/modals/TutorialModal'

interface DashboardData {
  business?: Business
  analytics: {
    credit: number
    creditLimit: number
    businessdocuments: number
    frameworks: number
  }
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null)
  const [showTutorialModal, setShowTutorialModal] = useState(false)

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

      // Default analytics data
      let analytics: DashboardData['analytics'] = {
        credit: 0,
        creditLimit: 40,
        businessdocuments: 0,
        frameworks: 0
      }

      // Handle analytics data from API
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value) {
        analytics = analyticsResponse.value
        console.log('📈 Analytics data loaded:', analytics)
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
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-idean-navy">Welcome to iDEAN AI: Your Growth Co-Pilot! 🚀</h1>
                <p className="text-idean-slate text-base sm:text-lg">
                  Powering <span className="font-semibold text-idean-blue">{businessName}</span>&apos;s strategic success
                </p>
              </div>
              <Button
                onClick={() => setShowTutorialModal(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 self-start sm:self-auto"
              >
                <span className="hidden sm:inline">Watch Tutorial</span>
                <span className="sm:hidden">Tutorial</span>
              </Button>
            </div>
            
            {/* Daily Strategic Insight - Commented Out */}
            {/* <Card className="bg-white border-blue-200 mt-4 sm:mt-6">
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
            </Card> */}
          </div>

          {/* Quick Stats - Commented Out */}
          {/* <div className="flex flex-row lg:flex-col gap-4 sm:gap-6 lg:gap-4 lg:ml-8 w-full lg:w-auto">
            <div className="text-center flex-1 lg:flex-none">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{dashboardData.analytics.growth.score}</div>
              <div className="text-gray-500 text-xs sm:text-sm">Growth Score</div>
            </div>
            <div className="text-center flex-1 lg:flex-none">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardData.analytics.frameworks.completed}/{dashboardData.analytics.frameworks.total}</div>
              <div className="text-gray-500 text-xs sm:text-sm">Frameworks</div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Core Module Cards - Reorganized Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Brand & Content Studio Card - Available Now */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-idean-blue hover:border-blue-600 group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50"
              onClick={() => router.push('/dashboard/copywriting')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-idean-navy rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border-2 border-gray-900">
              <PenTool className="w-8 h-8 text-white stroke-[2.5]" />
            </div>
            <span className="text-xs bg-idean-blue text-white px-3 py-1.5 rounded-full font-semibold shadow-md">Available Now</span>
          </div>
          <h3 className="text-xl font-bold text-idean-navy mb-3 group-hover:text-idean-blue transition-colors">Brand & Content Studio</h3>
          <p className="text-idean-slate text-sm mb-4 leading-relaxed">
            Create powerful brand content with AI-powered copywriting, design frameworks, and marketing materials. Generate everything from social posts to complete campaigns.
          </p>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
              <div className="text-lg font-bold text-idean-blue">12+</div>
              <div className="text-xs text-gray-600 font-medium">Content Types</div>
            </div>
            <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
              <div className="text-lg font-bold text-idean-blue">AI-Powered</div>
              <div className="text-xs text-gray-600 font-medium">Generation</div>
            </div>
          </div>

          <Button className="w-full bg-idean-blue hover:bg-blue-700 text-white font-semibold py-3 text-sm shadow-lg hover:shadow-xl transition-all">
            Start Creating Content
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* Coming Soon Cards - Compact Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {/* Growth Co-Pilot Card - Coming Soon */}
          <Card className="p-3 opacity-60 border-2 border-dashed border-gray-300 cursor-not-allowed">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gray-300 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">Coming Soon</span>
            </div>
            <h3 className="text-sm font-bold text-idean-slate mb-1">Business Strategy</h3>
            <p className="text-idean-blue-medium text-xs leading-relaxed">
              Strategic frameworks for business growth
            </p>
          </Card>

          {/* Branding Lab Card - Coming Soon */}
          <Card className="p-3 opacity-60 border-2 border-dashed border-gray-300 cursor-not-allowed">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gray-300 rounded-xl flex items-center justify-center">
                <Palette className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">Coming Soon</span>
            </div>
            <h3 className="text-sm font-bold text-idean-slate mb-1">Brand Identity</h3>
            <p className="text-idean-blue-medium text-xs leading-relaxed">
              Strategic brand frameworks and messaging
            </p>
          </Card>
        </div>
      </div>



      {/* Analytics & Usage Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Generation Credits Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              {dashboardData.analytics.credit}
            </span>
          </div>
          <h3 className="font-medium text-idean-navy mb-1 text-sm">Generation Credits</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(dashboardData.analytics.credit / dashboardData.analytics.creditLimit) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600">
            {dashboardData.analytics.credit} of {dashboardData.analytics.creditLimit} daily credits
          </p>
          <p className="text-xs text-gray-500 mt-1">Resets at 12 AM BDT</p>
        </Card>

        {/* Frameworks Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{dashboardData.analytics.frameworks}</span>
          </div>
          <h3 className="font-medium text-idean-navy mb-1 text-sm">Frameworks</h3>
          <p className="text-xs text-gray-600">Content frameworks used</p>
        </Card>

        {/* Business Documents Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{dashboardData.analytics.businessdocuments}</span>
          </div>
          <h3 className="font-medium text-idean-navy mb-1 text-sm">Documents</h3>
          <p className="text-xs text-gray-600">In knowledge base</p>
        </Card>

        {/* Industry Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-idean-blue" />
            </div>
            <span className="text-lg font-bold text-gray-900">{industry}</span>
          </div>
          <h3 className="font-medium text-idean-navy mb-1 text-sm">Industry</h3>
          <p className="text-xs text-gray-600">Business vertical</p>
        </Card>
      </div>

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        title="Welcome to iDEAN AI Dashboard"
        subtitle="Your AI-powered business strategy command center"
        icon={<Brain className="w-8 h-8" />}
        steps={[
          {
            title: 'Explore Available Tools',
            description: 'Access Brand & Content Studio to create compelling marketing copy and brand materials using proven frameworks.'
          },
          {
            title: 'Set Up Your Business Profile',
            description: 'Update your Business Knowledge with company information and documents to personalize AI-generated content.'
          },
          {
            title: 'Generate Strategic Content',
            description: 'Choose a framework, fill in your details, and let AI create professional content tailored to your business needs.'
          },
          {
            title: 'Save and Reuse Templates',
            description: 'Build your template library by saving successful content as templates for faster creation in the future.'
          }
        ]}
        ctaText="Got it, Let's Get Started!"
      />
    </div>
  )
}