'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  PenTool, 
  Plus, 
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  MessageSquare,
  Mail,
  Share2,
  FileText,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { ideanApi, Copywriting } from '@/lib/api/idean-api'

export default function CopywritingPage() {
  const { data: session } = useSession()
  const [copywritings, setCopywritings] = useState<Copywriting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCopywriting, setSelectedCopywriting] = useState<Copywriting | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded && !loading) {
      loadCopywritings()
    }
    
    return () => {
      setLoading(false)
    }
  }, [hasLoaded, loading])

  const loadCopywritings = async () => {
    if (loading || hasLoaded) return
    
    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with actual API call when backend is ready
      // const response = await ideanApi.copywriting.getAll({
      //   limit: 50,
      //   search: searchTerm
      // })

      // Mock data for now - will be replaced with real API
      const mockCopywritings: any[] = [
        {
          id: '1',
          title: 'AIDA Copywriting Formula',
          description: 'Master the classic Attention, Interest, Desire, Action framework for compelling copy.',
          category: 'Formulas',
          difficulty: 'Beginner',
          estimatedTime: '1-2 hours',
          tags: ['aida', 'formula', 'basics'],
          status: 'available'
        },
        {
          id: '2',
          title: 'Problem-Agitate-Solution (PAS)',
          description: 'Learn to identify problems, agitate emotions, and present solutions effectively.',
          category: 'Formulas',
          difficulty: 'Intermediate',
          estimatedTime: '2-3 hours',
          tags: ['pas', 'problem', 'solution'],
          status: 'available'
        },
        {
          id: '3',
          title: 'Email Marketing Sequences',
          description: 'Create high-converting email sequences that nurture leads and drive sales.',
          category: 'Email',
          difficulty: 'Advanced',
          estimatedTime: '3-4 hours',
          tags: ['email', 'sequences', 'nurturing'],
          status: 'available'
        },
        {
          id: '4',
          title: 'Sales Page Headlines',
          description: 'Craft irresistible headlines that grab attention and drive conversions.',
          category: 'Headlines',
          difficulty: 'Intermediate',
          estimatedTime: '2-3 hours',
          tags: ['headlines', 'sales', 'attention'],
          status: 'available'
        },
        {
          id: '5',
          title: 'Social Media Copy',
          description: 'Write engaging social media copy that builds community and drives engagement.',
          category: 'Social',
          difficulty: 'Beginner',
          estimatedTime: '1-2 hours',
          tags: ['social', 'engagement', 'community'],
          status: 'available'
        },
        {
          id: '6',
          title: 'Ad Copy Optimization',
          description: 'Optimize your ad copy for maximum click-through rates and conversions.',
          category: 'Advertising',
          difficulty: 'Advanced',
          estimatedTime: '2-4 hours',
          tags: ['ads', 'optimization', 'conversion'],
          status: 'available'
        },
        {
          id: '7',
          title: 'Storytelling in Copy',
          description: 'Use narrative techniques to make your copy more compelling and memorable.',
          category: 'Storytelling',
          difficulty: 'Intermediate',
          estimatedTime: '2-3 hours',
          tags: ['storytelling', 'narrative', 'engagement'],
          status: 'available'
        },
        {
          id: '8',
          title: 'Call-to-Action Mastery',
          description: 'Create compelling CTAs that drive immediate action from your audience.',
          category: 'CTA',
          difficulty: 'Beginner',
          estimatedTime: '1-2 hours',
          tags: ['cta', 'action', 'conversion'],
          status: 'available'
        }
      ]

      // Filter by search term if provided
      const filteredCopywritings = searchTerm 
        ? mockCopywritings.filter(copy => 
            copy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            copy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            copy.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : mockCopywritings

      setCopywritings(filteredCopywritings)
    } catch (err: any) {
      console.error('Failed to load copywriting frameworks:', err)
      setError('Failed to load copywriting frameworks. Please try again.')
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  const handleSearch = () => {
    setHasLoaded(false)
    loadCopywritings()
  }

  const predefinedFrameworks = [
    {
      id: 'neuro-copy',
      name: 'NeuroCopywriting™',
      description: 'Psychology-driven copywriting that triggers buying behavior',
      category: 'Psychology',
      icon: Zap,
      color: 'bg-yellow-500',
      estimatedTime: '15-20 minutes'
    },
    {
      id: 'nuclear-content',
      name: 'Nuclear Content™',
      description: 'Viral content creation framework for maximum engagement',
      category: 'Content',
      icon: TrendingUp,
      color: 'bg-red-500',
      estimatedTime: '20-25 minutes'
    },
    {
      id: 'email-sequences',
      name: 'Email Sequence Builder',
      description: 'Automated email campaigns that convert and nurture',
      category: 'Email',
      icon: Mail,
      color: 'bg-blue-500',
      estimatedTime: '25-30 minutes'
    },
    {
      id: 'social-copy',
      name: 'Social Media Copy',
      description: 'Platform-optimized social media content generation',
      category: 'Social',
      icon: Share2,
      color: 'bg-green-500',
      estimatedTime: '10-15 minutes'
    },
    {
      id: 'sales-pages',
      name: 'Sales Page Framework',
      description: 'High-converting sales pages with proven structures',
      category: 'Sales',
      icon: Target,
      color: 'bg-purple-500',
      estimatedTime: '30-40 minutes'
    },
    {
      id: 'ad-copy',
      name: 'Ad Copy Generator',
      description: 'Facebook, Google, and native ad copy that converts',
      category: 'Advertising',
      icon: Sparkles,
      color: 'bg-indigo-500',
      estimatedTime: '12-18 minutes'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading copywriting frameworks...</span>
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
          <Button onClick={loadCopywritings} variant="outline">
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
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Copywriting</h1>
            <p className="text-gray-600">Content generation frameworks for campaigns and marketing</p>
          </div>
        </div>

        {session?.backendToken ? (
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
              placeholder="Search copywriting frameworks..."
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
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Framework
        </Button>
      </div>

      {/* Framework Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Conversion Copy
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            High-converting copy frameworks for sales and marketing
          </p>
          <div className="space-y-3">
            {predefinedFrameworks.filter(f => f.category === 'Psychology' || f.category === 'Sales').map((framework) => {
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
            <Share2 className="w-5 h-5" />
            Content & Social
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Engaging content frameworks for social media and viral marketing
          </p>
          <div className="space-y-3">
            {predefinedFrameworks.filter(f => f.category === 'Content' || f.category === 'Social').map((framework) => {
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
            <Mail className="w-5 h-5" />
            Email & Ads
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Email sequences and advertising copy that converts
          </p>
          <div className="space-y-3">
            {predefinedFrameworks.filter(f => f.category === 'Email' || f.category === 'Advertising').map((framework) => {
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
      {copywritings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Copywriting Frameworks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copywritings.map((copywriting) => (
              <Card key={copywriting.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <PenTool className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{copywriting.name}</h4>
                    <p className="text-xs text-gray-500">Custom Framework</p>
                  </div>
                </div>
                
                {copywriting.description && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {copywriting.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {copywriting.input_fields && (
                      <span>{copywriting.input_fields.length} inputs</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedCopywriting(copywriting)}
                  >
                    Generate Copy
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Content Types Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <h4 className="font-medium text-gray-900 text-sm mb-1">Sales Copy</h4>
          <p className="text-xs text-gray-500">Converting sales pages</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <h4 className="font-medium text-gray-900 text-sm mb-1">Viral Content</h4>
          <p className="text-xs text-gray-500">Engaging social posts</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-medium text-gray-900 text-sm mb-1">Email Sequences</h4>
          <p className="text-xs text-gray-500">Nurturing campaigns</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <h4 className="font-medium text-gray-900 text-sm mb-1">Ad Copy</h4>
          <p className="text-xs text-gray-500">Converting advertisements</p>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Getting Started with AI Copywriting</h3>
            <p className="text-sm text-gray-600 mb-3">
              Generate high-converting copy with proven frameworks from top marketers and behavioral psychology.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>• 10-40 minutes per framework</span>
              <span>• Multiple copy variations</span>
              <span>• A/B testing templates</span>
            </div>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            Generate Your First Copy
          </Button>
        </div>
      </Card>
    </div>
  )
}