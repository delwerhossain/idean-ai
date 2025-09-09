'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Plus, Play, Calendar, Target, PenTool } from 'lucide-react'

export default function CampaignsPage() {
  const campaignTypes = [
    {
      name: 'Marketing Funnel',
      description: 'Complete customer acquisition funnel',
      icon: Target,
      color: 'bg-blue-500'
    },
    {
      name: 'Campaign Sequence',
      description: 'Multi-touch campaign workflow',
      icon: Play,
      color: 'bg-green-500'
    },
    {
      name: 'Godfather Offer',
      description: 'Irresistible value proposition',
      icon: Zap,
      color: 'bg-purple-500'
    },
    {
      name: 'Ad Copy Generator',
      description: 'High-converting ad variations',
      icon: PenTool,
      color: 'bg-orange-500'
    }
  ]

  const recentCampaigns = [
    {
      name: 'Summer Product Launch',
      status: 'Active',
      performance: '+23%',
      lastUpdated: '2 hours ago'
    },
    {
      name: 'Black Friday Campaign',
      status: 'Draft',
      performance: '--',
      lastUpdated: '1 day ago'
    },
    {
      name: 'Brand Awareness',
      status: 'Completed',
      performance: '+45%',
      lastUpdated: '1 week ago'
    }
  ]

  return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Zap className="w-8 h-8 text-green-600" />
                Campaign Engine
              </h1>
              <p className="text-gray-600 mt-2">
                Create ready-to-use marketing campaigns and content
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Execution DNA Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Execution DNA</h2>
            <p className="text-gray-700 mb-4">
              Generate complete campaigns with copy, targeting, and sequence - all optimized using proven frameworks from your training programs.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Multi-Channel Ready
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Conversion Optimized
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Brand Consistent
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Campaign Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campaignTypes.map((type, index) => {
              const Icon = type.icon
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="text-center">
                    <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{type.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Create Now
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Recent Campaigns */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Recent Campaigns</h2>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              View Calendar
            </Button>
          </div>
          
          <Card className="p-6">
            <div className="space-y-4">
              {recentCampaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">Last updated {campaign.lastUpdated}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Performance</p>
                      <p className="font-medium text-green-600">{campaign.performance}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'Active' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status}
                    </span>
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
  )
}