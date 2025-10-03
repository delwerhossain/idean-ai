'use client'

import { Input } from '@/components/ui/input'
import { User, Building2, HelpCircle } from 'lucide-react'

interface BasicInfoStepProps {
  userName: string
  businessName: string
  onUserNameChange: (value: string) => void
  onBusinessNameChange: (value: string) => void
  language: 'en' | 'bn'
}

export default function BasicInfoStep({
  userName,
  businessName,
  onUserNameChange,
  onBusinessNameChange,
  language
}: BasicInfoStepProps) {

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-3">
        {/* User Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            {language === 'en' ? 'Your Name *' : 'আপনার নাম *'}
          </label>
          <Input
            placeholder={language === 'en' ? 'Enter your full name' : 'আপনার পূর্ণ নাম লিখুন'}
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            className="w-full text-base p-3 border-2 border-gray-300 rounded focus:border-blue-500"
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'en' ? 'This will be used for personalization' : 'এটি ব্যক্তিগতকরণের জন্য ব্যবহৃত হবে'}
          </p>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            {language === 'en' ? 'Business Name *' : 'ব্যবসার নাম *'}
            <div className="inline-block ml-2 relative group">
              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-50">
                <div className="font-medium mb-2">💡 {language === 'en' ? 'Tips for Business Name' : 'ব্যবসার নামের জন্য টিপস'}</div>
                <ul className="space-y-1">
                  {language === 'en' ? (
                    <>
                      <li>• Keep it simple and memorable</li>
                      <li>• Consider your target market</li>
                      <li>• Check if domain name is available</li>
                      <li>• Make sure it&apos;s easy to pronounce</li>
                    </>
                  ) : (
                    <>
                      <li>• সহজ এবং স্মরণীয় রাখুন</li>
                      <li>• আপনার টার্গেট মার্কেট বিবেচনা করুন</li>
                      <li>• ডোমেইন নাম পাওয়া যায় কিনা চেক করুন</li>
                      <li>• উচ্চারণ সহজ হওয়া নিশ্চিত করুন</li>
                    </>
                  )}
                </ul>
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </label>

          <Input
            placeholder={language === 'en' ? 'Enter business name' : 'ব্যবসার নাম লিখুন'}
            value={businessName}
            onChange={(e) => onBusinessNameChange(e.target.value)}
            className="w-full text-base p-3 border-2 border-gray-300 rounded focus:border-blue-500"
            maxLength={100}
          />
        </div>
      </div>

      {/* Selected Business Name Display */}
      {businessName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-medium text-green-800 text-sm">{language === 'en' ? 'Business Name Selected' : 'ব্যবসার নাম নির্বাচিত'}</p>
              <p className="text-sm text-green-600">{businessName}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}