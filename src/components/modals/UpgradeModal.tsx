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
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out iDEAN AI',
    features: [
      '7-day trial or 500 tokens',
      'Limited to one framework',
      'Basic campaign generation',
      'Community support only'
    ],
    aiCredits: 500,
    frameworks: ['Basic Customer Value Journey'],
    support: 'Community',
    storage: '1 PDF'
  },
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
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
        <div className="p-6 pb-0">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Save up to 30%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-6 transition-all duration-200 cursor-pointer ${
                  plan.popular ? 'border-2 border-blue-500 shadow-lg' : 'hover:shadow-md'
                } ${
                  currentPlan === plan.id ? 'bg-gray-50 border-gray-300' : ''
                } ${
                  selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {currentPlan === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">৳{plan.price.toLocaleString()}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 text-sm">/{plan.period}</span>
                    )}
                  </div>
                  {billingPeriod === 'annual' && plan.price > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      ৳{Math.round(calculateAnnualPrice(plan.price, 30)/12).toLocaleString()}/month (30% off annually)
                    </div>
                  )}
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Stats */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">AI Credits:</span>
                    <span className="font-medium">{plan.aiCredits.toLocaleString()}/month</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Storage:</span>
                    <span className="font-medium">{plan.storage}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Support:</span>
                    <span className="font-medium">{plan.support}</span>
                  </div>
                </div>

                {/* Frameworks */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Framework Access:</h4>
                  <ul className="space-y-1">
                    {plan.frameworks.map((framework, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {framework}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={currentPlan === plan.id || processingCheckout}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : ''
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
          <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Module-Based Pricing</h3>
                <p className="text-gray-600 text-sm">Pick and choose specific modules you need</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModulePricing(!showModulePricing)}
              >
                {showModulePricing ? 'Hide Modules' : 'View Modules'}
              </Button>
            </div>

            {showModulePricing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {MODULE_PRICING.map((module) => (
                  <div key={module.name} className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-2">{module.name}</h4>
                    <p className="text-2xl font-bold text-blue-600 mb-2">৳{module.price}/month</p>
                    <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Add Module
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Bundle Discount:</strong> Get 20% off when you purchase 2 or more modules!
              </p>
            </div>
          </Card>

          {/* Annual Discounts */}
          {billingPeriod === 'annual' && (
            <Card className="p-6 mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Annual Savings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ANNUAL_DISCOUNTS.map((discount) => (
                  <div key={discount.months} className="text-center">
                    <div className="text-2xl font-bold text-green-600">{discount.discount}% OFF</div>
                    <div className="text-sm text-gray-600">{discount.label} subscription</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Money Back Guarantee */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              🛡️ <strong>30-day money-back guarantee</strong> - Try risk-free!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}