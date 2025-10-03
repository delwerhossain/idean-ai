'use client'

import { Loader2, Sparkles, Zap } from 'lucide-react'
import Image from 'next/image'

interface LoadingStateProps {
  message?: string
  submessage?: string
  variant?: 'default' | 'brand' | 'minimal' | 'spinner-only'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Primary Loading State - Full Page with Idean Branding
 * Use for: Initial page loads, framework loading, major transitions
 */
export function LoadingState({
  message = 'Loading...',
  submessage,
  variant = 'brand',
  size = 'md'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  if (variant === 'spinner-only') {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className={`${iconSizes[size]} text-[var(--idean-blue)] animate-spin`} />
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-[var(--idean-blue)] to-[var(--idean-navy-blue)] rounded-2xl shadow-lg animate-pulse flex items-center justify-center`}>
            <Sparkles className={`${iconSizes[size]} text-white`} />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--idean-blue-medium)] rounded-full animate-ping"></div>
        </div>
        {message && (
          <p className="mt-4 text-sm font-medium text-[var(--idean-navy-blue)]">{message}</p>
        )}
        {submessage && (
          <p className="mt-1 text-xs text-gray-500">{submessage}</p>
        )}
      </div>
    )
  }

  if (variant === 'default') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative mb-4">
          <div className={`${sizeClasses[size]} bg-[var(--idean-blue-pale)] rounded-full flex items-center justify-center animate-pulse`}>
            <Zap className={`${iconSizes[size]} text-[var(--idean-blue)]`} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-[var(--idean-blue)] animate-spin" />
          <span className="text-[var(--idean-navy-blue)] font-medium">{message}</span>
        </div>
        {submessage && (
          <p className="mt-2 text-sm text-gray-500">{submessage}</p>
        )}
      </div>
    )
  }

  // Brand variant (default full-page loading)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--idean-blue-light)] to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo Animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--idean-blue)] to-[var(--idean-navy-blue)] rounded-2xl shadow-2xl flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            {/* Orbiting dots */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--idean-blue-medium)] rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[var(--idean-blue)] rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <Loader2 className="w-8 h-8 text-[var(--idean-blue)] animate-spin" />
        </div>

        {/* Messages */}
        <h3 className="text-xl font-bold text-[var(--idean-navy-blue)] mb-2">
          {message}
        </h3>
        {submessage && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {submessage}
          </p>
        )}

        {/* Progress indicator */}
        <div className="mt-6 w-48 mx-auto">
          <div className="h-1 bg-[var(--idean-blue-pale)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--idean-blue)] to-[var(--idean-blue-medium)] rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline Loading Spinner
 * Use for: Buttons, inline elements, small UI components
 */
export function InlineLoader({
  size = 'sm',
  className = ''
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <Loader2 className={`${sizes[size]} text-[var(--idean-blue)] animate-spin ${className}`} />
  )
}

/**
 * Content Loading Skeleton
 * Use for: Content placeholders, list items, cards
 */
export function ContentSkeleton({
  lines = 3,
  className = ''
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gradient-to-r from-[var(--idean-blue-pale)] via-[var(--idean-blue-light)] to-[var(--idean-blue-pale)] rounded animate-shimmer bg-[length:200%_100%]`}
          style={{
            width: i === lines - 1 ? '70%' : '100%'
          }}
        />
      ))}
    </div>
  )
}

/**
 * Card Loading Skeleton
 * Use for: Card placeholders
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-[var(--idean-blue-pale)] rounded-lg animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[var(--idean-blue-pale)] rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-[var(--idean-blue-light)] rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <ContentSkeleton lines={3} />
    </div>
  )
}

/**
 * Processing Animation
 * Use for: AI generation, processing states
 */
export function ProcessingAnimation({
  message = 'Processing...',
  submessage
}: {
  message?: string
  submessage?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Animated logo with pulse effect */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-[var(--idean-blue)] to-[var(--idean-navy-blue)] rounded-2xl shadow-2xl flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-white animate-pulse" />
        </div>

        {/* Orbiting particles */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-[var(--idean-blue-medium)] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--idean-blue)] rounded-full"></div>
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Loader2 className="w-5 h-5 text-[var(--idean-blue)] animate-spin" />
          <h3 className="text-lg font-semibold text-[var(--idean-navy-blue)]">
            {message}
          </h3>
        </div>
        {submessage && (
          <p className="text-sm text-gray-600">{submessage}</p>
        )}
      </div>

      {/* Dots animation */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-[var(--idean-blue)] rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}
