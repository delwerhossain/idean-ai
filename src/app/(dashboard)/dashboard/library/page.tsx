'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Search, Filter, Star } from 'lucide-react'

export default function LibraryPage() {
  const frameworks = [
    { name: 'Customer Value Journey', module: 'iMarketing', type: 'Framework', rating: 4.8 },
    { name: 'Blue Ocean Strategy', module: 'iMBA', type: 'Framework', rating: 4.9 },
    { name: 'Growth Heist™', module: 'GrowthX', type: 'Framework', rating: 4.7 },
    { name: 'Nuclear Content™', module: 'iMarketing', type: 'Template', rating: 4.6 },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                Framework Library
              </h1>
              <p className="text-gray-600 mt-2">
                Access all your business frameworks, templates, and resources
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Library Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map((item, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                    {item.module}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-500">{item.rating}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.type}</p>
              </div>
              <Button size="sm" className="w-full">
                Open
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">More resources coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}