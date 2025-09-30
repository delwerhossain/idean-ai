'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Target, Rocket, PenTool, Building, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

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
              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-idean-navy hover:bg-idean-navy-dark text-idean-white font-medium">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button className="bg-idean-navy hover:bg-idean-navy-dark text-idean-white font-medium">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
                      Login
                    </Button>
                  </Link>
                </>
              )}
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
              {user ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-idean-navy hover:bg-idean-navy-dark text-white px-8 py-4 text-lg font-medium"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Section */}
      <div className="bg-gradient-to-br from-idean-blue-light to-idean-blue-pale border-t border-idean-blue-pale">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-idean-blue-pale text-idean-blue text-sm font-medium rounded-full mb-6">
              <PenTool className="w-4 h-4 mr-2" />
              Available Now
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Brand & Content Studio
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Create powerful brand content with AI-powered copywriting, design frameworks, and marketing materials.
              Generate everything from social posts to complete campaigns using proven business methodologies.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-idean-blue-pale p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-idean-blue-pale rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-6 h-6 text-idean-blue" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Copywriting</h3>
                <p className="text-sm text-gray-600">Generate engaging copy using proven frameworks</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-idean-blue-pale rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-idean-blue" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Content Templates</h3>
                <p className="text-sm text-gray-600">Ready-to-use templates for all content types</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-idean-blue-pale rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-idean-blue" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Campaign Builder</h3>
                <p className="text-sm text-gray-600">Complete marketing campaigns in minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-idean-blue-pale rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building className="w-6 h-6 text-idean-blue" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Business Context</h3>
                <p className="text-sm text-gray-600">Personalized content based on your business</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            {user ? (
              <Link href="/dashboard/copywriting">
                <Button size="lg" className="bg-idean-blue hover:bg-idean-blue text-white px-8 py-4 text-lg font-medium">
                  Start Creating Content
                  <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="bg-idean-blue hover:bg-idean-blue text-white px-8 py-4 text-lg font-medium">
                  Start Creating Content
                  <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              More Features Coming Soon
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're building additional modules based on proven frameworks from iMarketing, GrowthX, and iMBA programs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 opacity-75">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-gray-500" />
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-medium">Coming Soon</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Growth Co-Pilot</h3>
              <p className="text-gray-600 mb-4">
                Strategic frameworks for business growth including Customer Value Journey and Blue Ocean Strategy.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Growth Heist™ framework</li>
                <li>• Business strategy mapping</li>
                <li>• Market analysis tools</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 opacity-75">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-gray-500" />
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-medium">Coming Soon</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Branding Lab</h3>
              <p className="text-gray-600 mb-4">
                Strategic brand frameworks including Brand Foundation and Voice & Messaging systems.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Brand DNA foundation</li>
                <li>• Visual identity systems</li>
                <li>• Brand voice development</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Get started with Brand & Content Studio today and be the first to access new features as they launch.</p>
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium">
                  Join Early Access
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-idean-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-semibold text-white mb-6">
            Ready to get started?
          </h2>
          {user ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-idean-white text-idean-navy hover:bg-gray-50 px-8 py-3 text-base font-medium"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                size="lg"
                className="bg-idean-white text-idean-navy hover:bg-gray-50 px-8 py-3 text-base font-medium"
              >
                Start Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          )}
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
