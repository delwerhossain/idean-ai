'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  TrendingUp, 
  Plus, 
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  BarChart3,
  BookOpen,
  Users,
  AlertTriangle
} from 'lucide-react'
import { ideanApi, GrowthCopilot } from '@/lib/api/idean-api'

export default function GrowthCopilotPage() {
  const { user } = useAuth()
  const [growthCopilots, setGrowthCopilots] = useState<GrowthCopilot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCopilot, setSelectedCopilot] = useState<GrowthCopilot | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded && !loading) {
      loadGrowthCopilots()
    }
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      setLoading(false)
    }
  }, [hasLoaded, loading])

  const loadGrowthCopilots = async () => {
    if (loading || hasLoaded) return // Prevent multiple calls
    
    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with actual API call when backend is ready
      // const response = await ideanApi.growthCopilot.getAll({
      //   limit: 50,
      //   search: searchTerm
      // })

      // Mock data for now - will be replaced with real API
      const mockGrowthCopilots: any[] = [
        {
          id: '1',
          title: 'Customer Value Journey',
          description: 'Map the complete customer journey from awareness to advocacy using proven frameworks.',
          category: 'Strategy',
          difficulty: 'Intermediate',
          estimatedTime: '3-4 hours',
          tags: ['customer', 'journey', 'value'],
          status: 'available'
        },
        {
          id: '2',
          title: 'Blue Ocean Strategy',
          description: 'Discover uncontested market spaces and create new demand using Blue Ocean principles.',
          category: 'Strategy',
          difficulty: 'Advanced',
          estimatedTime: '4-5 hours',
          tags: ['blue-ocean', 'strategy', 'innovation'],
          status: 'available'
        },
        {
          id: '3',
          title: 'Growth Heist Framework',
          description: 'Implement systematic growth hacking strategies to accelerate business growth.',
          category: 'Growth Hacking',
          difficulty: 'Advanced',
          estimatedTime: '3-4 hours',
          tags: ['growth', 'hacking', 'acceleration'],
          status: 'available'
        },
        {
          id: '4',
          title: 'Niche Fortune Strategy',
          description: 'Identify and dominate profitable niche markets with strategic positioning.',
          category: 'Market Strategy',
          difficulty: 'Intermediate',
          estimatedTime: '2-3 hours',
          tags: ['niche', 'market', 'positioning'],
          status: 'available'
        },
        {
          id: '5',
          title: 'Funnel Architecture',
          description: 'Design and optimize high-converting sales funnels for maximum revenue.',
          category: 'Sales Funnels',
          difficulty: 'Intermediate',
          estimatedTime: '3-4 hours',
          tags: ['funnel', 'conversion', 'sales'],
          status: 'available'
        },
        {
          id: '6',
          title: 'Conversion Psychology',
          description: 'Apply psychological principles to improve conversion rates and customer behavior.',
          category: 'Psychology',
          difficulty: 'Advanced',
          estimatedTime: '2-3 hours',
          tags: ['psychology', 'conversion', 'behavior'],
          status: 'available'
        },
        {
          id: '7',
          title: 'Viral Marketing Mechanics',
          description: 'Create viral marketing campaigns that spread organically and drive exponential growth.',
          category: 'Viral Marketing',
          difficulty: 'Advanced',
          estimatedTime: '3-4 hours',
          tags: ['viral', 'marketing', 'growth'],
          status: 'available'
        },
        {
          id: '8',
          title: 'Retention & Loyalty Systems',
          description: 'Build systems to retain customers and create long-term brand loyalty.',
          category: 'Retention',
          difficulty: 'Intermediate',
          estimatedTime: '2-3 hours',
          tags: ['retention', 'loyalty', 'systems'],
          status: 'available'
        }
      ]

      // Filter by search term if provided
      const filteredGrowthCopilots = searchTerm 
        ? mockGrowthCopilots.filter(growth => 
            growth.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            growth.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            growth.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : mockGrowthCopilots

      setGrowthCopilots(filteredGrowthCopilots)
    } catch (err: any) {
      console.error('Failed to load growth copilots:', err)
      setError('Failed to load growth frameworks. Please try again.')
    } finally {
      setLoading(false)
      setHasLoaded(true) // Mark as loaded to prevent retries
    }
  }

  const handleSearch = () => {
    setHasLoaded(false) // Reset to allow new search
    loadGrowthCopilots()
  }

  const predefinedFrameworks = [
    {
      id: 'cvj',
      name: 'Customer Value Journey',
      description: 'Map your customer\'s complete journey from awareness to advocacy',
      category: 'Strategy',
      icon: Users,
      color: 'bg-blue-500',
      estimatedTime: '15-20 minutes'
    },
    {
      id: 'blue-ocean',
      name: 'Blue Ocean Strategy',
      description: 'Find uncontested market space and make competition irrelevant',
      category: 'Strategy',
      icon: Target,
      color: 'bg-cyan-500',
      estimatedTime: '20-25 minutes'
    },
    {
      id: 'growth-heist',
      name: 'Growth Heist™',
      description: 'Systematic approach to growth hacking and rapid scaling',
      category: 'Execution',
      icon: Zap,
      color: 'bg-green-500',
      estimatedTime: '25-30 minutes'
    },
    {
      id: 'niche-fortune',
      name: 'Niche Fortune™',
      description: 'Identify and dominate profitable niche markets',
      category: 'Strategy',
      icon: BarChart3,
      color: 'bg-purple-500',
      estimatedTime: '18-22 minutes'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading growth frameworks...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Frameworks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadGrowthCopilots} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Growth Co-Pilot</h1>
            <p className="text-gray-600">Strategic frameworks for business growth and execution</p>
          </div>
        </div>

        {user ? (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md inline-block">
            ✅ Backend connected - Full AI capabilities available
          </div>
        ) : (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md inline-block">
            ⚡ Demo mode - Connect backend for AI generation
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <Button onClick={handleSearch} variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Framework
        </Button>
      </div>

      {/* Framework Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Strategy DNA
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Foundational frameworks for business strategy and market positioning
          </p>
          <div className="space-y-3">
            {predefinedFrameworks.filter(f => f.category === 'Strategy').map((framework) => {
              const Icon = framework.icon
              return (
                <div key={framework.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 ${framework.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{framework.name}</p>
                    <p className="text-xs text-gray-500">{framework.estimatedTime}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Execution DNA
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Tactical frameworks for campaign execution and growth hacking
          </p>
          <div className="space-y-3">
            {predefinedFrameworks.filter(f => f.category === 'Execution').map((framework) => {
              const Icon = framework.icon
              return (
                <div key={framework.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 ${framework.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{framework.name}</p>
                    <p className="text-xs text-gray-500">{framework.estimatedTime}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Custom Frameworks from Backend */}
      {growthCopilots.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Frameworks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {growthCopilots.map((copilot) => (
              <Card key={copilot.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{copilot.name}</h4>
                    <p className="text-xs text-gray-500">Custom Framework</p>
                  </div>
                </div>
                
                {copilot.description && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {copilot.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {copilot.input_fields && (
                      <span>{copilot.input_fields.length} inputs</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedCopilot(copilot)}
                  >
                    Use Framework
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Start Guide */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Getting Started with Growth Co-Pilot</h3>
            <p className="text-sm text-gray-600 mb-3">
              Choose a framework, answer guided questions, and get AI-powered strategic insights for your business.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>• 15-30 minutes per framework</span>
              <span>• Actionable outputs</span>
              <span>• Export to Google Docs</span>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Start Your First Framework
          </Button>
        </div>
      </Card>
    </div>
  )
}