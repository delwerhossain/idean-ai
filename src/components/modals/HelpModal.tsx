"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  X,
  HelpCircle,
  BookOpen,
  Video,
  MessageCircle,
  Search,
  ChevronRight,
  PenTool,
  Building,
  User,
  Settings,
  FileText,
  ArrowLeft,
  ExternalLink,
  Play,
  Download,
} from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  items: HelpItem[];
}

interface HelpItem {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'video' | 'faq';
  content?: string;
  videoUrl?: string;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Play,
    description: 'Learn the basics of using iDEAN AI',
    items: [
      {
        id: 'first-steps',
        title: 'Your First Steps with iDEAN AI',
        description: 'Complete guide to setting up your account and creating your first content',
        type: 'guide',
        content: `
# Getting Started with iDEAN AI

Welcome to iDEAN AI! This guide will help you get started with our platform.

## Step 1: Complete Your Business Profile
1. Go to **Business Knowledge** in the sidebar
2. Fill out your business information
3. Upload your business documents (up to 4 PDFs)

## Step 2: Create Your First Content
1. Navigate to **Brand & Content Studio**
2. Choose a content type (social post, email, ad copy, etc.)
3. Follow the AI-guided creation process
4. Review and customize your generated content

## Step 3: Save and Export
1. Save your content as a template for future use
2. Export in your preferred format
3. Share with your team or use in your campaigns

## Tips for Success:
- Provide detailed business context for better AI results
- Use the framework-based templates for proven strategies
- Save successful content as templates for consistency
        `
      },
      {
        id: 'account-setup',
        title: 'Setting Up Your Account',
        description: 'Configure your profile and business information',
        type: 'guide',
        content: `
# Account Setup Guide

## Business Information
Your business profile helps our AI generate more relevant content:

- **Business Name**: Your company or brand name
- **Industry**: Select your primary industry
- **Target Audience**: Describe your ideal customers
- **Brand Voice**: Define your communication style

## Document Upload
Upload key business documents:
- Brand guidelines
- Previous marketing materials
- Business plans or strategy documents
- Customer personas or research

## Settings Configuration
- Language preferences (English/Bangla)
- Notification preferences
- Team access (Pro plan)
        `
      },
      {
        id: 'dashboard-tour',
        title: 'Dashboard Overview',
        description: 'Learn about each section of your dashboard',
        type: 'video'
      }
    ]
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    icon: PenTool,
    description: 'Master the Brand & Content Studio',
    items: [
      {
        id: 'content-types',
        title: 'Available Content Types',
        description: 'Explore all the content you can create',
        type: 'guide',
        content: `
# Content Types in Brand & Content Studio

## Social Media Content
- **Facebook Posts**: Engaging posts for your Facebook page
- **Instagram Captions**: Perfect captions with hashtags
- **LinkedIn Updates**: Professional content for B2B audiences
- **Twitter/X Posts**: Concise, impactful messages

## Marketing Materials
- **Email Campaigns**: Subject lines, body content, and CTAs
- **Ad Copy**: Facebook, Google, and other platform ads
- **Landing Page Copy**: Headlines, descriptions, and forms
- **Blog Posts**: SEO-optimized articles and content

## Business Communications
- **Press Releases**: Professional announcements
- **Newsletter Content**: Regular customer communications
- **Product Descriptions**: Compelling product copy
- **Sales Scripts**: Phone and meeting talking points

## Framework-Based Content
- **Customer Value Journey**: Content for each stage
- **NeuroCopywriting™**: Psychology-based persuasive copy
- **Nuclear Content™**: High-impact marketing messages
        `
      },
      {
        id: 'ai-prompting',
        title: 'Getting Better AI Results',
        description: 'Tips for writing effective prompts',
        type: 'guide',
        content: `
# Getting Better AI Results

## Be Specific
Instead of: "Write a social media post"
Try: "Write a Facebook post about our new product launch, targeting small business owners, emphasizing time-saving benefits"

## Provide Context
- Mention your industry and target audience
- Include your brand voice (professional, casual, friendly)
- Reference specific products or services
- Mention the goal (awareness, sales, engagement)

## Use Examples
- Provide examples of content you like
- Reference successful past campaigns
- Mention competitors' approaches you admire

## Iterate and Refine
- Review the first output
- Ask for revisions with specific feedback
- Try different approaches for variety
- Save successful prompts as templates

## Framework Integration
- Choose relevant business frameworks
- Let the AI guide you through proven methodologies
- Trust the structured approach for better results
        `
      },
      {
        id: 'templates-library',
        title: 'Using Templates',
        description: 'Save time with pre-built templates',
        type: 'guide',
        content: `
# Working with Templates

## Finding Templates
- Browse the Templates section in your dashboard
- Filter by content type or industry
- Use the search function for specific needs

## Customizing Templates
- Templates are starting points, not final copy
- Modify to match your brand voice
- Add specific details about your business
- Adjust for your target audience

## Creating Your Own Templates
1. Generate content you're happy with
2. Click "Save as Template"
3. Add descriptive title and tags
4. Share with your team (Pro plan)

## Template Best Practices
- Create templates for recurring content needs
- Include placeholder text for easy customization
- Organize with clear naming conventions
- Regularly update based on performance
        `
      }
    ]
  },
  {
    id: 'business-setup',
    title: 'Business Knowledge',
    icon: Building,
    description: 'Optimize your business information',
    items: [
      {
        id: 'document-upload',
        title: 'Uploading Business Documents',
        description: 'Best practices for document management',
        type: 'guide',
        content: `
# Document Upload Best Practices

## Supported Formats
- PDF files only
- Maximum 30 pages per document
- Up to 4 documents (Standard plan)
- Up to 20 documents (Pro plan)

## What to Upload
- **Brand Guidelines**: Logo usage, colors, fonts, voice
- **Marketing Materials**: Successful campaigns, brochures
- **Business Plans**: Strategy documents, mission statements
- **Customer Research**: Personas, surveys, market analysis

## Preparation Tips
- Ensure text is readable (not just images)
- Remove sensitive information
- Use clear, descriptive file names
- Keep documents current and relevant

## AI Processing
- Documents are analyzed for key insights
- Brand voice and messaging patterns are extracted
- Customer information is identified
- Business context is integrated into content generation
        `
      },
      {
        id: 'business-profile',
        title: 'Optimizing Your Business Profile',
        description: 'Complete your profile for better AI results',
        type: 'guide',
        content: `
# Business Profile Optimization

## Essential Information
- **Company Name**: Official business name
- **Industry**: Select most relevant category
- **Business Size**: Team size and revenue range
- **Target Market**: Geographic and demographic

## Brand Voice Definition
- **Tone**: Professional, casual, friendly, authoritative
- **Personality**: Traits that define your brand
- **Values**: What your company stands for
- **Differentiators**: What sets you apart

## Customer Information
- **Primary Audience**: Main customer segment
- **Pain Points**: Problems you solve
- **Buying Behavior**: How customers make decisions
- **Communication Preferences**: Preferred channels

## Competitive Landscape
- **Main Competitors**: Companies you compete against
- **Market Position**: Your unique market position
- **Strengths**: Your competitive advantages
- **Opportunities**: Market gaps you address
        `
      }
    ]
  },
  {
    id: 'account-settings',
    title: 'Account & Settings',
    icon: Settings,
    description: 'Manage your account and preferences',
    items: [
      {
        id: 'plan-management',
        title: 'Managing Your Plan',
        description: 'Understanding plans and upgrades',
        type: 'guide',
        content: `
# Plan Management

## Current Plans
- **Standard Plan (৳2,000/month)**
  - 2,000 monthly AI credits
  - 4 PDF uploads
  - Basic framework access
  - Email support

- **Pro Plan (৳5,000/month)**
  - 5,000 monthly AI credits
  - 20 PDF uploads
  - Advanced frameworks
  - Team collaboration
  - Priority support

## Upgrading Your Plan
1. Click "Upgrade Plan" in the sidebar
2. Compare plan features
3. Select your preferred plan
4. Complete secure payment
5. Features activate immediately

## Credit Usage
- Monitor usage in your dashboard
- Credits renew monthly
- Unused credits don't roll over
- Get notifications at 80% usage

## Support Options
- **Standard**: Email support (24-48 hours)
- **Pro**: Priority support + scheduled calls
- **Emergency**: Available for Pro users
        `
      },
      {
        id: 'team-collaboration',
        title: 'Team Features (Pro Plan)',
        description: 'Collaborate with your team',
        type: 'guide',
        content: `
# Team Collaboration Features

## Adding Team Members (Pro Only)
1. Go to Settings > Team Management
2. Click "Invite Team Member"
3. Enter email address and role
4. Send invitation
5. Members receive setup instructions

## Role Management
- **Admin**: Full access to all features
- **Editor**: Create and edit content
- **Viewer**: View content and templates only

## Shared Resources
- **Knowledge Base**: Shared business documents
- **Templates**: Team template library
- **Brand Guidelines**: Consistent brand assets
- **Content History**: Shared creation history

## Workflow Features
- **Review Process**: Multi-stage content approval
- **Comments**: Team feedback on content
- **Version Control**: Track content changes
- **Notifications**: Team activity updates
        `
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: HelpCircle,
    description: 'Common issues and solutions',
    items: [
      {
        id: 'common-issues',
        title: 'Common Issues & Solutions',
        description: 'Quick fixes for frequent problems',
        type: 'faq',
        content: `
# Common Issues & Solutions

## Content Generation Issues

**Q: Why is my AI content not relevant to my business?**
A: Make sure you've completed your business profile and uploaded relevant documents. The AI needs context to generate personalized content.

**Q: The AI content feels generic. How can I improve it?**
A: Be more specific in your prompts. Include details about your target audience, campaign goals, and desired tone.

**Q: I'm getting error messages during generation.**
A: Check your internet connection and try again. If the issue persists, you may have reached your monthly credit limit.

## Account Issues

**Q: I can't upload my business documents.**
A: Ensure your files are PDFs under 30 pages each. Check that you haven't exceeded your plan's upload limit.

**Q: My credit usage seems high.**
A: Review your generation history in settings. Complex requests use more credits than simple ones.

**Q: I forgot my password.**
A: Use the "Forgot Password" link on the login page to reset your password.

## Performance Issues

**Q: The platform is loading slowly.**
A: Clear your browser cache or try using a different browser. Check your internet connection speed.

**Q: My saved templates aren't appearing.**
A: Refresh the page or log out and back in. Contact support if the issue persists.

## Billing Questions

**Q: When will I be charged for my plan?**
A: You're billed monthly on the same date you signed up. You'll receive email notifications before each billing cycle.

**Q: Can I change my plan mid-cycle?**
A: Yes, upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle.
        `
      }
    ]
  }
];

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<HelpItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const handleBackToSections = () => {
    setCurrentItem(null);
    setCurrentSection(null);
  };

  const handleBackToItems = () => {
    setCurrentItem(null);
  };

  const handleSectionClick = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  const handleItemClick = (item: HelpItem) => {
    setCurrentItem(item);
  };

  const handleContactSupport = () => {
    // Open email client or support system
    window.open('mailto:support@ideanai.com?subject=Help Request from Dashboard', '_blank');
  };

  const currentSectionData = HELP_SECTIONS.find(s => s.id === currentSection);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentItem ? (
                <Button
                  onClick={handleBackToItems}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              ) : currentSection ? (
                <Button
                  onClick={handleBackToSections}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              ) : null}
              <HelpCircle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {currentItem ? currentItem.title :
                   currentSection ? currentSectionData?.title :
                   'Help & Guide'}
                </h2>
                <p className="text-blue-100 mt-1">
                  {currentItem ? currentItem.description :
                   currentSection ? currentSectionData?.description :
                   'Learn how to use iDEAN AI effectively'}
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
          {currentItem ? (
            // Individual help item content
            <div className="prose max-w-none">
              {currentItem.type === 'video' ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Tutorial</h3>
                  <p className="text-gray-600 mb-4">This video tutorial is coming soon!</p>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Request This Tutorial
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: currentItem.content?.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<strong>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || ''
                    }}
                  />
                </div>
              )}
            </div>
          ) : currentSection ? (
            // Section items list
            <div className="space-y-4">
              {currentSectionData?.items.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {item.type === 'guide' && <BookOpen className="w-5 h-5 text-blue-600" />}
                        {item.type === 'video' && <Video className="w-5 h-5 text-blue-600" />}
                        {item.type === 'faq' && <HelpCircle className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Main sections overview
            <>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search help topics..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Help Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {HELP_SECTIONS.map((section) => (
                  <Card
                    key={section.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <section.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                        <div className="flex items-center mt-2 text-xs text-blue-600">
                          <span>{section.items.length} articles</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Need More Help?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={handleContactSupport}
                  >
                    <MessageCircle className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Contact Support</div>
                      <div className="text-xs text-gray-500">Get help from our team</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => window.open('/dashboard/onboarding', '_blank')}
                  >
                    <Play className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Quick Start Guide</div>
                      <div className="text-xs text-gray-500">Interactive onboarding</div>
                    </div>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}