'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Facebook, 
  Loader2, 
  Copy, 
  Download, 
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  Globe
} from 'lucide-react'
import { generateToolContent, FacebookAdContent } from '@/lib/aiService'

interface FormData {
  adObjective: string
  targetAudience: string
  painPoint: string
  solution: string
  budget: string
  callToAction: string
  language: 'en' | 'bn'
}

interface BusinessContext {
  userName: string
  businessName: string
  industry: string
  website: string
  businessContext: string
  businessOverview?: string
}

export default function FacebookAdBuilderPage() {
  const [formData, setFormData] = useState<FormData>({
    adObjective: '',
    targetAudience: '',
    painPoint: '',
    solution: '',
    budget: '',
    callToAction: '',
    language: 'en'
  })
  
  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    userName: '',
    businessName: '',
    industry: '',
    website: '',
    businessContext: '',
    businessOverview: ''
  })
  
  const [generatedAd, setGeneratedAd] = useState<FacebookAdContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [step, setStep] = useState(1)

  // Load business context on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userName = localStorage.getItem('userName') || ''
      const businessName = localStorage.getItem('businessName') || 'Your Business'
      const industry = localStorage.getItem('industry') || ''
      const website = localStorage.getItem('website') || ''
      const businessContextData = localStorage.getItem('businessContext') || ''
      const businessOverview = localStorage.getItem('businessOverview') || ''

      setBusinessContext({
        userName,
        businessName,
        industry,
        website,
        businessContext: businessContextData,
        businessOverview
      })
    }
  }, [])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await generateToolContent({
        tool: 'facebook-ad-builder',
        inputs: formData as unknown as Record<string, unknown>,
        businessContext: {
          clientName: businessContext.userName,
          businessName: businessContext.businessName,
          website: businessContext.website,
          industry: businessContext.industry,
          additionalInfo: businessContext.businessContext,
          businessOverview: businessContext.businessOverview,
          language: formData.language
        },
        language: formData.language,
        provider: 'openai'
      })

      setGeneratedAd(result as FacebookAdContent)
      setStep(2)
    } catch (error) {
      console.error('Error generating Facebook ad:', error)
      alert('Failed to generate Facebook ad. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const handleStartOver = () => {
    setGeneratedAd(null)
    setStep(1)
    setFormData({
      adObjective: '',
      targetAudience: '',
      painPoint: '',
      solution: '',
      budget: '',
      callToAction: '',
      language: 'en'
    })
  }

  const isFormValid = formData.adObjective && formData.targetAudience && formData.painPoint && formData.solution

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/tools'}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Facebook className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Facebook Ad Builder
              </h1>
              <p className="text-gray-600">
                Create high-converting Facebook ads with guided workflow: Idea → Hook → Body → CTA → Caption
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Beginner
            </Badge>
            <span className="text-sm text-gray-500">8-12 minutes</span>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <Select value={formData.language} onValueChange={(value: 'en' | 'bn') => handleInputChange('language', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">বাংলা</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {step === 1 && (
          <>
            {/* Business Context Display */}
            {businessContext.businessName && (
              <Card className="mb-8 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formData.language === 'bn' 
                          ? `${businessContext.businessName} এর জন্য বিজ্ঞাপন তৈরি করা হবে`
                          : `Creating ad for ${businessContext.businessName}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {businessContext.industry} • {businessContext.website}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {formData.language === 'bn' ? 'আপনার বিজ্ঞাপনের তথ্য দিন' : 'Tell us about your ad'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="adObjective">
                      {formData.language === 'bn' ? 'বিজ্ঞাপনের উদ্দেশ্য' : 'Ad Objective'}
                    </Label>
                    <Select value={formData.adObjective} onValueChange={(value) => handleInputChange('adObjective', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={formData.language === 'bn' ? 'উদ্দেশ্য নির্বাচন করুন' : 'Select objective'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">
                          {formData.language === 'bn' ? 'সচেতনতা বৃদ্ধি' : 'Brand Awareness'}
                        </SelectItem>
                        <SelectItem value="traffic">
                          {formData.language === 'bn' ? 'ওয়েবসাইট ভিজিট' : 'Drive Traffic'}
                        </SelectItem>
                        <SelectItem value="leads">
                          {formData.language === 'bn' ? 'লিড জেনারেশন' : 'Generate Leads'}
                        </SelectItem>
                        <SelectItem value="conversions">
                          {formData.language === 'bn' ? 'বিক্রয় বৃদ্ধি' : 'Drive Sales'}
                        </SelectItem>
                        <SelectItem value="engagement">
                          {formData.language === 'bn' ? 'এনগেজমেন্ট' : 'Engagement'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">
                      {formData.language === 'bn' ? 'দৈনিক বাজেট (ঐচ্ছিক)' : 'Daily Budget (Optional)'}
                    </Label>
                    <Input
                      id="budget"
                      placeholder={formData.language === 'bn' ? 'যেমনঃ ৫০০ টাকা' : 'e.g., $10'}
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">
                    {formData.language === 'bn' ? 'টার্গেট অডিয়েন্স' : 'Target Audience'}
                  </Label>
                  <Textarea
                    id="targetAudience"
                    placeholder={formData.language === 'bn' 
                      ? 'কারা আপনার কাস্টমার? বয়স, আগ্রহ, অবস্থান উল্লেখ করুন'
                      : 'Who are your ideal customers? Include age, interests, location, etc.'
                    }
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="painPoint">
                    {formData.language === 'bn' ? 'গ্রাহকদের সমস্যা' : 'Customer Pain Point'}
                  </Label>
                  <Textarea
                    id="painPoint"
                    placeholder={formData.language === 'bn'
                      ? 'আপনার গ্রাহকরা কী সমস্যায় ভুগছেন? কী চ্যালেঞ্জ মোকাবেলা করছেন?'
                      : 'What problem do your customers face? What challenges are they struggling with?'
                    }
                    value={formData.painPoint}
                    onChange={(e) => handleInputChange('painPoint', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution">
                    {formData.language === 'bn' ? 'আপনার সমাধান' : 'Your Solution'}
                  </Label>
                  <Textarea
                    id="solution"
                    placeholder={formData.language === 'bn'
                      ? 'আপনার পণ্য/সেবা কীভাবে এই সমস্যার সমাধান করে?'
                      : 'How does your product/service solve this problem?'
                    }
                    value={formData.solution}
                    onChange={(e) => handleInputChange('solution', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callToAction">
                    {formData.language === 'bn' ? 'কল টু অ্যাকশন' : 'Call to Action'}
                  </Label>
                  <Select value={formData.callToAction} onValueChange={(value) => handleInputChange('callToAction', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={formData.language === 'bn' ? 'CTA নির্বাচন করুন' : 'Select CTA'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learn_more">
                        {formData.language === 'bn' ? 'আরও জানুন' : 'Learn More'}
                      </SelectItem>
                      <SelectItem value="shop_now">
                        {formData.language === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}
                      </SelectItem>
                      <SelectItem value="get_quote">
                        {formData.language === 'bn' ? 'কোটেশন নিন' : 'Get Quote'}
                      </SelectItem>
                      <SelectItem value="contact_us">
                        {formData.language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                      </SelectItem>
                      <SelectItem value="sign_up">
                        {formData.language === 'bn' ? 'সাইন আপ করুন' : 'Sign Up'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={!isFormValid || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {formData.language === 'bn' ? 'বিজ্ঞাপন তৈরি হচ্ছে...' : 'Generating Ad...'}
                    </>
                  ) : (
                    <>
                      <Facebook className="w-4 h-4 mr-2" />
                      {formData.language === 'bn' ? 'বিজ্ঞাপন তৈরি করুন' : 'Generate Facebook Ad'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {step === 2 && generatedAd && (
          <>
            {/* Generated Ad Results */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {formData.language === 'bn' ? 'আপনার ফেসবুক বিজ্ঞাপন' : 'Your Facebook Ad'}
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleStartOver}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {formData.language === 'bn' ? 'নতুন করে শুরু' : 'Start Over'}
                  </Button>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    {formData.language === 'bn' ? 'ডাউনলোড' : 'Export'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hook */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      {formData.language === 'bn' ? 'হুক (আকর্ষণীয় শুরু)' : 'Hook (Attention Grabber)'}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopy(generatedAd.hook)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {generatedAd.hook}
                    </p>
                  </CardContent>
                </Card>

                {/* Body */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      {formData.language === 'bn' ? 'মূল বার্তা' : 'Main Message'}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopy(generatedAd.body)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {generatedAd.body}
                    </p>
                  </CardContent>
                </Card>

                {/* CTA */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      {formData.language === 'bn' ? 'কল টু অ্যাকশন' : 'Call to Action'}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopy(generatedAd.cta)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {generatedAd.cta}
                    </p>
                  </CardContent>
                </Card>

                {/* Caption */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      {formData.language === 'bn' ? 'পোস্ট ক্যাপশন' : 'Post Caption'}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopy(generatedAd.caption)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {generatedAd.caption}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Complete Ad Copy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {formData.language === 'bn' ? 'সম্পূর্ণ বিজ্ঞাপন' : 'Complete Ad Copy'}
                    <Button 
                      variant="outline"
                      onClick={() => handleCopy(`${generatedAd.hook}\n\n${generatedAd.body}\n\n${generatedAd.cta}\n\n${generatedAd.caption}`)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {formData.language === 'bn' ? 'সব কপি করুন' : 'Copy All'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          {formData.language === 'bn' ? 'হুক:' : 'Hook:'}
                        </span>
                        <p className="text-gray-900 mt-1">{generatedAd.hook}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          {formData.language === 'bn' ? 'মূল বার্তা:' : 'Body:'}
                        </span>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{generatedAd.body}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          {formData.language === 'bn' ? 'CTA:' : 'Call to Action:'}
                        </span>
                        <p className="text-gray-900 mt-1">{generatedAd.cta}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          {formData.language === 'bn' ? 'ক্যাপশন:' : 'Caption:'}
                        </span>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{generatedAd.caption}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}