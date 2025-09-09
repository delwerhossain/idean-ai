'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  BarChart3,
  Target,
  Compass,
  Users,
  Heart,
  Map,
  Building,
  BookOpen,
  Megaphone,
  Gift,
  Atom,
  Calendar,
  PenTool,
  Lightbulb,
  Rocket,
  Activity,
  Facebook,
  Instagram,
  Video,
  Mail,
  ChevronRight
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  category: 'strategy' | 'execution' | 'content' | 'analytics'
  icon: React.ComponentType<{ className?: string }>
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  tags: string[]
}

const tools: Tool[] = [
  // Strategy & Branding Lab
  {
    id: 'niche-finder',
    name: 'Niche Finder',
    description: 'Identify profitable market segments using proven frameworks',
    category: 'strategy',
    icon: Target,
    difficulty: 'beginner',
    estimatedTime: '10-15 min',
    tags: ['market research', 'strategy', 'iMarketing']
  },
  {
    id: 'core-strategy-builder',
    name: 'Core Strategy Builder',
    description: 'Define your business model and market positioning',
    category: 'strategy',
    icon: Compass,
    difficulty: 'intermediate',
    estimatedTime: '20-30 min',
    tags: ['strategy', 'positioning', 'GrowthX']
  },
  {
    id: 'blue-ocean-navigator',
    name: 'Blue Ocean Navigator',
    description: 'Find uncontested market spaces and opportunities',
    category: 'strategy',
    icon: Map,
    difficulty: 'advanced',
    estimatedTime: '25-35 min',
    tags: ['blue ocean', 'innovation', 'iMBA']
  },
  {
    id: 'category-designer',
    name: 'Category Designer',
    description: 'Create new market categories for your business',
    category: 'strategy',
    icon: Building,
    difficulty: 'advanced',
    estimatedTime: '30-40 min',
    tags: ['category creation', 'positioning']
  },
  {
    id: 'customer-value-journey',
    name: 'Customer Value Journey Planner',
    description: 'Map the complete customer lifecycle and touchpoints',
    category: 'strategy',
    icon: Users,
    difficulty: 'intermediate',
    estimatedTime: '20-25 min',
    tags: ['customer journey', 'experience']
  },
  {
    id: 'customer-value-ladder',
    name: 'Customer Value Ladder Builder',
    description: 'Design product progression and value delivery',
    category: 'strategy',
    icon: TrendingUp,
    difficulty: 'intermediate',
    estimatedTime: '15-20 min',
    tags: ['product strategy', 'value ladder']
  },
  {
    id: 'strategic-brand-planner',
    name: 'Strategic Brand Planner',
    description: 'Develop comprehensive brand architecture and messaging',
    category: 'strategy',
    icon: Heart,
    difficulty: 'intermediate',
    estimatedTime: '25-30 min',
    tags: ['branding', 'messaging', 'iMarketing']
  },
  {
    id: 'storybrand-builder',
    name: 'StoryBrand Builder',
    description: 'Craft compelling brand narratives using StoryBrand framework',
    category: 'strategy',
    icon: BookOpen,
    difficulty: 'beginner',
    estimatedTime: '15-20 min',
    tags: ['storytelling', 'branding', 'messaging']
  },

  // Execution & Growth Cockpit
  {
    id: 'marketing-funnel-builder',
    name: 'Marketing Funnel Builder',
    description: 'Design high-converting sales and marketing funnels',
    category: 'execution',
    icon: Activity,
    difficulty: 'intermediate',
    estimatedTime: '20-30 min',
    tags: ['funnel', 'conversion', 'GrowthX']
  },
  {
    id: 'godfather-offer-builder',
    name: 'Godfather Offer Builder',
    description: 'Create irresistible offers customers can\'t refuse',
    category: 'execution',
    icon: Gift,
    difficulty: 'advanced',
    estimatedTime: '25-35 min',
    tags: ['offers', 'pricing', 'conversion']
  },
  {
    id: 'nuclear-content-planner',
    name: 'Nuclear Content Planner',
    description: 'Plan high-impact content that drives engagement',
    category: 'execution',
    icon: Atom,
    difficulty: 'intermediate',
    estimatedTime: '15-25 min',
    tags: ['content strategy', 'engagement']
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    description: 'Schedule and organize your content marketing',
    category: 'execution',
    icon: Calendar,
    difficulty: 'beginner',
    estimatedTime: '10-15 min',
    tags: ['content planning', 'scheduling']
  },
  {
    id: 'neuro-copywriting',
    name: 'Neuro Copywriting Assistant',
    description: 'Write persuasive copy using psychological triggers',
    category: 'execution',
    icon: PenTool,
    difficulty: 'intermediate',
    estimatedTime: '10-20 min',
    tags: ['copywriting', 'psychology', 'conversion']
  },
  {
    id: 'magnetic-storytelling',
    name: 'Magnetic Storytelling Assistant',
    description: 'Craft engaging stories that captivate your audience',
    category: 'execution',
    icon: Sparkles,
    difficulty: 'intermediate',
    estimatedTime: '15-25 min',
    tags: ['storytelling', 'engagement', 'content']
  },
  {
    id: 'campaign-planner',
    name: 'Campaign Planner',
    description: 'Design integrated marketing campaigns',
    category: 'execution',
    icon: Megaphone,
    difficulty: 'intermediate',
    estimatedTime: '20-30 min',
    tags: ['campaigns', 'marketing', 'strategy']
  },
  {
    id: 'festival-campaign-planner',
    name: 'Festival Campaign Planner',
    description: 'Leverage cultural events and festivals for marketing',
    category: 'execution',
    icon: Calendar,
    difficulty: 'beginner',
    estimatedTime: '15-20 min',
    tags: ['festivals', 'cultural marketing', 'Bengali']
  },
  {
    id: 'growth-hacking-ideas',
    name: 'Growth Hacking Idea Generator',
    description: 'Discover creative growth opportunities and tactics',
    category: 'execution',
    icon: Lightbulb,
    difficulty: 'intermediate',
    estimatedTime: '10-15 min',
    tags: ['growth hacking', 'ideas', 'innovation']
  },
  {
    id: 'overdemand-planner',
    name: 'OverDemand Planner',
    description: 'Create market demand for your products/services',
    category: 'execution',
    icon: Rocket,
    difficulty: 'advanced',
    estimatedTime: '25-35 min',
    tags: ['demand generation', 'marketing', 'GrowthX']
  },

  // Content Creation Engine
  {
    id: 'facebook-ad-builder',
    name: 'Facebook Ad Builder',
    description: 'Complete guided workflow: Idea → Hook → Body → CTA → Caption',
    category: 'content',
    icon: Facebook,
    difficulty: 'beginner',
    estimatedTime: '8-12 min',
    tags: ['facebook ads', 'social media', 'conversion']
  },
  {
    id: 'organic-post-generator',
    name: 'Organic Post Generator',
    description: 'Create engaging social media posts for organic reach',
    category: 'content',
    icon: Instagram,
    difficulty: 'beginner',
    estimatedTime: '5-10 min',
    tags: ['social media', 'organic', 'engagement']
  },
  {
    id: 'video-script-creator',
    name: 'Video Script Creator',
    description: 'Write compelling scripts for marketing videos',
    category: 'content',
    icon: Video,
    difficulty: 'intermediate',
    estimatedTime: '10-15 min',
    tags: ['video marketing', 'scripts', 'storytelling']
  },
  {
    id: 'email-copy-generator',
    name: 'Email Copy Generator',
    description: 'Create high-converting email marketing sequences',
    category: 'content',
    icon: Mail,
    difficulty: 'intermediate',
    estimatedTime: '10-20 min',
    tags: ['email marketing', 'copywriting', 'conversion']
  },

  // Analytics Hub (placeholder for future)
  {
    id: 'performance-tracker',
    name: 'Performance Tracker',
    description: 'Upload and analyze campaign performance data',
    category: 'analytics',
    icon: BarChart3,
    difficulty: 'intermediate',
    estimatedTime: '15-20 min',
    tags: ['analytics', 'performance', 'ROI']
  }
]

const categoryConfig = {
  strategy: {
    name: 'Strategy & Branding Lab',
    description: '8 frameworks for business strategy and brand positioning',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  execution: {
    name: 'Execution & Growth Cockpit',
    description: '10 tactical tools for campaign execution and growth',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  content: {
    name: 'Content Creation Engine',
    description: '4 content formats with guided workflows',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  analytics: {
    name: 'Analytics Hub',
    description: 'Performance tracking and optimization insights',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  }
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Handle URL parameters for category filtering
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const categoryParam = urlParams.get('category')
      if (categoryParam && categoryParam in categoryConfig) {
        setSelectedCategory(categoryParam)
      }
    }
  }, [])

  const filteredTools = tools.filter(tool => {
    const matchesCategory = !selectedCategory || tool.category === selectedCategory
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleToolClick = (toolId: string) => {
    window.location.href = `/tools/${toolId}`
  }

  return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            iDEAN AI Tools
          </h1>
          <p className="text-gray-600">
            Choose from 18+ proven frameworks to transform your business ideas into actionable strategies
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tools, tags, or frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              All Tools ({tools.length})
            </Button>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const count = tools.filter(t => t.category === key).length
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  onClick={() => setSelectedCategory(key)}
                  size="sm"
                  className={selectedCategory === key ? config.color : ''}
                >
                  {config.name} ({count})
                </Button>
              )
            })}
          </div>
        </div>

        {/* Category Overview (when category is selected) */}
        {selectedCategory && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${categoryConfig[selectedCategory as keyof typeof categoryConfig].color} rounded-lg flex items-center justify-center`}>
                  {selectedCategory === 'strategy' && <TrendingUp className="w-6 h-6 text-white" />}
                  {selectedCategory === 'execution' && <Zap className="w-6 h-6 text-white" />}
                  {selectedCategory === 'content' && <Sparkles className="w-6 h-6 text-white" />}
                  {selectedCategory === 'analytics' && <BarChart3 className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {categoryConfig[selectedCategory as keyof typeof categoryConfig].name}
                  </h2>
                  <p className="text-gray-600">
                    {categoryConfig[selectedCategory as keyof typeof categoryConfig].description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const Icon = tool.icon
            const categoryColors = categoryConfig[tool.category]
            
            return (
              <Card 
                key={tool.id} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleToolClick(tool.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 ${categoryColors.lightColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${categoryColors.textColor}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={difficultyColors[tool.difficulty]}
                      >
                        {tool.difficulty}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {tool.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{tool.estimatedTime}</span>
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="bg-gray-100 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filters
            </p>
          </div>
        )}
      </div>
  )
}