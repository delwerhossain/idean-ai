'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, CheckCircle, AlertCircle, Clock, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function AuditPage() {
  const auditCategories = [
    {
      name: 'Marketing Assessment',
      description: 'Evaluate your marketing strategy effectiveness',
      icon: TrendingUp,
      questions: 15,
      time: '8-10 min',
      color: 'bg-blue-500'
    },
    {
      name: 'Customer Experience',
      description: 'Analyze your customer journey and touchpoints',
      icon: Users,
      questions: 12,
      time: '6-8 min',
      color: 'bg-green-500'
    },
    {
      name: 'Revenue Optimization',
      description: 'Identify opportunities to increase revenue',
      icon: DollarSign,
      questions: 10,
      time: '5-7 min',
      color: 'bg-purple-500'
    }
  ]

  const previousAudits = [
    {
      name: 'Q4 Marketing Review',
      score: 78,
      date: '2 weeks ago',
      status: 'Completed',
      recommendations: 8
    },
    {
      name: 'Customer Journey Analysis',
      score: 85,
      date: '1 month ago',
      status: 'Implemented',
      recommendations: 5
    },
    {
      name: 'Revenue Assessment',
      score: 65,
      date: '6 weeks ago',
      status: 'In Progress',
      recommendations: 12
    }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Target className="w-8 h-8 text-purple-600" />
                Growth Audit
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive business growth assessment with actionable insights
              </p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Start New Audit
            </Button>
          </div>
        </div>

        {/* Assessment Overview */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Growth Assessment</h2>
            <p className="text-gray-700 mb-4">
              Get a comprehensive evaluation of your business with MCQ questions and AI analysis. 
              Receive a personalized Growth Playbook with actionable recommendations.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Strategic Health Score
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Personalized Playbook
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Best Practice Benchmarks
              </span>
            </div>
          </div>
        </div>

        {/* Audit Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Assessment Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {auditCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{category.questions} questions</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {category.time}
                    </span>
                  </div>
                  <Button size="sm" className="w-full">
                    Start Assessment
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Previous Audits */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Previous Audits</h2>
          <Card className="p-6">
            <div className="space-y-4">
              {previousAudits.map((audit, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-lg ${getScoreBg(audit.score)} flex items-center justify-center`}>
                      <span className={`text-2xl font-bold ${getScoreColor(audit.score)}`}>
                        {audit.score}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{audit.name}</h3>
                      <p className="text-sm text-gray-500">{audit.date}</p>
                      <p className="text-sm text-gray-600">{audit.recommendations} recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      audit.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      audit.status === 'Implemented' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {audit.status}
                    </span>
                    <Button size="sm" variant="outline">
                      View Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="mt-8">
          <Card className="p-6 bg-gray-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Assessment Tips</h3>
                <p className="text-sm text-gray-600">
                  Be honest in your responses to get the most accurate recommendations. 
                  Each audit builds upon your previous assessments to track improvement over time.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}