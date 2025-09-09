'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, Plus, ArrowRight } from 'lucide-react'

export default function BlueprintsPage() {
  const frameworks = [
    {
      name: 'Customer Value Journey',
      description: 'Map your customer\'s path from awareness to advocacy',
      module: 'iMarketing',
      difficulty: 'Beginner'
    },
    {
      name: 'Blue Ocean Strategy',
      description: 'Create uncontested market space and make competition irrelevant',
      module: 'iMBA',
      difficulty: 'Advanced'
    },
    {
      name: 'Growth Heist™',
      description: 'Systematic approach to business growth hacking',
      module: 'GrowthX',
      difficulty: 'Intermediate'
    },
    {
      name: 'Nuclear Content™',
      description: 'Content strategy that creates massive engagement',
      module: 'iMarketing',
      difficulty: 'Intermediate'
    }
  ]

  return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-blue-600" />
                Blueprint Builder
              </h1>
              <p className="text-gray-600 mt-2">
                Create customized frameworks for your brand using iDEAN AI
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Blueprint
            </Button>
          </div>
        </div>

        {/* Strategy DNA Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Strategy DNA</h2>
            <p className="text-gray-700 mb-4">
              Transform your business challenges into strategic opportunities using proven frameworks from iMarketing, GrowthX, and iMBA programs.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Interactive Wizard
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                AI-Powered Analysis
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Export Ready
              </span>
            </div>
          </div>
        </div>

        {/* Framework Library */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Frameworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameworks.map((framework, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{framework.name}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                      {framework.module}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{framework.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {framework.difficulty}
                    </span>
                    <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                      Start <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">More frameworks coming soon...</p>
        </div>
      </div>
  )
}