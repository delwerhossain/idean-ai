'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Globe, 
  Save, 
  Crown,
  CreditCard,
  AlertTriangle
} from 'lucide-react'
import UpgradeModal from '@/components/modals/UpgradeModal'

interface UserSettings {
  name: string
  email: string
  businessName: string
  industry: string
  website: string
  language: string
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  preferences: {
    aiCreditsReminder: boolean
    weeklyReport: boolean
    frameworkSuggestions: boolean
  }
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    businessName: '',
    industry: '',
    website: '',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      marketing: false
    },
    preferences: {
      aiCreditsReminder: true,
      weeklyReport: true,
      frameworkSuggestions: true
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('free')

  useEffect(() => {
    loadSettings()
  }, [session])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Load settings from localStorage and session
      const savedSettings = localStorage.getItem('userSettings')
      const businessName = localStorage.getItem('businessName') || ''
      const industry = localStorage.getItem('industry') || ''
      const savedPlan = localStorage.getItem('currentPlan') || 'free'
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } else if (session?.user) {
        // Initialize with session data
        setSettings(prev => ({
          ...prev,
          name: session.user.name || '',
          email: session.user.email || '',
          businessName: businessName,
          industry: industry
        }))
      }
      
      setCurrentPlan(savedPlan)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings))
      localStorage.setItem('businessName', settings.businessName)
      localStorage.setItem('industry', settings.industry)
      
      // TODO: When backend API is ready, sync to database
      /*
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      */
      
      // Update session if name changed
      if (session?.user && settings.name !== session.user.name) {
        await update({
          ...session,
          user: { ...session.user, name: settings.name }
        })
      }
      
      console.log('✅ Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedSetting = (category: 'notifications' | 'preferences', field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'standard':
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Standard Plan</span>
      case 'pro':
        return <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Pro Plan</span>
      case 'free':
      default:
        return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Free Plan</span>
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {getPlanBadge(currentPlan)}
          <Button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade
          </Button>
        </div>
      </div>

      {/* Profile Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Profile Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => updateSetting('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateSetting('email', e.target.value)}
              placeholder="Enter your email"
              disabled={!!session?.user?.email}
            />
            {session?.user?.email && (
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা (Bangla)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Business Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Business Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={settings.businessName}
              onChange={(e) => updateSetting('businessName', e.target.value)}
              placeholder="Enter your business name"
            />
          </div>
          
          <div>
            <Label htmlFor="industry">Industry</Label>
            <select
              id="industry"
              value={settings.industry}
              onChange={(e) => updateSetting('industry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Industry</option>
              <option value="technology">Technology</option>
              <option value="ecommerce">E-commerce</option>
              <option value="saas">SaaS</option>
              <option value="consulting">Consulting</option>
              <option value="agency">Agency</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="retail">Retail</option>
              <option value="food">Food & Beverage</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="website">Website URL (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={settings.website}
              onChange={(e) => updateSetting('website', e.target.value)}
              placeholder="https://your-website.com"
            />
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => updateNestedSetting('notifications', 'email', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Marketing Communications</h3>
              <p className="text-sm text-gray-600">Receive product updates and tips</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.marketing}
              onChange={(e) => updateNestedSetting('notifications', 'marketing', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* AI Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">AI Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">AI Credits Reminder</h3>
              <p className="text-sm text-gray-600">Get notified when credits are running low</p>
            </div>
            <input
              type="checkbox"
              checked={settings.preferences.aiCreditsReminder}
              onChange={(e) => updateNestedSetting('preferences', 'aiCreditsReminder', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Weekly Reports</h3>
              <p className="text-sm text-gray-600">Receive weekly performance summaries</p>
            </div>
            <input
              type="checkbox"
              checked={settings.preferences.weeklyReport}
              onChange={(e) => updateNestedSetting('preferences', 'weeklyReport', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Framework Suggestions</h3>
              <p className="text-sm text-gray-600">Get personalized framework recommendations</p>
            </div>
            <input
              type="checkbox"
              checked={settings.preferences.frameworkSuggestions}
              onChange={(e) => updateNestedSetting('preferences', 'frameworkSuggestions', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings}
          disabled={saving}
          className="px-8"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
      />
    </div>
  )
}