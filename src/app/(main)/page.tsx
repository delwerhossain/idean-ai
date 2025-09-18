'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Target, Rocket } from 'lucide-react'
import Link from 'next/link'

export default function Home() {

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <img
                src="/ideanai_logo.png"
                alt="iDEAN AI"
                className="h-10 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard/onboarding">
                <Button className="bg-idean-navy hover:bg-idean-navy-dark text-idean-white font-medium">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered Business Strategy Platform
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Transform business ideas into actionable strategies with proven frameworks from iMarketing, GrowthX, and iMBA programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/onboarding">
                <Button
                  size="lg"
                  className="bg-idean-navy hover:bg-idean-navy-dark text-white px-8 py-4 text-lg font-medium"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Transform Ideas into Strategies
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built on proven frameworks from iMarketing, GrowthX, and iMBA programs.
              Get actionable business strategies, not generic advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <PenTool className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Brand & Content Studio</h3>
              <p className="text-gray-600 mb-4">
                Create marketing content, copy, and campaigns with AI assistance using proven frameworks.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• AI-powered copywriting</li>
                <li>• Content templates</li>
                <li>• Campaign generation</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <Building className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Knowledge</h3>
              <p className="text-gray-600 mb-4">
                Upload and manage your business information to get personalized AI-generated strategies.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Business profile setup</li>
                <li>• Document upload</li>
                <li>• Personalized insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Framework Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Powered by Proven Frameworks
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access the same methodologies taught in top business programs and used by successful companies worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">iMarketing</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Customer Value Journey</li>
              <li>• Nuclear Content™</li>
              <li>• NeuroCopywriting™</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">GrowthX</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Growth Heist™</li>
              <li>• Niche Fortune™</li>
              <li>• Funnel Architecture</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">iMBA</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Blue Ocean Strategy</li>
              <li>• Category Design</li>
              <li>• Luxury Strategy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-idean-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-semibold text-white mb-6">
            Ready to get started?
          </h2>
          <Link href="/dashboard/onboarding">
            <Button
              size="lg"
              className="bg-idean-white text-idean-navy hover:bg-gray-50 px-8 py-3 text-base font-medium"
            >
              Start Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p className="max-w-sm mx-auto">
            Private & secure. See our{' '}
            <Link href="/privacy" className="underline hover:text-gray-700">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}
