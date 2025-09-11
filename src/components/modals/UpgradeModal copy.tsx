'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  X, 
  Crown, 
  Check, 
  Zap, 
  Users, 
  FileText, 
  BarChart3,
  Headphones,
  Star,
  CreditCard,
  Globe
} from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: string
}

interface PricingPlan {
  id: string
  name: string
  price: number
  period: string
  description: string
  popular?: boolean
  features: string[]
  aiCredits: number
  frameworks: string[]
  support: string
  storage: string
}

const PRICING_PLANS: PricingPlan[] = [
  // {
  //   id: 'free',
  //   name: 'Free Plan',
  //   price: 0,
  //   period: 'forever',
  //   description: 'Perfect for trying out iDEAN AI',
  //   features: [
  //     '7-day trial or 500 tokens',
  //     'Limited to one framework',
  //     'Basic campaign generation',
  //     'Community support only'
  //   ],
  //   aiCredits: 500,
  //   frameworks: ['Basic Customer Value Journey'],
  //   support: 'Community',
  //   storage: '1 PDF'
  // },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 2000,
    period: 'month',
    description: 'Perfect for solo creators and small business owners',
    popular: true,
    features: [
      'Chatbot onboarding system',
      'Upload up to 4 PDFs (≤30 pages each)',
      '500-word business overview generation',
      'Facebook ads + organic content creation',
      'Part-by-part content flow',
      'Manual analytics CSV upload',
      'English/Bangla UI support',
      '2,000 monthly AI credits'
    ],
    aiCredits: 2000,
    frameworks: [
      'Basic Customer Value Journey',
      'Essential copywriting templates',
      'Standard funnel frameworks'
    ],
    support: 'Email Support',
    storage: '4 PDFs (≤30 pages each)'
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 5000,
    period: 'month',
    description: 'Designed for growing businesses and small agencies',
    features: [
      'Everything in Standard +',
      'Team workspace with shared knowledge base',
      'Ads history import (≥30 items)',
      'Performance tracking',
      'Saved templates and custom frameworks',
      'Agency support "book a call" feature',
      'Advanced cohort performance snapshots',
      'Role-based access controls',
      'Increased storage limits (20 PDFs)',
      '5,000 monthly AI credits',
      'Priority customer support'
    ],
    aiCredits: 5000,
    frameworks: [
      'Full iMarketing modules',
      'Complete GrowthX modules',
      'Advanced blueprint analyzer',
      'Competitor analysis tools',
      'Custom template creation'
    ],
    support: 'Priority Support + Book a Call',
    storage: '20 PDFs'
  }
]

const MODULE_PRICING = [
  { name: 'iMarketing Module', price: 500, description: 'Customer Value Journey, Nuclear Content™, NeuroCopywriting™' },
  { name: 'GrowthX Module', price: 500, description: 'Growth Heist™, Niche Fortune™, Funnel frameworks' },
  { name: 'iMBA Module', price: 500, description: 'Category Design, Luxury Strategy, High-level modules' }
]

const ANNUAL_DISCOUNTS = [
  { months: 3, discount: 10, label: '3 months' },
  { months: 6, discount: 20, label: '6 months' },
  { months: 12, discount: 30, label: '12 months' }
]

export default function UpgradeModal({ isOpen, onClose, currentPlan }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [processingCheckout, setProcessingCheckout] = useState(false)
  const [showModulePricing, setShowModulePricing] = useState(false)

  if (!isOpen) return null

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlan) return
    setSelectedPlan(planId)
  }

  const calculateAnnualPrice = (monthlyPrice: number, discount: number) => {
    const annualPrice = monthlyPrice * 12
    return annualPrice - (annualPrice * discount / 100)
  }

  const handleCheckout = async (planId: string) => {
    if (planId === 'free') return
    
    try {
      setProcessingCheckout(true)
      
      // TODO: Integrate with actual payment processor when backend is ready
      /*
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingPeriod,
          returnUrl: window.location.origin + '/dashboard/settings?upgraded=true'
        })
      })
      
      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
      */
      
      // Mock checkout flow for now
      console.log('🚀 Starting checkout for:', planId, billingPeriod)
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save plan to localStorage
      localStorage.setItem('currentPlan', planId)
      localStorage.setItem('planUpgradeDate', new Date().toISOString())
      
      console.log('✅ Plan upgraded successfully to:', planId)
      
      // Close modal and refresh page
      onClose()
      window.location.reload()
      
    } catch (error) {
      console.error('Checkout failed:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setProcessingCheckout(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full hover:scrollbar-thumb-gray-400">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 p-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-gray-600 mt-1">Choose the perfect plan for your business growth</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Billing Toggle */}
        <div className="px-6 pb-0 pt-4">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 rounded-xl p-1.5 flex shadow-inner">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  Save up to 30%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="px-6 pt-0 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-8 transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${
                  plan.popular ? 'border-2 border-blue-500 shadow-2xl ring-1 ring-blue-200' : 'border border-gray-200 hover:shadow-xl hover:border-blue-300'
                } ${
                  currentPlan === plan.id ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-400' : 'bg-white'
                } ${
                  selectedPlan === plan.id ? 'ring-2 ring-blue-500 shadow-xl' : ''
                } rounded-2xl overflow-hidden`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 animate-gradient-x text-white px-6 py-2 rounded-full text-xs font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {currentPlan === plan.id && (
                  <div className="absolute -top-4 right-4 z-10">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">৳{plan.price.toLocaleString()}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 text-base font-medium">/{plan.period}</span>
                    )}
                  </div>
                  {billingPeriod === 'annual' && plan.price > 0 && (
                    <div className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full inline-block mb-2">
                      ৳{Math.round(calculateAnnualPrice(plan.price, 30)/12).toLocaleString()}/month (30% off annually)
                    </div>
                  )}
                  <p className="text-gray-600 text-base">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm group">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-200 transition-colors">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Stats */}
                <div className="mb-8 space-y-3 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">AI Credits:</span>
                    <span className="font-bold text-blue-600">{plan.aiCredits.toLocaleString()}/month</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Storage:</span>
                    <span className="font-bold text-gray-900">{plan.storage}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Support:</span>
                    <span className="font-bold text-gray-900">{plan.support}</span>
                  </div>
                </div>

                {/* Frameworks */}
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Framework Access:</h4>
                  <ul className="space-y-1">
                    {plan.frameworks.map((framework, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2 hover:text-yellow-600 transition-colors">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{framework}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={currentPlan === plan.id || processingCheckout}
                  className={`w-full py-4 text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 animate-gradient-x hover:shadow-xl' 
                      : 'hover:shadow-lg'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {processingCheckout ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : currentPlan === plan.id ? (
                    'Current Plan'
                  ) : plan.price === 0 ? (
                    'Free Forever'
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>

          {/* Module-Based Pricing Alternative */}
          <Card className="p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 border-0 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Module-Based Pricing</h3>
                <p className="text-gray-600 text-base mt-1">Pick and choose specific modules you need</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModulePricing(!showModulePricing)}
                className="hover:scale-105 transition-transform duration-200"
              >
                {showModulePricing ? 'Hide Modules' : 'View Modules'}
              </Button>
            </div>

            {showModulePricing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 animate-fadeIn">
                {MODULE_PRICING.map((module) => (
                  <div key={module.name} className="bg-white p-6 rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">{module.name}</h4>
                    <p className="text-3xl font-black text-blue-600 mb-3">৳{module.price}/month</p>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">{module.description}</p>
                    <Button size="sm" variant="outline" className="w-full hover:scale-105 transition-transform duration-200">
                      Add Module
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <p className="text-base text-green-800">
                <strong className="font-bold">Bundle Discount:</strong> Get 20% off when you purchase 2 or more modules!
              </p>
            </div>
          </Card>

          {/* Annual Discounts */}
          {billingPeriod === 'annual' && (
            <Card className="p-8 mt-8 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-green-200 shadow-lg rounded-2xl animate-fadeIn">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Annual Savings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ANNUAL_DISCOUNTS.map((discount) => (
                  <div key={discount.months} className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{discount.discount}% OFF</div>
                    <div className="text-base text-gray-700 font-medium mt-2">{discount.label} subscription</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Money Back Guarantee */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-6 py-3 rounded-full border border-blue-200">
              <span className="text-2xl">🛡️</span>
              <p className="text-base text-blue-800 font-semibold">
                30-day money-back guarantee - Try risk-free!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}