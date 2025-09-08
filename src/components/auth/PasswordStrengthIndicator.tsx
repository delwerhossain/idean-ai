'use client'

import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { Check, X } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

interface PasswordRequirement {
  test: (password: string) => boolean
  message: string
}

const requirements: PasswordRequirement[] = [
  {
    test: (password) => password.length >= 8,
    message: 'At least 8 characters'
  },
  {
    test: (password) => /[a-z]/.test(password),
    message: 'One lowercase letter'
  },
  {
    test: (password) => /[A-Z]/.test(password),
    message: 'One uppercase letter'
  },
  {
    test: (password) => /\d/.test(password),
    message: 'One number'
  },
  {
    test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password),
    message: 'One special character'
  }
]

export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const analysis = useMemo(() => {
    const passed = requirements.filter(req => req.test(password))
    const strength = passed.length / requirements.length
    
    let strengthText = 'Very Weak'
    let strengthColor = 'bg-red-500'
    
    if (strength === 1) {
      strengthText = 'Very Strong'
      strengthColor = 'bg-green-500'
    } else if (strength >= 0.8) {
      strengthText = 'Strong'
      strengthColor = 'bg-green-400'
    } else if (strength >= 0.6) {
      strengthText = 'Good'
      strengthColor = 'bg-yellow-500'
    } else if (strength >= 0.4) {
      strengthText = 'Fair'
      strengthColor = 'bg-orange-500'
    } else if (strength >= 0.2) {
      strengthText = 'Weak'
      strengthColor = 'bg-red-400'
    }
    
    return {
      score: strength * 100,
      text: strengthText,
      color: strengthColor,
      passed: passed.length,
      total: requirements.length
    }
  }, [password])

  if (!password) return null

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Password strength</span>
          <span className={`font-medium ${
            analysis.score >= 80 ? 'text-green-600' :
            analysis.score >= 60 ? 'text-yellow-600' :
            analysis.score >= 40 ? 'text-orange-600' :
            'text-red-600'
          }`}>
            {analysis.text}
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={analysis.score} 
            className="h-2"
          />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${analysis.color}`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
        
        <div className="text-xs text-gray-500">
          {analysis.passed} of {analysis.total} requirements met
        </div>
      </div>
      
      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const isPassed = requirement.test(password)
          return (
            <div 
              key={index}
              className={`flex items-center space-x-2 text-xs transition-colors ${
                isPassed ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {isPassed ? (
                <Check className="w-3 h-3 flex-shrink-0" />
              ) : (
                <X className="w-3 h-3 flex-shrink-0" />
              )}
              <span>{requirement.message}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  
  // Optional: require special character for very strong passwords
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
  //   return { isValid: false, message: 'Password should contain at least one special character' }
  // }
  
  return { isValid: true }
}