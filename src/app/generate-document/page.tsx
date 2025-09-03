'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Download, 
  Share2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  Sparkles,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'

interface GeneratedDocument {
  title: string
  content: string
  type: 'business_plan' | 'executive_summary' | 'marketing_plan'
  status: 'generating' | 'completed' | 'error'
}

const DOCUMENT_TYPES = [
  {
    id: 'business_plan',
    title: 'Business Plan',
    description: 'Comprehensive business plan with market analysis, financial projections, and strategy',
    icon: FileText
  },
  {
    id: 'executive_summary',
    title: 'Executive Summary',
    description: 'Concise overview of your business concept, market, and key success factors',
    icon: FileText
  },
  {
    id: 'marketing_plan',
    title: 'Marketing Strategy',
    description: 'Detailed marketing plan with target audience, channels, and campaigns',
    icon: FileText
  }
]

export default function GenerateDocumentPage() {
  const [selectedDocType, setSelectedDocType] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null)
  const [generationStep, setGenerationStep] = useState('')

  useEffect(() => {
    if (isGenerating && generationProgress < 100) {
      const timer = setTimeout(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + Math.random() * 10 + 5
          
          // Update generation steps based on progress
          if (newProgress < 20) {
            setGenerationStep('Analyzing your business information...')
          } else if (newProgress < 40) {
            setGenerationStep('Processing knowledge base documents...')
          } else if (newProgress < 60) {
            setGenerationStep('Researching industry best practices...')
          } else if (newProgress < 80) {
            setGenerationStep('Generating content sections...')
          } else if (newProgress < 95) {
            setGenerationStep('Reviewing and optimizing content...')
          } else {
            setGenerationStep('Finalizing document...')
          }
          
          return Math.min(newProgress, 100)
        })
      }, 800)
      
      return () => clearTimeout(timer)
    } else if (generationProgress >= 100 && isGenerating) {
      // Simulate document completion
      setTimeout(() => {
        setGeneratedDoc({
          title: getDocumentTitle(selectedDocType),
          content: generateSampleContent(selectedDocType),
          type: selectedDocType as any,
          status: 'completed'
        })
        setIsGenerating(false)
      }, 1000)
    }
  }, [isGenerating, generationProgress, selectedDocType])

  const getDocumentTitle = (docType: string) => {
    const doc = DOCUMENT_TYPES.find(d => d.id === docType)
    return doc?.title || 'Generated Document'
  }

  const generateSampleContent = (docType: string) => {
    // This would be replaced with actual AI-generated content
    const sampleContent = {
      business_plan: `# Business Plan for Your Business

## Executive Summary
Your business represents an innovative approach in the ${localStorage.getItem('industry') || 'technology'} industry, focusing on delivering exceptional value to our target market.

## Market Analysis
The ${localStorage.getItem('industry') || 'technology'} market presents significant opportunities for growth...

## Financial Projections
Based on market research and industry benchmarks, we project the following financial performance...

## Marketing Strategy
Our go-to-market strategy leverages both digital and traditional channels...`,
      
      executive_summary: `# Executive Summary

## Company Overview
${localStorage.getItem('businessName') || 'Your Business'} is positioned to capitalize on emerging opportunities in the ${localStorage.getItem('industry') || 'technology'} sector.

## Market Opportunity
The addressable market size represents a significant opportunity...

## Competitive Advantage
Our unique value proposition differentiates us from competitors through...

## Financial Highlights
Projected revenue growth demonstrates strong business fundamentals...`,
      
      marketing_plan: `# Marketing Strategy & Plan

## Target Market Analysis
Our primary target market consists of...

## Marketing Objectives
- Increase brand awareness by 50% in Q1
- Generate 1000+ qualified leads monthly
- Achieve 25% market share in target segment

## Marketing Channels
### Digital Marketing
- Search Engine Optimization (SEO)
- Pay-per-click advertising (PPC)
- Social media marketing
- Content marketing

### Traditional Marketing
- Industry events and trade shows
- Partner marketing
- Public relations`
    }
    
    return sampleContent[docType as keyof typeof sampleContent] || 'Generated content will appear here...'
  }

  const startGeneration = (docType: string) => {
    setSelectedDocType(docType)
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedDoc(null)
  }

  const goBackToOnboarding = () => {
    window.location.href = '/onboarding'
  }

  if (isGenerating || generatedDoc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {isGenerating ? (
            <Card className="mb-6">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <CardTitle className="text-2xl">Generating Your {getDocumentTitle(selectedDocType)}</CardTitle>
                <p className="text-gray-600">
                  Our AI is creating a customized document based on your business information
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={generationProgress} className="w-full h-3" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{Math.round(generationProgress)}% Complete</p>
                    <p className="text-sm text-blue-600 mt-2">{generationStep}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : generatedDoc && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goBackToOnboarding}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Setup
                </Button>
                <Badge variant="default" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Generated Successfully
                </Badge>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <FileText className="w-6 h-6" />
                        {generatedDoc.title}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        Generated on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg border p-6 max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {generatedDoc.content}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button
                  onClick={() => window.location.href = '/generate-document'}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate Another Document
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Document Type</h1>
          <p className="text-lg text-gray-600">
            Select the type of document you'd like to generate based on your business information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {DOCUMENT_TYPES.map((docType) => {
            const IconComponent = docType.icon
            return (
              <Card
                key={docType.id}
                className="cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-300"
                onClick={() => startGeneration(docType.id)}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{docType.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">
                    {docType.description}
                  </p>
                  <Button className="w-full">
                    Generate {docType.title}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Generation Time</h3>
                <p className="text-blue-700 text-sm">
                  Document generation typically takes 2-5 minutes depending on complexity and the amount of 
                  information provided. Our AI analyzes your business details, industry data, and knowledge 
                  base to create comprehensive, tailored content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={goBackToOnboarding}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Business Setup
          </Button>
        </div>
      </div>
    </div>
  )
}