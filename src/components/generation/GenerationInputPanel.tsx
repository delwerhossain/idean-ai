'use client'

import { useState } from 'react'
import { ArrowLeft, Sparkles, Settings, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Framework {
  id: string
  name: string
  description?: string
  input_fields?: string[]
  dropdown?: string[]
  system_prompt: string
  user_starting_prompt?: string
}

interface GenerationInputPanelProps {
  framework: Framework
  inputs: Record<string, any>
  generationOptions: {
    tone: string
    length: string
    audience: string
    temperature: number
    maxTokens: number
    includeBusinessContext: boolean
    saveDocument: boolean
  }
  currentStep: 'input' | 'generating' | 'editing'
  isGenerating: boolean
  error: string | null
  onInputChange: (inputs: Record<string, any>) => void
  onOptionsChange: (options: any) => void
  onGenerate: () => void
  onRetry?: () => void
  onBack?: () => void
}

export function GenerationInputPanel({
  framework,
  inputs,
  generationOptions,
  currentStep,
  isGenerating,
  error,
  onInputChange,
  onOptionsChange,
  onGenerate,
  onRetry,
  onBack
}: GenerationInputPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState<'inputs' | 'options'>('inputs')

  const handleInputChange = (field: string, value: string) => {
    onInputChange({ ...inputs, [field]: value })
  }

  const handleOptionChange = (field: string, value: any) => {
    onOptionsChange({ ...generationOptions, [field]: value })
  }

  const getFieldLabel = (field: string): string => {
    const labelMap: Record<string, string> = {
      productName: 'Product/Service Name',
      targetAudience: 'Target Audience',
      mainBenefit: 'Main Benefit',
      painPoint: 'Pain Point',
      ctaText: 'Call to Action',
      businessName: 'Business Name',
      industry: 'Industry',
      goals: 'Goals & Objectives',
      challenges: 'Current Challenges',
      brandPersonality: 'Brand Personality',
      additionalInstructions: 'Additional Instructions'
    }
    return labelMap[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
  }

  const getFieldPlaceholder = (field: string): string => {
    const placeholderMap: Record<string, string> = {
      productName: 'e.g., AI-powered productivity software',
      targetAudience: 'e.g., Small business owners, 25-45 years old',
      mainBenefit: 'e.g., Save 10 hours per week on admin tasks',
      painPoint: 'e.g., Struggling with manual data entry and reporting',
      ctaText: 'e.g., Start Free Trial, Get Quote, Learn More',
      businessName: 'Your business name',
      industry: 'e.g., Technology, Healthcare, Finance',
      goals: 'What do you want to achieve?',
      challenges: 'What obstacles are you facing?',
      brandPersonality: 'e.g., Professional, Friendly, Innovative'
    }
    return placeholderMap[field] || `Enter ${getFieldLabel(field).toLowerCase()}`
  }

  const isFormValid = () => {
    const requiredFields = framework.input_fields?.slice(0, 3) || [] // First 3 fields are required
    return requiredFields.every(field => {
      const fieldName = field.includes(':') ? field.split(':')[0] : field
      return inputs[fieldName]?.trim()
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 bg-white">
        {/* Back Button */}
        {onBack && (
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-600 hover:text-gray-900 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              currentStep === 'input'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className={`text-xs font-medium ${
              currentStep === 'input' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Input
            </span>
          </div>

          {/* Connector */}
          <div className="flex-1 h-px bg-gray-300 max-w-8" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              currentStep === 'generating'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className={`text-xs font-medium ${
              currentStep === 'generating' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Gen
            </span>
          </div>

          {/* Connector */}
          <div className="flex-1 h-px bg-gray-300 max-w-8" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              currentStep === 'editing'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <span className={`text-xs font-medium ${
              currentStep === 'editing' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Edit
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inputs')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all relative ${
            activeTab === 'inputs'
              ? 'text-gray-900 bg-white border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <span className="hidden sm:inline">Input Fields</span>
          <span className="sm:hidden">Inputs</span>
        </button>
        <button
          onClick={() => setActiveTab('options')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all relative ${
            activeTab === 'options'
              ? 'text-gray-900 bg-white border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <span className="hidden sm:inline">Options</span>
          <span className="sm:hidden">Opts</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-32 bg-gray-50">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-red-600">{error}</p>
              </div>
              {onRetry && !isGenerating && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-100 shrink-0"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'inputs' && (
          <div className="space-y-6">
            {/* Input Fields */}
            {framework.input_fields?.map((field) => {
              const fieldName = field.includes(':') ? field.split(':')[0] : field
              const fieldType = field.includes(':') ? field.split(':')[1] : 'string'

              if (fieldName === 'additionalInstructions') {
                return (
                  <div key={fieldName} className="space-y-2">
                    <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
                      {getFieldLabel(fieldName)} (Optional)
                    </Label>
                    <Textarea
                      id={fieldName}
                      placeholder="Any specific requirements or additional context..."
                      className="min-h-24 resize-none"
                      value={inputs[fieldName] || ''}
                      onChange={(e) => handleInputChange(fieldName, e.target.value)}
                    />
                  </div>
                )
              }

              return (
                <div key={fieldName} className="space-y-2">
                  <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
                    {getFieldLabel(fieldName)}
                    {framework.input_fields?.indexOf(field) !== undefined && framework.input_fields.indexOf(field) < 3 && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id={fieldName}
                    type={fieldType === 'int' || fieldType === 'float' ? 'number' : 'text'}
                    placeholder={getFieldPlaceholder(fieldName)}
                    value={inputs[fieldName] || ''}
                    onChange={(e) => handleInputChange(fieldName, e.target.value)}
                    className="w-full"
                  />
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'options' && (
          <div className="space-y-6">
            {/* Basic Options */}
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Style & Tone</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Tone</Label>
                  <Select value={generationOptions.tone} onValueChange={(value) => handleOptionChange('tone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Length</Label>
                  <Select value={generationOptions.length} onValueChange={(value) => handleOptionChange('length', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (100-300 words)</SelectItem>
                      <SelectItem value="medium">Medium (300-600 words)</SelectItem>
                      <SelectItem value="long">Long (600+ words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Target Audience</Label>
                  <Select value={generationOptions.audience} onValueChange={(value) => handleOptionChange('audience', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business Decision Makers</SelectItem>
                      <SelectItem value="technical">Technical Professionals</SelectItem>
                      <SelectItem value="general">General Consumers</SelectItem>
                      <SelectItem value="marketing">Marketing Professionals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Advanced Options */}
            <Card className="p-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="font-medium text-gray-900">Advanced Settings</h3>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Creativity Level: {generationOptions.temperature}
                    </Label>
                    <Slider
                      value={[generationOptions.temperature]}
                      onValueChange={([value]) => handleOptionChange('temperature', value)}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Max Length: {generationOptions.maxTokens} tokens
                    </Label>
                    <Slider
                      value={[generationOptions.maxTokens]}
                      onValueChange={([value]) => handleOptionChange('maxTokens', value)}
                      min={500}
                      max={4000}
                      step={100}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Include Business Context</Label>
                      <p className="text-xs text-gray-500">Use your uploaded business documents</p>
                    </div>
                    <Switch
                      checked={generationOptions.includeBusinessContext}
                      onCheckedChange={(checked) => handleOptionChange('includeBusinessContext', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Save as Document</Label>
                      <p className="text-xs text-gray-500">Save generated content for future reference</p>
                    </div>
                    <Switch
                      checked={generationOptions.saveDocument}
                      onCheckedChange={(checked) => handleOptionChange('saveDocument', checked)}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Generate Button - Fixed at Bottom */}
      <div className="sticky bottom-0 p-4 sm:p-6 bg-white border-t border-gray-200 shadow-lg z-10">
        <Button
          onClick={onGenerate}
          disabled={!isFormValid() || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
        {!isFormValid() && (
          <p className="text-xs text-red-500 mt-2 text-center">
            Please fill in all required fields (marked with *)
          </p>
        )}
      </div>
    </div>
  )
}


