'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  Building
} from 'lucide-react'

interface BusinessInfo {
  userName: string
  businessName: string
  industry: string
  website: string
  businessContext: string
}

export default function DashboardPage() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    userName: '',
    businessName: '',
    industry: '',
    website: '',
    businessContext: ''
  })

  useEffect(() => {
    // Check if user has completed onboarding
    if (typeof window !== 'undefined') {
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')
      
      if (!hasCompletedOnboarding) {
        window.location.href = '/dashboard/onboarding'
        return
      }

      // Load business information from localStorage
      const userName = localStorage.getItem('userName') || ''
      const businessName = localStorage.getItem('businessName') || 'Your Business'
      const industry = localStorage.getItem('industry') || ''
      const website = localStorage.getItem('website') || ''
      const businessContext = localStorage.getItem('businessContext') || ''

      setBusinessInfo({
        userName,
        businessName,
        industry,
        website,
        businessContext
      })
    }
  }, [])

  const quickStats = [
    { icon: FileText, label: 'Active Plans', value: '3', change: '+2 this week', color: 'bg-blue-500' },
    { icon: TrendingUp, label: 'Growth Score', value: '85%', change: '+5% this month', color: 'bg-green-500' },
    { icon: Users, label: 'Team Members', value: '1', change: 'Just you for now', color: 'bg-purple-500' },
    { icon: DollarSign, label: 'Revenue Goal', value: '$0', change: 'Set your target', color: 'bg-orange-500' },
  ]

  const recentActivities = [
    { action: 'Created business plan draft', time: '2 hours ago', type: 'plan' },
    { action: 'Updated market research', time: '1 day ago', type: 'research' },
    { action: 'Completed onboarding', time: '2 days ago', type: 'setup' },
  ]


  const handleNewCompany = () => {
    // Clear current onboarding data for new company setup
    localStorage.removeItem('onboardingData')
    localStorage.removeItem('userName')
    localStorage.removeItem('businessName')
    localStorage.removeItem('industry')
    localStorage.removeItem('website')
    localStorage.removeItem('businessContext')
    localStorage.removeItem('hasCompletedOnboarding')
    // Redirect to onboarding route instead of showing modal
    window.location.href = '/dashboard/onboarding'
  }

  return (
    <>
      <DashboardLayout onNewCompany={handleNewCompany}>
      <div className="p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {businessInfo.userName || 'there'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here&apos;s what&apos;s happening with <strong>{businessInfo.businessName}</strong> today.
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Business Info Card */}
          {businessInfo.industry && (
            <Card className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{businessInfo.businessName}</h3>
                  <p className="text-sm text-gray-600">{businessInfo.industry}</p>
                  {businessInfo.website && (
                    <p className="text-sm text-blue-600">{businessInfo.website}</p>
                  )}
                </div>
              </div>
            </Card>
          )}
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
                onClick={() => window.location.href = '/blueprints'}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Blueprint Builder</p>
                    <p className="text-sm text-gray-500">Create strategy frameworks</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 text-left"
                onClick={() => window.location.href = '/campaigns'}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Generate Campaign</p>
                    <p className="text-sm text-gray-500">Create marketing campaigns</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 text-left"
                onClick={() => window.location.href = '/audit'}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Growth Audit</p>
                    <p className="text-sm text-gray-500">Assess your business growth</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 text-left"
                onClick={() => window.location.href = '/copilot'}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">AI Co-Pilot</p>
                    <p className="text-sm text-gray-500">Get AI-powered assistance</p>
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
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      </DashboardLayout>
      
    </>
  )
}