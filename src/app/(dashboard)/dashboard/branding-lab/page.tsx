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
  Palette, 
  Plus, 
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Heart,
  Crown,
  Lightbulb,
  Users,
  AlertTriangle
} from 'lucide-react'
import { ideanApi, BrandingLab } from '@/lib/api/idean-api'

export default function BrandingLabPage() {
  const { user } = useAuth()
  const [brandingLabs, setBrandingLabs] = useState<BrandingLab[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrandingLab, setSelectedBrandingLab] = useState<BrandingLab | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded) {
      loadBrandingLabs()
    }
  }, [hasLoaded])

  const loadBrandingLabs = async () => {
    if (loading || hasLoaded) return
    
    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with actual API call when backend is ready
      // const response = await ideanApi.brandingLab.getAll({
      //   limit: 50,
      //   search: searchTerm
      // })

      // Mock data for now - will be replaced with real API
      const mockBrandingLabs: BrandingLab[] = [
        {
          id: '1',
          title: 'Brand Identity Framework',
          description: 'Create a comprehensive brand identity including logo, colors, typography, and visual guidelines.',
          category: 'Identity',
          difficulty: 'Intermediate',
          estimatedTime: '2-3 hours',
          tags: ['branding', 'identity', 'visual'],
          status: 'available'
        },
        {
          id: '2',
          title: 'Brand Voice & Messaging',
          description: 'Develop your brand personality, tone of voice, and core messaging framework.',
          category: 'Messaging',
          difficulty: 'Beginner',
          estimatedTime: '1-2 hours',
          tags: ['messaging', 'voice', 'communication'],
          status: 'available'
        },
        {
          id: '3',
          title: 'Brand Story Development',
          description: 'Craft compelling brand narratives that connect with your target audience.',
          category: 'Storytelling',
          difficulty: 'Advanced',
          estimatedTime: '3-4 hours',
          tags: ['storytelling', 'narrative', 'connection'],
          status: 'available'
        },
        {
          id: '4',
          title: 'Brand Positioning Strategy',
          description: 'Position your brand uniquely in the market using proven positioning frameworks.',
          category: 'Strategy',
          difficulty: 'Advanced',
          estimatedTime: '2-3 hours',
          tags: ['positioning', 'strategy', 'competition'],
          status: 'available'
        },
        {
          id: '5',
          title: 'Logo Design Principles',
          description: 'Learn the fundamentals of effective logo design and create memorable brand marks.',
          category: 'Design',
          difficulty: 'Intermediate',
          estimatedTime: '2-3 hours',
          tags: ['logo', 'design', 'visual'],
          status: 'available'
        },
        {
          id: '6',
          title: 'Brand Guidelines Creation',
          description: 'Develop comprehensive brand guidelines to ensure consistent brand application.',
          category: 'Guidelines',
          difficulty: 'Intermediate',
          estimatedTime: '1-2 hours',
          tags: ['guidelines', 'consistency', 'standards'],
          status: 'available'
        }
      ]

      // Filter by search term if provided
      const filteredLabs = searchTerm 
        ? mockBrandingLabs.filter(lab => 
            lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : mockBrandingLabs

      setBrandingLabs(filteredLabs)
    } catch (err: any) {
      console.error('Failed to load branding labs:', err)
      setError('Failed to load branding frameworks. Please try again.')
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  const handleSearch = () => {
    setHasLoaded(false)
  }

  const predefinedFrameworks = [
    {
      id: 'brand-dna',
      name: 'Brand DNA Foundation',
      description: 'Define your core brand identity, values, and unique positioning',
      category: 'Foundation',
      icon: Crown,
      color: 'bg-purple-500',
      estimatedTime: '20-25 minutes'
    },
    {
      id: 'neuro-branding',
      name: 'NeuroBranding™',
      description: 'Psychology-driven brand strategy for emotional connection',
      category: 'Psychology',
      icon: Heart,
      color: 'bg-pink-500',
      estimatedTime: '25-30 minutes'
    },
    {
      id: 'luxury-positioning',
      name: 'Luxury Positioning',
      description: 'Premium brand positioning and exclusivity strategies',
      category: 'Positioning',
      icon: Sparkles,
      color: 'bg-gold-500',
      estimatedTime: '22-28 minutes'
    },
    {
      id: 'brand-voice',
      name: 'Brand Voice & Messaging',
      description: 'Develop consistent brand voice and messaging framework',
      category: 'Communication',
      icon: Users,
      color: 'bg-blue-500',
      estimatedTime: '18-22 minutes'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading branding frameworks...</span>
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
          <Button onClick={loadBrandingLabs} variant="outline">
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
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Branding Lab</h1>
            <p className="text-gray-600">Strategic brand frameworks and messaging systems</p>
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
              placeholder="Search branding frameworks..."
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
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Framework
        </Button>
      </div>

      {/* Framework Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Brand Foundation
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Core brand identity frameworks for establishing strong brand foundations
          </p>
          <div className="space-y-3">
            {predefinedFrameworks.filter(f => f.category === 'Foundation' || f.category === 'Psychology').map((framework) => {
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
            <Lightbulb className="w-5 h-5" />
            Brand Communication
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Messaging and positioning frameworks for effective brand communication
          </p>
          <div className="space-y-3">
            {predefinedFrameworks.filter(f => f.category === 'Positioning' || f.category === 'Communication').map((framework) => {
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
      {brandingLabs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Branding Frameworks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandingLabs.map((lab) => (
              <Card key={lab.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{lab.name}</h4>
                    <p className="text-xs text-gray-500">Custom Framework</p>
                  </div>
                </div>
                
                {lab.description && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {lab.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {lab.input_fields && (
                      <span>{lab.input_fields.length} inputs</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedBrandingLab(lab)}
                  >
                    Use Framework
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Key Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Crown className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Brand Identity</h3>
          <p className="text-sm text-gray-600">
            Define core values, personality, and visual identity elements
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-pink-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Emotional Connection</h3>
          <p className="text-sm text-gray-600">
            Build psychological triggers and emotional brand connections
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Voice & Messaging</h3>
          <p className="text-sm text-gray-600">
            Consistent brand voice across all communication channels
          </p>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Getting Started with Branding Lab</h3>
            <p className="text-sm text-gray-600 mb-3">
              Build a powerful brand identity with proven frameworks from luxury brands and psychology research.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>• 18-30 minutes per framework</span>
              <span>• Brand guidelines output</span>
              <span>• Export to design tools</span>
            </div>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Start Brand Foundation
          </Button>
        </div>
      </Card>
    </div>
  )
}