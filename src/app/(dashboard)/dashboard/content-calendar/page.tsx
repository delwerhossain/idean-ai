'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ContentCalendarPage() {
  return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-green-600" />
                Content Calendar
              </h1>
              <p className="text-gray-600 mt-2">
                Plan and schedule your content across all channels
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">December 2024</h2>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Month</Button>
              <Button variant="outline" size="sm">Week</Button>
              <Button variant="outline" size="sm">Day</Button>
            </div>
          </div>

          <div className="text-center py-20 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Content Calendar Coming Soon</h3>
            <p className="text-gray-500">Plan and schedule your content across all platforms</p>
          </div>
        </Card>
      </div>
  )
}