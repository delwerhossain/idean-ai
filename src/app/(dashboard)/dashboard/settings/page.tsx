'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  User,
  Bell,
  Save,
  Crown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import UpgradeModal from '@/components/modals/UpgradeModal'
import { ideanApi } from '@/lib/api/idean-api'

interface UserSettings {
  name: string
  email: string
  photoURL: string
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

// Skeleton Loading Component
function SettingsSkeletonLoader() {
  const shimmerClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200"

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className={`h-8 rounded w-48 mb-2 ${shimmerClasses}`}></div>
          <div className={`h-4 rounded w-64 ${shimmerClasses}`}></div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`h-6 rounded-full w-20 ${shimmerClasses}`}></div>
          <div className={`h-10 rounded w-24 ${shimmerClasses}`}></div>
        </div>
      </div>

      {/* Profile Card Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-5 h-5 rounded ${shimmerClasses}`}></div>
          <div className={`h-6 rounded w-40 ${shimmerClasses}`}></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index}>
              <div className={`h-4 rounded w-24 mb-2 ${shimmerClasses}`}></div>
              <div className={`h-10 rounded w-full ${shimmerClasses}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Card Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-5 h-5 rounded ${shimmerClasses}`}></div>
          <div className={`h-6 rounded w-32 ${shimmerClasses}`}></div>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className={`h-4 rounded w-48 mb-1 ${shimmerClasses}`}></div>
                <div className={`h-3 rounded w-32 ${shimmerClasses}`}></div>
              </div>
              <div className={`w-4 h-4 rounded ${shimmerClasses}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Skeleton */}
      <div className="flex justify-end">
        <div className={`h-10 rounded w-32 ${shimmerClasses}`}></div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    photoURL: '',
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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('free')

  const loadSettings = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch user profile from API
      const response = await ideanApi.user.getMe()

      if (response) {
        const userData = response
        console.log('✅ User profile loaded:', userData)

        setSettings({
          name: userData.name || '',
          email: userData.email || '',
          photoURL: userData.photoURL || '',
          language: userData.business?.language || 'en',
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

        // Set current plan based on business module selection
        if (userData.business?.module_select) {
          setCurrentPlan(userData.business.module_select)
        }
      }

    } catch (err: any) {
      console.error('Failed to load user settings:', err)
      setError('Failed to load user settings. Please try again.')

      // Fallback to user auth data if API fails
      setSettings(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        photoURL: user.photoURL || ''
      }))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async () => {
    if (!user) {
      setError('Please sign in to save settings')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Update user profile via API
      const updateData = {
        name: settings.name,
        photoURL: settings.photoURL
      }

      const response = await ideanApi.user.updateMe(updateData)

      if (response) {
        console.log('✅ User profile updated successfully')
        setSuccess('Settings saved successfully!')

        // Save preferences to localStorage (since they're not in the API yet)
        localStorage.setItem('userNotificationPreferences', JSON.stringify(settings.notifications))
        localStorage.setItem('userAppPreferences', JSON.stringify(settings.preferences))
        localStorage.setItem('userLanguage', settings.language)

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      }

    } catch (err: any) {
      console.error('Failed to save settings:', err)
      setError(err.message || 'Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (field: string, value: string | boolean | number) => {
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
    return <SettingsSkeletonLoader />
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {getPlanBadge(currentPlan)}
          <Button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-idean-navy hover:bg-idean-navy-dark text-sm"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </Card>
      )}

      {success && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        </Card>
      )}

      {/* Profile Settings */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <User className="w-5 h-5 text-idean-navy" />
          <h2 className="text-lg sm:text-xl font-semibold">Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => updateSetting('name', e.target.value)}
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateSetting('email', e.target.value)}
              placeholder="Enter your email"
              disabled={true}
              className="mt-1 bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="language" className="text-sm font-medium">Language</Label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-idean-navy bg-white"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা (Bangla)</option>
            </select>
          </div>
        </div>
      </Card>


      {/* Notification Settings */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Bell className="w-5 h-5 text-idean-navy" />
          <h2 className="text-lg sm:text-xl font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm sm:text-base">Email Notifications</h3>
              <p className="text-xs sm:text-sm text-gray-600">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => updateNestedSetting('notifications', 'email', e.target.checked)}
              className="h-4 w-4 text-idean-navy focus:ring-idean-navy rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm sm:text-base">Marketing Communications</h3>
              <p className="text-xs sm:text-sm text-gray-600">Receive product updates and tips</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.marketing}
              onChange={(e) => updateNestedSetting('notifications', 'marketing', e.target.checked)}
              className="h-4 w-4 text-idean-navy focus:ring-idean-navy rounded"
            />
          </div>
        </div>
      </Card>

   

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={saving || !user}
          className="px-6 sm:px-8 bg-idean-navy hover:bg-idean-navy-dark"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Save Settings</span>
              <span className="sm:hidden">Save</span>
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