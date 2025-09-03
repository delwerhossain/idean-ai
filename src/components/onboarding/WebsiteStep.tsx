'use client'

import { Input } from '@/components/ui/input'
import { Globe, ExternalLink } from 'lucide-react'

interface WebsiteStepProps {
  website: string
  onWebsiteChange: (value: string) => void
}

export default function WebsiteStep({ website, onWebsiteChange }: WebsiteStepProps) {
  const isValidUrl = (url: string) => {
    if (!url) return true // Empty is valid since it's optional
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const formatUrl = (url: string) => {
    if (!url) return ''
    return url.startsWith('http') ? url : `https://${url}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Do you have a website?
        </h3>
        <p className="text-gray-600">
          Share your website URL if you have one. This is optional but helps us understand your business better.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL (Optional)
          </label>
          <Input
            placeholder="e.g., yourcompany.com or https://yourcompany.com"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            className={`w-full ${!isValidUrl(website) && website ? 'border-red-300' : ''}`}
          />
          {!isValidUrl(website) && website && (
            <p className="text-xs text-red-600 mt-1">
              Please enter a valid website URL
            </p>
          )}
        </div>

        {website && isValidUrl(website) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">Website Added</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-blue-600">{formatUrl(website)}</p>
                  <a
                    href={formatUrl(website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Why do we ask for your website?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Better understand your brand and positioning</li>
            <li>• Analyze your current messaging and tone</li>
            <li>• Create more relevant and targeted documents</li>
            <li>• Ensure consistency with your existing content</li>
          </ul>
        </div>
      </div>
    </div>
  )
}