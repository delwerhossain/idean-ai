'use client'

import { Input } from '@/components/ui/input'
import { Globe, ExternalLink, HelpCircle } from 'lucide-react'

interface WebsiteStepProps {
  website: string
  onWebsiteChange: (value: string) => void
  language: 'en' | 'bn'
}

export default function WebsiteStep({ website, onWebsiteChange, language }: WebsiteStepProps) {
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
          {language === 'en' ? 'Do you have a website?' : 'আপনার কি ওয়েবসাইট আছে?'}
          <div className="relative group">
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-50">
              <div className="font-medium mb-2">{language === 'en' ? 'Why do we ask for your website?' : 'আমরা কেন আপনার ওয়েবসাইট জানতে চাই?'}</div>
              <ul className="space-y-1">
                {language === 'en' ? (
                  <>
                    <li>• Better understand your brand and positioning</li>
                    <li>• Analyze your current messaging and tone</li>
                    <li>• Create more relevant and targeted documents</li>
                    <li>• Ensure consistency with your existing content</li>
                  </>
                ) : (
                  <>
                    <li>• আপনার ব্র্যান্ড এবং অবস্থান আরো ভালোভাবে বুঝতে</li>
                    <li>• আপনার বর্তমান বার্তা এবং টোন বিশ্লেষণ করতে</li>
                    <li>• আরো প্রাসঙ্গিক এবং লক্ষ্যবস্তু দস্তাবেজ তৈরি করতে</li>
                    <li>• আপনার বিদ্যমান কন্টেন্টের সাথে সামঞ্জস্য নিশ্চিত করতে</li>
                  </>
                )}
              </ul>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </h3>
        <p className="text-gray-600">
          {language === 'en' ? 'Share your website URL if you have one. This is optional but helps iDEAN AI understand your business better.' : 'আপনার ওয়েবসাইট URL শেয়ার করুন যদি আপনার থাকে। এটি ঐচ্ছিক কিন্তু iDEAN AI কে আপনার ব্যবসা আরো ভালোভাবে বুঝতে সাহায্য করে।'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'en' ? 'Website URL (Optional)' : 'ওয়েবসাইট ঠিকানা (ঐচ্ছিক)'}
          </label>
          <Input
            placeholder={language === 'en' ? 'e.g., yourcompany.com or https://yourcompany.com' : 'যেমন: yourcompany.com বা https://yourcompany.com'}
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            className={`w-full text-base p-3 border-2 border-gray-300 rounded focus:border-blue-500 ${!isValidUrl(website) && website ? 'border-red-300' : ''}`}
            maxLength={2048}
          />
          {!isValidUrl(website) && website && (
            <p className="text-xs text-red-600 mt-1">
              {language === 'en' ? 'Please enter a valid website URL' : 'অনুগ্রহ করে একটি বৈধ ওয়েবসাইট URL দিন'}
            </p>
          )}
        </div>

        {website && isValidUrl(website) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">{language === 'en' ? 'Website Added' : 'ওয়েবসাইট যোগ করা হয়েছে'}</p>
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

      </div>
    </div>
  )
}