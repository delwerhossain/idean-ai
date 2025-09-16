'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PenTool, 
  Facebook, 
  Instagram, 
  Zap, 
  ChevronRight, 
  Sparkles,
  Target,
  MessageSquare,
  Copy,
  Download,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  TrendingUp
} from 'lucide-react'
import { ideanApi } from '@/lib/api/idean-api'
import FacebookAdCreator from './FacebookAdCreator'
import SocialMediaPostCreator from './SocialMediaPostCreator'
import GenerationHistory from './GenerationHistory'

interface CopywritingWorkspaceProps {
  businessId?: string
}

export default function CopywritingWorkspace({ businessId }: CopywritingWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('facebook-ads')
  const [copywritingTemplates, setCopywritingTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState({ used: 0, total: 1000 })

  useEffect(() => {
    loadCopywritingTemplates()
    loadUsageStats()
  }, [])

  const loadCopywritingTemplates = async () => {
    try {
      const response = await ideanApi.templates.getByCategory('copywriting')
      setCopywritingTemplates(response.items || [])
    } catch (error) {
      console.error('Failed to load copywriting templates:', error)
    }
  }

  const loadUsageStats = async () => {
    try {
      const response = await ideanApi.analytics.getDashboard()
      setUsage(response.usage?.aiCredits || { used: 0, total: 1000 })
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyTypes = [
    {
      id: 'facebook-ads',
      title: 'Facebook Ad Copy',
      description: 'Create high-converting Facebook ad copy with hooks, body text, and CTAs',
      icon: Facebook,
      color: 'bg-blue-500',
      features: ['Hook Generation', 'Ad Creative Ideas', 'CTA Optimization', 'A/B Test Variants']
    },
    {
      id: 'social-media',
      title: 'Social Media Posts', 
      description: 'Generate engaging organic posts for Facebook, Instagram, and LinkedIn',
      icon: Instagram,
      color: 'bg-purple-500',
      features: ['Engaging Captions', 'Hashtag Strategy', 'Story Ideas', 'Multi-Platform']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Copywriting Studio</h1>
                  <p className="text-sm text-gray-500">AI-powered content creation with iDEAN frameworks</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Usage Counter */}
              <Card className="px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {usage.used.toLocaleString()} / {usage.total.toLocaleString()} credits
                  </span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min((usage.used / usage.total) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </Card>
              
              <Button variant="outline" className="border-purple-200 hover:bg-purple-50">
                <BookOpen className="w-4 h-4 mr-2" />
                Framework Guide
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' ? (
          /* Overview Page */
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Powered by iDEAN AI Frameworks</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Create Copy That Converts
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Generate high-performing ad copy and social content using proven frameworks from 
                iMarketing, GrowthX, and iMBA programs.
              </p>
            </div>

            {/* Copy Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {copyTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <Card 
                    key={type.id}
                    className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-200"
                    onClick={() => setActiveTab(type.id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-4 rounded-xl ${type.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {type.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{type.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-6">
                          {type.features.map((feature) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          Start Creating
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">12+</div>
                <div className="text-sm text-gray-600">Copy Templates</div>
              </Card>
              <Card className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">3-5x</div>
                <div className="text-sm text-gray-600">Better Engagement</div>
              </Card>
              <Card className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">47%</div>
                <div className="text-sm text-gray-600">Avg. Conversion Lift</div>
              </Card>
              <Card className="p-6 text-center">
                <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">10s</div>
                <div className="text-sm text-gray-600">Generation Time</div>
              </Card>
            </div>
          </div>
        ) : (
          /* Content Creation Interface */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-fit grid-cols-3 bg-gray-100/50 p-1 rounded-xl">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 rounded-lg"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="facebook-ads" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 rounded-lg"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook Ads
                </TabsTrigger>
                <TabsTrigger 
                  value="social-media" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 rounded-lg"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Social Posts
                </TabsTrigger>
              </TabsList>
              
              <Button variant="outline" onClick={() => setActiveTab('overview')}>
                ← Back to Overview
              </Button>
            </div>

            <TabsContent value="facebook-ads" className="space-y-6">
              <FacebookAdCreator 
                businessId={businessId} 
                templates={copywritingTemplates.filter(t => t.name?.toLowerCase().includes('facebook') || t.name?.toLowerCase().includes('ad'))}
              />
            </TabsContent>

            <TabsContent value="social-media" className="space-y-6">
              <SocialMediaPostCreator 
                businessId={businessId}
                templates={copywritingTemplates.filter(t => t.name?.toLowerCase().includes('social') || t.name?.toLowerCase().includes('post'))}
              />
            </TabsContent>
          </Tabs>
        )}
        
        {/* Generation History */}
        {activeTab !== 'overview' && (
          <div className="mt-12">
            <GenerationHistory />
          </div>
        )}
      </div>
    </div>
  )
}