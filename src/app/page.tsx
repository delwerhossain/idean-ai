'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Sparkles, FileText, Users, Zap } from 'lucide-react'

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
    window.location.href = '/onboarding'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <Sparkles className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                iDEAN AI
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your business ideas into professional documentation with AI-powered 
              intelligence. Create comprehensive business plans, marketing strategies, and more in minutes.
            </p>
            <Button
              onClick={startOnboarding}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Free to start • No credit card required • 5-minute setup
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How iDEAN AI Works
          </h2>
          <p className="text-lg text-gray-600">
            Simple 3-step process to generate professional business documents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">1. Share Your Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Tell us about your business, industry, and goals through our guided questionnaire
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">2. AI Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Our advanced AI analyzes your information and creates tailored content for your industry
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">3. Get Your Document</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Download professional documents ready for investors, partners, or internal planning
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Business Ideas?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of entrepreneurs who trust iDEAN AI to create their business documentation
          </p>
          <Button
            onClick={startOnboarding}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Start Your Free Business Plan
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
