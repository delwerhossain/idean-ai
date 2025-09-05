'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Zap, Globe, Target, Rocket } from 'lucide-react'

export default function Home() {
  useEffect(() => {
    // Auto-redirect to onboarding for first-time users
    // In a real app, you'd check authentication and user state here
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')
    if (!hasCompletedOnboarding) {
      // Uncomment for auto-redirect:
      // window.location.href = '/onboarding'
    }
  }, [])

  const startOnboarding = () => {
    window.location.href = '/dashboard'
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Features
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Button>
              <Button onClick={startOnboarding} className="bg-blue-600 hover:bg-blue-700 text-white">
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
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
              AI-powered business{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                strategy platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your business ideas into actionable strategies with 18+ proven frameworks. 
              Built for entrepreneurs who need results, not just plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                onClick={startOnboarding}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Start Building for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-4 text-lg font-medium rounded-full border-gray-300"
              >
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Free forever • No credit card required • 2-minute setup
            </p>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-full">
            <div className="w-full h-full bg-gradient-to-b from-blue-100/20 to-transparent rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Product Demo Section */}
      <div className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See iDEAN AI in Action
            </h2>
            <p className="text-lg text-gray-600">
              Professional business strategy tools built for real entrepreneurs
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Business strategy dashboard interface"
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            The complete business strategy toolkit
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From ideation to execution, everything you need to build, launch, and grow your business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Strategy & Positioning</h3>
            <p className="text-gray-600 leading-relaxed">
              Discover profitable market opportunities with proven frameworks like Blue Ocean Strategy, 
              Niche Finder, and Category Design. Build a strong foundation for sustainable growth.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Execution & Growth</h3>
            <p className="text-gray-600 leading-relaxed">
              Turn strategies into action with marketing funnels, campaign planners, and growth hacking tools. 
              Build systems that scale with your business and drive measurable results.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Content & Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Create high-converting content with AI-powered tools for ads, social media, and video scripts. 
              Track performance and optimize based on real data insights.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why leading entrepreneurs choose iDEAN AI
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">10x Faster Execution</h3>
              <p className="text-gray-600">Transform weeks of planning into minutes of focused action with AI-powered frameworks.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Proven Frameworks</h3>
              <p className="text-gray-600">Based on methodologies from leading business schools and growth companies.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Language Support</h3>
              <p className="text-gray-600">Create content in Bengali and English to reach your target audience effectively.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to accelerate your business?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who have transformed their business strategies with iDEAN AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={startOnboarding}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Start Building for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 text-lg font-semibold rounded-full"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            No credit card required • Free forever plan available
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">iD</span>
              </div>
              <span className="font-bold text-xl">iDEAN AI</span>
            </div>
            <p className="text-gray-400 mb-8">
              AI-powered business strategy platform for entrepreneurs
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500 text-sm">
                © 2024 iDEAN AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
