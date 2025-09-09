'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Play, CheckCircle, Clock, Star, Users, TrendingUp, Target } from 'lucide-react'

export default function GuidedPathsPage() {
  const learningPaths = [
    {
      title: 'Customer Value Journey Mastery',
      description: 'Learn to map and optimize your customer\'s complete journey',
      module: 'iMarketing',
      difficulty: 'Beginner',
      duration: '45 min',
      lessons: 6,
      completed: 3,
      rating: 4.8,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Growth Hacking Fundamentals',
      description: 'Systematic approach to rapid business growth',
      module: 'GrowthX',
      difficulty: 'Intermediate',
      duration: '60 min',
      lessons: 8,
      completed: 0,
      rating: 4.9,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Blue Ocean Strategy Deep Dive',
      description: 'Create uncontested market space and make competition irrelevant',
      module: 'iMBA',
      difficulty: 'Advanced',
      duration: '90 min',
      lessons: 12,
      completed: 0,
      rating: 4.7,
      icon: Target,
      color: 'bg-purple-500'
    }
  ]

  const recentProgress = [
    {
      path: 'Customer Value Journey Mastery',
      lesson: 'Awareness Stage Optimization',
      progress: 50,
      timeSpent: '12 min'
    },
    {
      path: 'Nuclear Content Strategy',
      lesson: 'Hook Creation Framework',
      progress: 75,
      timeSpent: '18 min'
    },
    {
      path: 'Funnel Architecture',
      lesson: 'Landing Page Conversion',
      progress: 25,
      timeSpent: '8 min'
    }
  ]

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="w-8 h-8 text-indigo-600" />
                Guided Paths
              </h1>
              <p className="text-gray-600 mt-2">
                Step-by-step learning paths for mastering business frameworks
              </p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Browse All Paths
            </Button>
          </div>
        </div>

        {/* Learning DNA Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Interactive Learning Experience</h2>
            <p className="text-gray-700 mb-4">
              Each framework comes with a complete guided path that explains concepts, shows real examples, 
              and walks you through creating your own implementation step-by-step.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Interactive Lessons
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Real Examples
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Practical Exercises
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Paths */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Learning Paths</h2>
            <div className="space-y-6">
              {learningPaths.map((path, index) => {
                const Icon = path.icon
                const completionRate = (path.completed / path.lessons) * 100
                
                return (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${path.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{path.title}</h3>
                            <p className="text-sm text-gray-600">{path.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">{path.rating}</span>
                            </div>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                              {path.module}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {path.duration}
                          </span>
                          <span>{path.lessons} lessons</span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {path.difficulty}
                          </span>
                        </div>

                        {path.completed > 0 ? (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                {path.completed} of {path.lessons} lessons completed
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {Math.round(completionRate)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between">
                          <Button
                            variant={path.completed > 0 ? "default" : "outline"}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {path.completed > 0 ? (
                              <>Continue Learning <Play className="w-3 h-3" /></>
                            ) : (
                              <>Start Path <Play className="w-3 h-3" /></>
                            )}
                          </Button>
                          
                          {path.completed === path.lessons && (
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Recent Progress */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Progress</h2>
            <Card className="p-6">
              <div className="space-y-6">
                {recentProgress.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-medium text-gray-900 mb-1">{item.path}</h4>
                    <p className="text-sm text-gray-600 mb-3">{item.lesson}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{item.timeSpent} spent</span>
                      <span className="text-xs font-medium text-gray-700">{item.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${getProgressColor(item.progress)}`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Progress
              </Button>
            </Card>
          </div>
        </div>
      </div>
  )
}