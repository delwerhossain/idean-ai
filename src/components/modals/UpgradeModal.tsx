"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
  Globe,
} from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  popular?: boolean;
  features: string[];
  aiCredits: number;
  frameworks: string[];
  support: string;
  storage: string;
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
    id: "standard",
    name: "Standard Plan",
    price: 2000,
    period: "month",
    description: "Perfect for solo creators and small business owners",
    popular: true,
    features: [
      "Chatbot onboarding system",
      "Upload up to 4 PDFs (≤30 pages each)",
      "500-word business overview generation",
      "Facebook ads + organic content creation",
      "Part-by-part content flow",
      "Manual analytics CSV upload",
      "English/Bangla UI support",
      "2,000 monthly AI credits",
    ],
    aiCredits: 2000,
    frameworks: [
      "Basic Customer Value Journey",
      "Essential copywriting templates",
      "Standard funnel frameworks",
    ],
    support: "Email Support",
    storage: "4 PDFs (≤30 pages each)",
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 5000,
    period: "month",
    description: "Designed for growing businesses and small agencies",
    features: [
      "Everything in Standard +",
      "Team workspace with shared knowledge base",
      "Ads history import (≥30 items)",
      "Performance tracking",
      "Saved templates and custom frameworks",
      'Agency support "book a call" feature',
      "Advanced cohort performance snapshots",
      "Role-based access controls",
      "Increased storage limits (20 PDFs)",
      "5,000 monthly AI credits",
      "Priority customer support",
    ],
    aiCredits: 5000,
    frameworks: [
      "Full iMarketing modules",
      "Complete GrowthX modules",
      "Advanced blueprint analyzer",
      "Competitor analysis tools",
      "Custom template creation",
    ],
    support: "Priority Support + Book a Call",
    storage: "20 PDFs",
  },
];

const MODULE_PRICING = [
  {
    name: "iMarketing Module",
    price: 500,
    description: "Customer Value Journey, Nuclear Content™, NeuroCopywriting™",
  },
  {
    name: "GrowthX Module",
    price: 500,
    description: "Growth Heist™, Niche Fortune™, Funnel frameworks",
  },
  {
    name: "iMBA Module",
    price: 500,
    description: "Category Design, Luxury Strategy, High-level modules",
  },
];

const ANNUAL_DISCOUNTS = [
  { months: 3, discount: 10, label: "3 months" },
  { months: 6, discount: 20, label: "6 months" },
  { months: 12, discount: 30, label: "12 months" },
];

export default function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [showModulePricing, setShowModulePricing] = useState(false);

  if (!isOpen) return null;

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlan) return;
    setSelectedPlan(planId);
  };

  const calculateAnnualPrice = (monthlyPrice: number, discount: number) => {
    const annualPrice = monthlyPrice * 12;
    return annualPrice - (annualPrice * discount) / 100;
  };

  const handleCheckout = async (planId: string) => {
    if (planId === "free") return;

    try {
      setProcessingCheckout(true);

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
      console.log("🚀 Starting checkout for:", planId, billingPeriod);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save plan to localStorage
      localStorage.setItem("currentPlan", planId);
      localStorage.setItem("planUpgradeDate", new Date().toISOString());

      console.log("✅ Plan upgraded successfully to:", planId);

      // Close modal and refresh page
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setProcessingCheckout(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  Upgrade Your Plan
                </h2>
                <p className="text-orange-100 mt-1">
                  Unlock more features for your business
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Current Status */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Check className="w-4 h-4" />
              Currently on {currentPlan === 'free' ? 'Free' : currentPlan === 'standard' ? 'Standard' : 'Pro'} Plan
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-6 transition-all duration-200 ${
                  plan.popular
                    ? "border-2 border-orange-400 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50"
                    : "hover:shadow-md border-gray-200"
                } ${
                  currentPlan === plan.id ? "bg-green-50 border-green-300" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg">
                      Recommended
                    </span>
                  </div>
                )}

                {currentPlan === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ৳{plan.price.toLocaleString()}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 text-sm">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                {/* Key Features - Simplified */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">AI Credits</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {plan.aiCredits.toLocaleString()}/month
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Storage</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{plan.storage}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Support</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{plan.support}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={currentPlan === plan.id || processingCheckout}
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  variant={currentPlan === plan.id ? "outline" : "default"}
                >
                  {processingCheckout ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : currentPlan === plan.id ? (
                    <div className="flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Crown className="w-4 h-4 mr-2" />
                      {plan.popular ? "Upgrade Now" : "Select Plan"}
                    </div>
                  )}
                </Button>
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
            <p className="text-gray-600 mb-4">Our team can help you find the perfect plan for your business needs.</p>
            <Button variant="outline" size="sm">
              <Headphones className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
