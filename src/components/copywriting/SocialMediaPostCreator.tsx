'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Hash, 
  Sparkles, 
  Image,
  Video,
  Calendar,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Download,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  Clock,
  ChevronDown,
  CheckCircle,
  Plus,
  X
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ideanApi } from '@/lib/api/idean-api'
import { useBusinessDataContext, useBusinessSwitchListener } from '@/lib/contexts/BusinessContext'

interface SocialMediaPostCreatorProps {
  businessId?: string
  templates: any[]
}

interface PostData {
  platform: string[]
  postType: string
  topic: string
  audience: string
  tone: string
  contentGoal: string
  keyMessage: string
  callToAction: string
  hashtags: string[]
  language: string
}

interface GeneratedPost {
  caption: string
  hashtags: string[]
  visualIdeas: string[]
  alternativeVersions: string[]
  engagementTips: string[]
  bestTimeToPost: string
  estimatedReach: string
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' }
]

const POST_TYPES = [
  { value: 'promotional', label: 'Promotional', description: 'Promote products/services' },
  { value: 'educational', label: 'Educational', description: 'Share knowledge/tips' },
  { value: 'inspirational', label: 'Inspirational', description: 'Motivate your audience' },
  { value: 'behind_scenes', label: 'Behind the Scenes', description: 'Show your process' },
  { value: 'user_generated', label: 'User Generated', description: 'Feature customer content' },
  { value: 'trending', label: 'Trending Topic', description: 'Jump on current trends' }
]

const CONTENT_GOALS = [
  { value: 'awareness', label: 'Brand Awareness', description: 'Increase visibility' },
  { value: 'engagement', label: 'Engagement', description: 'Drive interactions' },
  { value: 'traffic', label: 'Website Traffic', description: 'Drive clicks to website' },
  { value: 'leads', label: 'Lead Generation', description: 'Collect contact information' },
  { value: 'sales', label: 'Sales', description: 'Drive direct sales' },
  { value: 'community', label: 'Community Building', description: 'Build loyal following' }
]

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', emoji: '👔' },
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'casual', label: 'Casual', emoji: '😎' },
  { value: 'inspiring', label: 'Inspiring', emoji: '✨' },
  { value: 'humorous', label: 'Humorous', emoji: '😄' },
  { value: 'educational', label: 'Educational', emoji: '📚' },
  { value: 'urgent', label: 'Urgent', emoji: '⚡' }
]

const TRENDING_HASHTAGS = {
  business: ['#SmallBusiness', '#Entrepreneur', '#BusinessTips', '#Success', '#Motivation'],
  marketing: ['#DigitalMarketing', '#Marketing', '#SocialMedia', '#ContentMarketing', '#Branding'],
  lifestyle: ['#Lifestyle', '#Inspiration', '#Wellness', '#Mindset', '#Growth'],
  technology: ['#Technology', '#Innovation', '#Digital', '#Future', '#AI'],
  fashion: ['#Fashion', '#Style', '#OOTD', '#Trend', '#Beauty']
}

export default function SocialMediaPostCreator({ businessId, templates }: SocialMediaPostCreatorProps) {
  const [postData, setPostData] = useState<PostData>({
    platform: ['instagram'],
    postType: '',
    topic: '',
    audience: '',
    tone: 'friendly',
    contentGoal: 'engagement',
    keyMessage: '',
    callToAction: '',
    hashtags: [],
    language: 'en'
  })
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customHashtag, setCustomHashtag] = useState('')
  const [activeVariation, setActiveVariation] = useState(0)
  const businessData = useBusinessDataContext()

  useEffect(() => {
    if (businessData.currentBusiness) {
      setPostData(prev => ({
        ...prev,
        language: businessData.currentBusiness.language || 'en',
        audience: businessData.currentBusiness.business_context?.split('.')[0] || '',
      }))
    }
  }, [businessData.currentBusiness])

  // Reset form data when business changes
  useBusinessSwitchListener(({ newBusiness }) => {
    console.log('🔄 Business switched in SocialMediaPostCreator, resetting form data')
    setPostData(prev => ({
      ...prev,
      language: newBusiness.language || 'en',
      audience: newBusiness.business_context?.split('.')[0] || '',
    }))
    // Clear generated posts to avoid confusion
    setGeneratedPosts([])
    setActiveVariation(0)
  })

  const updatePostData = (field: keyof PostData, value: any) => {
    setPostData(prev => ({ ...prev, [field]: value }))
  }

  const togglePlatform = (platformId: string) => {
    setPostData(prev => ({
      ...prev,
      platform: prev.platform.includes(platformId)
        ? prev.platform.filter(p => p !== platformId)
        : [...prev.platform, platformId]
    }))
  }

  const addHashtag = (hashtag: string) => {
    if (hashtag && !postData.hashtags.includes(hashtag)) {
      setPostData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtag]
      }))
    }
    setCustomHashtag('')
  }

  const removeHashtag = (hashtag: string) => {
    setPostData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }))
  }

  const generatePost = async () => {
    setGenerating(true)
    
    try {
      const templateId = selectedTemplate || templates[0]?.id
      if (!templateId) {
        throw new Error('No template selected')
      }

      const inputs = {
        platforms: postData.platform.join(', '),
        post_type: postData.postType,
        topic: postData.topic,
        target_audience: postData.audience,
        tone: postData.tone,
        content_goal: postData.contentGoal,
        key_message: postData.keyMessage,
        call_to_action: postData.callToAction,
        hashtags: postData.hashtags.join(' '),
        language: postData.language,
        business_context: businessData.currentBusiness?.business_context || '',
        industry: businessData.currentBusiness?.industry_tag || ''
      }

      const response = await ideanApi.copywriting.generate(templateId, inputs)
      
      // Mock structured response for social media post
      const mockGeneratedPost: GeneratedPost = {
        caption: extractPostCaption(response.content) || generateMockCaption(),
        hashtags: generateRelevantHashtags(),
        visualIdeas: [
          "High-quality product photo with natural lighting",
          "Behind-the-scenes video of your process",
          "Customer testimonial with their photo",
          "Infographic with key statistics",
          "Carousel showing before/after results"
        ],
        alternativeVersions: [
          generateAlternativeVersion(1),
          generateAlternativeVersion(2),
          generateAlternativeVersion(3)
        ],
        engagementTips: [
          "Ask a question to encourage comments",
          "Use relevant trending hashtags",
          "Post during peak engagement hours",
          "Include a clear call-to-action",
          "Respond quickly to comments"
        ],
        bestTimeToPost: getBestTimeToPost(),
        estimatedReach: "2.5K - 5K accounts"
      }

      setGeneratedPost(mockGeneratedPost)
    } catch (error) {
      console.error('Failed to generate social media post:', error)
      alert('Failed to generate post. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const extractPostCaption = (content: string): string => {
    // Extract caption from generated content
    const lines = content.split('\n').filter(line => line.trim())
    return lines.slice(0, 3).join('\n\n') || content.substring(0, 280)
  }

  const generateMockCaption = (): string => {
    const hooks = [
      "🚀 Ready to transform your business?",
      "💡 Here's something most people don't know...",
      "✨ The secret to success isn't what you think",
      "🔥 This one tip changed everything for us"
    ]
    
    const hook = hooks[Math.floor(Math.random() * hooks.length)]
    return `${hook}\n\n${postData.keyMessage || 'Share your story and connect with your audience.'}\n\n${postData.callToAction || 'What do you think? Let us know in the comments! 👇'}`
  }

  const generateRelevantHashtags = (): string[] => {
    const businessHashtags = TRENDING_HASHTAGS.business.slice(0, 3)
    const industryHashtags = businessData.currentBusiness?.industry_tag ?
      [`#${businessData.currentBusiness.industry_tag.replace(/\s+/g, '')}`, `#${businessData.currentBusiness.industry_tag.split(' ')[0]}`] : []
    
    return [...postData.hashtags, ...businessHashtags, ...industryHashtags].slice(0, 10)
  }

  const generateAlternativeVersion = (version: number): string => {
    const variations = [
      `Alternative ${version}: ${postData.keyMessage} - with a more ${postData.tone} approach`,
      `Version ${version}: Focusing on ${postData.contentGoal} with compelling storytelling`,
      `Option ${version}: ${postData.topic} explained in a way that resonates with ${postData.audience}`
    ]
    return variations[version - 1] || `Alternative version ${version} of your post`
  }

  const getBestTimeToPost = (): string => {
    const times = {
      facebook: "1-3 PM, 7-9 PM",
      instagram: "11 AM-1 PM, 7-9 PM", 
      linkedin: "8-10 AM, 12-2 PM"
    }
    
    const platformTimes = postData.platform.map(p => `${p}: ${times[p as keyof typeof times] || 'Varies'}`).join(' | ')
    return platformTimes
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Content copied to clipboard!')
  }

  const copyFullPost = () => {
    if (!generatedPost) return
    
    const fullContent = `SOCIAL MEDIA POST\n\n` +
      `CAPTION:\n${generatedPost.caption}\n\n` +
      `HASHTAGS:\n${generatedPost.hashtags.join(' ')}\n\n` +
      `VISUAL IDEAS:\n${generatedPost.visualIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}\n\n` +
      `ENGAGEMENT TIPS:\n${generatedPost.engagementTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\n` +
      `BEST TIME TO POST: ${generatedPost.bestTimeToPost}`
    
    navigator.clipboard.writeText(fullContent)
    alert('Complete post content copied to clipboard!')
  }

  const regenerateSection = async (section: 'caption' | 'hashtags' | 'visualIdeas' | 'alternativeVersions') => {
    if (!generatedPost) return
    
    setLoading(true)
    try {
      const variations = {
        caption: [
          `✨ ${postData.keyMessage} Here's what ${postData.audience} need to know! ${postData.callToAction}`,
          `Breaking: ${postData.keyMessage} This changes everything for ${postData.audience}! ${postData.callToAction}`,
          `Real talk: ${postData.keyMessage} Every ${postData.audience} should see this. ${postData.callToAction}`,
          `💡 Quick reminder for ${postData.audience}: ${postData.keyMessage} ${postData.callToAction}`
        ],
        hashtags: [
          ['#trending', '#viral', '#content', '#engagement', '#social', '#marketing', '#brand', '#audience', '#reach', '#growth'],
          ['#success', '#motivation', '#inspiration', '#mindset', '#goals', '#business', '#entrepreneur', '#leadership', '#innovation', '#results'],
          ['#creative', '#design', '#visual', '#storytelling', '#impact', '#community', '#lifestyle', '#authentic', '#quality', '#unique']
        ],
        visualIdeas: [
          ['Animated GIF', 'Story highlight cover', 'Carousel design', 'Quote graphic', 'Behind-the-scenes photo'],
          ['Video reel', 'Infographic post', 'Photo series', 'Live stream', 'Tutorial content'],
          ['User-generated content', 'Product showcase', 'Team photo', 'Process video', 'Customer testimonial']
        ],
        alternativeVersions: [
          [
            `Version A: ${postData.keyMessage} - Perfect for ${postData.audience} who want quick wins!`,
            `Version B: Here's why ${postData.audience} love this approach: ${postData.keyMessage}`,
            `Version C: ${postData.topic} made simple for ${postData.audience}. ${postData.keyMessage}`
          ],
          [
            `Option 1: Transform your ${postData.topic} game! ${postData.keyMessage}`,
            `Option 2: ${postData.audience}, this one's for you: ${postData.keyMessage}`,
            `Option 3: The ultimate ${postData.topic} guide for ${postData.audience}`
          ]
        ]
      }

      const randomContent = variations[section][Math.floor(Math.random() * variations[section].length)]
      setGeneratedPost(prev => prev ? { ...prev, [section]: randomContent } : null)
    } catch (error) {
      console.error(`Failed to regenerate ${section}:`, error)
      alert(`Failed to regenerate ${section}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const generateVariations = async () => {
    setLoading(true)
    try {
      await Promise.all([
        regenerateSection('caption'),
        regenerateSection('hashtags'),
        regenerateSection('alternativeVersions')
      ])
    } catch (error) {
      console.error('Failed to generate variations:', error)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return postData.platform.length > 0 && 
           postData.postType && 
           postData.topic.trim().length > 0 &&
           postData.keyMessage.trim().length > 0
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-4">
          <Instagram className="w-4 h-4 mr-2 text-pink-600" />
          <span className="text-sm font-medium text-pink-800">Social Media Content Creator</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Engaging Social Posts</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate compelling social media content optimized for multiple platforms using iDEAN AI frameworks
        </p>
      </div>

      {!generatedPost ? (
        /* Input Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform Selection */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Select Platforms</h3>
              <div className="grid grid-cols-3 gap-4">
                {PLATFORMS.map((platform) => {
                  const IconComponent = platform.icon
                  const isSelected = postData.platform.includes(platform.id)
                  return (
                    <div
                      key={platform.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePlatform(platform.id)}
                    >
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center mx-auto mb-2`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-medium text-gray-900">{platform.name}</div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 mx-auto mt-1" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Post Configuration */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Post Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Type <span className="text-red-500">*</span>
                  </label>
                  <Select value={postData.postType} onValueChange={(value) => updatePostData('postType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose post type" />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Goal
                  </label>
                  <Select value={postData.contentGoal} onValueChange={(value) => updatePostData('contentGoal', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_GOALS.map((goal) => (
                        <SelectItem key={goal.value} value={goal.value}>
                          <div>
                            <div className="font-medium">{goal.label}</div>
                            <div className="text-sm text-gray-500">{goal.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Content Details */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Content Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="What's your post about?"
                    value={postData.topic}
                    onChange={(e) => updatePostData('topic', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <Input
                    placeholder="Who are you targeting?"
                    value={postData.audience}
                    onChange={(e) => updatePostData('audience', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="What's the main message you want to convey?"
                    value={postData.keyMessage}
                    onChange={(e) => updatePostData('keyMessage', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone of Voice
                    </label>
                    <Select value={postData.tone} onValueChange={(value) => updatePostData('tone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONE_OPTIONS.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            <span className="flex items-center">
                              <span className="mr-2">{tone.emoji}</span>
                              {tone.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call to Action
                    </label>
                    <Input
                      placeholder="What should people do?"
                      value={postData.callToAction}
                      onChange={(e) => updatePostData('callToAction', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Hashtags */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Hash className="w-5 h-5 mr-2 text-blue-600" />
                Hashtags
              </h3>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add custom hashtag"
                    value={customHashtag}
                    onChange={(e) => setCustomHashtag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHashtag(customHashtag.startsWith('#') ? customHashtag : `#${customHashtag}`)}
                  />
                  <Button 
                    onClick={() => addHashtag(customHashtag.startsWith('#') ? customHashtag : `#${customHashtag}`)}
                    disabled={!customHashtag.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Trending Hashtags */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Trending in Business</h4>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_HASHTAGS.business.map((hashtag) => (
                      <Badge 
                        key={hashtag}
                        variant="outline" 
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => addHashtag(hashtag)}
                      >
                        {hashtag}
                        <Plus className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Selected Hashtags */}
                {postData.hashtags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {postData.hashtags.map((hashtag) => (
                        <Badge key={hashtag} className="bg-blue-100 text-blue-800">
                          {hashtag}
                          <X 
                            className="w-3 h-3 ml-1 cursor-pointer" 
                            onClick={() => removeHashtag(hashtag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Template Selection */}
            {templates.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Framework Template</h3>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name || `Template ${template.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Platform Insights</h3>
              <div className="space-y-4">
                {postData.platform.map((platformId) => {
                  const platform = PLATFORMS.find(p => p.id === platformId)
                  if (!platform) return null
                  
                  const IconComponent = platform.icon
                  return (
                    <div key={platformId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded ${platform.color} flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{platform.name}</div>
                          <div className="text-sm text-gray-500">
                            {platformId === 'instagram' && 'Best for visuals'}
                            {platformId === 'facebook' && 'Great for engagement'}
                            {platformId === 'linkedin' && 'Professional content'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Generate Button */}
            <Card className="p-6">
              <Button 
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-6"
                onClick={generatePost}
                disabled={!isFormValid() || generating}
              >
                {generating ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Social Post
                  </>
                )}
              </Button>
              
              {!isFormValid() && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Please fill required fields to generate content
                </p>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* Generated Content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Generated Post</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={generateVariations}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="ml-1">Generate Variations</span>
                  </Button>
                </div>
              </div>

              {/* Post Preview */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {businessData.currentBusiness?.business_name?.charAt(0) || 'B'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {businessData.currentBusiness?.business_name || 'Your Business'}
                    </div>
                    <div className="text-sm text-gray-500">2 hours ago</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Caption</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => regenerateSection('caption')}
                      disabled={loading}
                      className="h-6 px-2"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <Textarea
                    value={generatedPost.caption}
                    onChange={(e) => setGeneratedPost(prev => prev ? {...prev, caption: e.target.value} : null)}
                    className="border-0 p-0 text-base resize-none focus:ring-0 bg-transparent"
                    rows={6}
                  />
                </div>

                {/* Hashtags */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Hashtags</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => regenerateSection('hashtags')}
                      disabled={loading}
                      className="h-6 px-2"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {generatedPost.hashtags.map((hashtag, index) => (
                      <span key={index} className="text-blue-600 hover:underline cursor-pointer">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mock Engagement */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-6 text-gray-600">
                    <div className="flex items-center space-x-1 cursor-pointer hover:text-red-500">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm">23</span>
                    </div>
                    <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">5</span>
                    </div>
                    <div className="flex items-center space-x-1 cursor-pointer hover:text-green-500">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">2</span>
                    </div>
                  </div>
                  <Bookmark className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-500" />
                </div>
              </div>

              {/* Alternative Versions */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Alternative Versions</h4>
                <div className="space-y-3">
                  {generatedPost.alternativeVersions.map((version, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Version {index + 1}</Badge>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(version)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setGeneratedPost(prev => prev ? {...prev, caption: version} : null)}
                          >
                            Use This
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{version}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Visual Ideas */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-purple-600" />
                  Visual Ideas
                </h4>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => regenerateSection('visualIdeas')}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="space-y-3">
                {generatedPost.visualIdeas.map((idea, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <span className="text-sm text-gray-700">{idea}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Engagement Tips */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Engagement Tips
              </h4>
              <div className="space-y-3">
                {generatedPost.engagementTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Posting Schedule */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Best Time to Post
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{generatedPost.bestTimeToPost}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Estimated Reach</span>
                    <span className="text-sm font-medium text-gray-900">{generatedPost.estimatedReach}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Export & Share</h4>
              <div className="space-y-3">
                <Button className="w-full" variant="outline" onClick={() => copyToClipboard(generatedPost.caption)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Caption
                </Button>
                <Button className="w-full" variant="outline" onClick={copyFullPost}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Content
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
                <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                  Save to Library
                </Button>
              </div>
            </Card>

            <Button 
              variant="outline" 
              onClick={() => {
                setGeneratedPost(null)
                setActiveVariation(0)
              }}
              className="w-full"
            >
              Create Another Post
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}