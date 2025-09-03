'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Building, Briefcase, TrendingUp } from 'lucide-react'

interface IndustryStepProps {
  industry: string
  onIndustryChange: (value: string) => void
}

const POPULAR_INDUSTRIES = [
  'Technology & Software',
  'E-commerce & Retail',
  'Healthcare & Medical',
  'Financial Services',
  'Real Estate',
  'Marketing & Advertising',
  'Education & Training',
  'Food & Beverage',
  'Manufacturing',
  'Consulting Services',
  'Construction',
  'Entertainment & Media',
  'Travel & Tourism',
  'Non-profit',
  'Professional Services',
  'Beauty & Wellness',
  'Automotive',
  'Agriculture',
  'Energy & Utilities',
  'Transportation & Logistics'
]

export default function IndustryStep({ industry, onIndustryChange }: IndustryStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const filteredIndustries = POPULAR_INDUSTRIES.filter(ind =>
    ind.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectIndustry = (selectedIndustry: string) => {
    onIndustryChange(selectedIndustry)
    setShowCustomInput(false)
  }

  const handleCustomIndustry = () => {
    setShowCustomInput(true)
    onIndustryChange('')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What industry is your business in?
        </h3>
        <p className="text-gray-600">
          This helps us tailor the document content and recommendations specific to your industry.
        </p>
      </div>

      <div className="space-y-4">
        {!showCustomInput ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {filteredIndustries.map((ind) => (
                <Button
                  key={ind}
                  variant={industry === ind ? "default" : "outline"}
                  onClick={() => selectIndustry(ind)}
                  className="justify-start text-left h-auto p-3"
                >
                  <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                  {ind}
                </Button>
              ))}
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleCustomIndustry}
                className="text-blue-600 hover:text-blue-800"
              >
                Don't see your industry? Enter custom industry
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your industry
              </label>
              <Input
                placeholder="e.g., Custom Software Development"
                value={industry}
                onChange={(e) => onIndustryChange(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCustomInput(false)}
              className="w-full"
            >
              Back to industry list
            </Button>
          </div>
        )}

        {industry && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Industry Selected</p>
                <Badge variant="secondary" className="mt-1">
                  {industry}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}