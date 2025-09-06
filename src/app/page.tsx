'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Target, Rocket } from 'lucide-react'

export default function Home() {
  useEffect(() => {
    // Auto-redirect to onboarding for first-time users
    // In a real app, you'd check authentication and user state here
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')
    if (!hasCompletedOnboarding) {
      // Uncomment for auto-redirect:
      // window.location.href = '/dashboard/onboarding'
    }
  }, [])

  const startOnboarding = () => {
    window.location.href = '/dashboard/onboarding'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">iD</span>
              </div>
              <span className="font-bold text-xl text-gray-900">iDEAN AI</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
                Features
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </Button>
              <Button onClick={startOnboarding} className="bg-gray-900 hover:bg-gray-800 text-white font-medium">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
              AI-powered business strategy platform
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Transform business ideas into actionable strategies with proven frameworks.
            </p>
            <Button
              onClick={startOnboarding}
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-base font-medium"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Business dashboard"
              className="w-full h-64 md:h-72 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategy</h3>
            <p className="text-gray-600">Proven business frameworks</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Execution</h3>
            <p className="text-gray-600">Marketing tools and campaigns</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
            <p className="text-gray-600">AI-powered content creation</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-semibold text-white mb-6">
            Ready to get started?
          </h2>
          <Button
            onClick={startOnboarding}
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-base font-medium"
          >
            Start Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
