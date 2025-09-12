'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  History, 
  Facebook, 
  Instagram, 
  Eye,
  Copy,
  Download,
  RefreshCw,
  Trash2,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Clock,
  FileText,
  ExternalLink
} from 'lucide-react'
import { ideanApi } from '@/lib/api/idean-api'

interface GeneratedContent {
  id: string
  type: 'facebook-ad' | 'social-post'
  platform?: string
  title: string
  content: {
    headline?: string
    primary_text?: string
    description?: string
    cta?: string
    caption?: string
    hashtags?: string[]
    hook?: string
  }
  metadata: {
    campaign_objective?: string
    target_audience?: string
    tone?: string
    industry?: string
  }
  created_at: string
  updated_at: string
  status: 'draft' | 'published' | 'archived'
  performance?: {
    impressions: number
    clicks: number
    ctr: number
    conversions: number
  }
}

export default function GenerationHistory() {
  const [history, setHistory] = useState<GeneratedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'all' | 'facebook-ad' | 'social-post'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'performance'>('newest')

  useEffect(() => {
    loadGenerationHistory()
  }, [])

  const loadGenerationHistory = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call when available
      const mockHistory: GeneratedContent[] = [
        {
          id: '1',
          type: 'facebook-ad',
          title: 'Summer Collection Launch Campaign',
          content: {
            headline: 'Discover Your Summer Style',
            primary_text: 'Transform your wardrobe with our exclusive summer collection. From breezy sundresses to comfortable shorts, find pieces that make you feel confident and stylish all season long.',
            description: 'Shop now and get free shipping on orders over $75. Limited time offer!',
            cta: 'Shop Now'
          },
          metadata: {
            campaign_objective: 'conversions',
            target_audience: 'Fashion-conscious women 25-45',
            tone: 'friendly',
            industry: 'fashion'
          },
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          status: 'published',
          performance: {
            impressions: 12500,
            clicks: 425,
            ctr: 3.4,
            conversions: 23
          }
        },
        {
          id: '2',
          type: 'social-post',
          platform: 'instagram',
          title: 'Monday Motivation Post',
          content: {
            caption: 'Monday motivation: Your journey to success starts with the first step. What step will you take today? 💪✨',
            hashtags: ['#MondayMotivation', '#Success', '#Mindset', '#Goals', '#Inspiration']
          },
          metadata: {
            tone: 'inspirational',
            target_audience: 'Entrepreneurs and professionals'
          },
          created_at: '2024-01-14T09:15:00Z',
          updated_at: '2024-01-14T09:15:00Z',
          status: 'published',
          performance: {
            impressions: 3200,
            clicks: 180,
            ctr: 5.6,
            conversions: 8
          }
        },
        {
          id: '3',
          type: 'facebook-ad',
          title: 'Lead Generation Campaign',
          content: {
            headline: 'Free Marketing Strategy Guide',
            primary_text: 'Get insider secrets from top marketers. Download our comprehensive guide and discover proven strategies to grow your business faster.',
            description: 'Enter your email to get instant access to our exclusive 50-page marketing playbook.',
            cta: 'Download Now'
          },
          metadata: {
            campaign_objective: 'lead_generation',
            target_audience: 'Small business owners',
            tone: 'professional',
            industry: 'marketing'
          },
          created_at: '2024-01-13T14:20:00Z',
          updated_at: '2024-01-13T14:20:00Z',
          status: 'draft'
        }
      ]
      setHistory(mockHistory)
    } catch (error) {
      console.error('Failed to load generation history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history
    .filter(item => {
      if (selectedType !== 'all' && item.type !== selectedType) return false
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !JSON.stringify(item.content).toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'performance':
          const aPerf = a.performance?.ctr || 0
          const bPerf = b.performance?.ctr || 0
          return bPerf - aPerf
        default:
          return 0
      }
    })

  const handleCopyContent = (content: any) => {
    const textToCopy = content.headline ? 
      `${content.headline}\n\n${content.primary_text}\n\n${content.description}` :
      content.caption + (content.hashtags ? '\n\n' + content.hashtags.join(' ') : '')
    
    navigator.clipboard.writeText(textToCopy)
  }

  const handleRegenerateSimilar = (item: GeneratedContent) => {
    // This would trigger the appropriate creator component with pre-filled data
    console.log('Regenerating similar content for:', item.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string, platform?: string) => {
    if (type === 'facebook-ad') return Facebook
    if (platform === 'instagram') return Instagram
    return FileText
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Generation History</h2>
            <p className="text-sm text-gray-500">View and manage your generated content</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Type Filter */}
            <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
              <TabsList className="bg-gray-100">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="facebook-ad">
                  <Facebook className="w-4 h-4 mr-1" />
                  Ads
                </TabsTrigger>
                <TabsTrigger value="social-post">
                  <Instagram className="w-4 h-4 mr-1" />
                  Posts
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Sort */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="performance">Best Performance</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </Card>

      {/* Content List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start creating content to see your history here'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const TypeIcon = getTypeIcon(item.type, item.platform)
            return (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TypeIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      {/* Title and Status */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          {item.platform && (
                            <Badge variant="outline">{item.platform}</Badge>
                          )}
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="space-y-2">
                        {item.content.headline && (
                          <p className="font-medium text-gray-900">{item.content.headline}</p>
                        )}
                        {item.content.primary_text && (
                          <p className="text-gray-600 line-clamp-2">{item.content.primary_text}</p>
                        )}
                        {item.content.caption && (
                          <p className="text-gray-600 line-clamp-2">{item.content.caption}</p>
                        )}
                        {item.content.hashtags && (
                          <p className="text-blue-600 text-sm">
                            {item.content.hashtags.slice(0, 5).join(' ')}
                            {item.content.hashtags.length > 5 && '...'}
                          </p>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                        {item.metadata.target_audience && (
                          <div>
                            <span className="font-medium">Audience:</span> {item.metadata.target_audience}
                          </div>
                        )}
                        {item.metadata.tone && (
                          <div>
                            <span className="font-medium">Tone:</span> {item.metadata.tone}
                          </div>
                        )}
                      </div>

                      {/* Performance */}
                      {item.performance && (
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Eye className="w-4 h-4" />
                            <span>{item.performance.impressions.toLocaleString()} impressions</span>
                          </div>
                          <div className="flex items-center space-x-1 text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>{item.performance.ctr}% CTR</span>
                          </div>
                          <div className="text-green-600">
                            {item.performance.conversions} conversions
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyContent(item.content)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRegenerateSimilar(item)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Load More */}
      {filteredHistory.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="px-8">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}