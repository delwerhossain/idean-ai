'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Input } from '@/components/ui/input'
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
import { GrowthCopilot } from '@/lib/api/idean-api'

export default function GrowthCopilotPage() {
  const { user } = useAuth()
  const [growthCopilots, setGrowthCopilots] = useState<GrowthCopilot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCopilot, setSelectedCopilot] = useState<GrowthCopilot | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadGrowthCopilots = useCallback(async () => {
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
      const mockGrowthCopilots: GrowthCopilot[] = [
        {
          id: '1',
          name: 'Customer Value Journey',
          description: 'Map the complete customer journey from awareness to advocacy using proven frameworks.',
          system_prompt: 'You are an expert in customer value journey mapping.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Blue Ocean Strategy',
          description: 'Discover uncontested market spaces and create new demand using Blue Ocean principles.',
          system_prompt: 'You are an expert in Blue Ocean Strategy.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Growth Heist Framework',
          description: 'Implement systematic growth hacking strategies to accelerate business growth.',
          system_prompt: 'You are an expert in growth hacking.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          name: 'Niche Fortune Strategy',
          description: 'Identify and dominate profitable niche markets with strategic positioning.',
          system_prompt: 'You are an expert in niche market strategy.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '5',
          name: 'Funnel Architecture',
          description: 'Design and optimize high-converting sales funnels for maximum revenue.',
          system_prompt: 'You are an expert in sales funnel architecture.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '6',
          name: 'Conversion Psychology',
          description: 'Apply psychological principles to improve conversion rates and customer behavior.',
          system_prompt: 'You are an expert in conversion psychology.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '7',
          name: 'Viral Marketing Mechanics',
          description: 'Create viral marketing campaigns that spread organically and drive exponential growth.',
          system_prompt: 'You are an expert in viral marketing.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '8',
          name: 'Retention & Loyalty Systems',
          description: 'Build systems to retain customers and create long-term brand loyalty.',
          system_prompt: 'You are an expert in customer retention.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      // Filter by search term if provided
      const filteredGrowthCopilots = searchTerm
        ? mockGrowthCopilots.filter(growth =>
            growth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (growth.description && growth.description.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : mockGrowthCopilots

      setGrowthCopilots(filteredGrowthCopilots)
    } catch (err: unknown) {
      console.error('Failed to load growth copilots:', err)
      setError('Failed to load growth frameworks. Please try again.')
    } finally {
      setLoading(false)
      setHasLoaded(true) // Mark as loaded to prevent retries
    }
  }, [hasLoaded, loading, searchTerm])

  useEffect(() => {
    if (!hasLoaded) {
      loadGrowthCopilots()
    }
  }, [hasLoaded, loadGrowthCopilots])

  const handleSearch = () => {
    setHasLoaded(false) // Reset to allow new search
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