'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Business, ideanApi } from '@/lib/api/idean-api'

interface BusinessContextType {
  currentBusiness: Business | null
  businesses: Business[]
  loading: boolean
  error: string | null
  setCurrentBusiness: (business: Business) => void
  refreshBusinesses: () => Promise<void>
  switchBusiness: (businessId: string) => Promise<void>
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

interface BusinessProviderProps {
  children: ReactNode
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const { user } = useAuth()
  const [currentBusiness, setCurrentBusinessState] = useState<Business | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Load businesses on user change - but only once and only if we haven't loaded before
  useEffect(() => {
    if (user && !hasLoaded && !loading) {
      loadBusinesses()
    } else if (!user) {
      // Clear state when user is not authenticated
      setCurrentBusinessState(null)
      setBusinesses([])
      setHasLoaded(false)
    }
  }, [user, hasLoaded, loading])

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBusiness = localStorage.getItem('currentBusiness')
      if (savedBusiness) {
        try {
          const business = JSON.parse(savedBusiness)
          setCurrentBusinessState(business)
        } catch (error) {
          console.error('Failed to parse saved business:', error)
          localStorage.removeItem('currentBusiness')
        }
      }
    }
  }, [])

  const loadBusinesses = async () => {
    if (!user || loading || hasLoaded) return

    try {
      setLoading(true)
      setError(null)

      // Check localStorage first to avoid unnecessary API calls
      const savedBusiness = localStorage.getItem('currentBusiness')
      if (savedBusiness) {
        try {
          const business = JSON.parse(savedBusiness)
          setCurrentBusinessState(business)
          setBusinesses([business])
          setHasLoaded(true)
          setLoading(false)
          return // Use cached data, avoid API calls
        } catch (e) {
          console.error('Failed to parse saved business:', e)
          localStorage.removeItem('currentBusiness')
        }
      }

      // Only make API calls if no cached data
      let currentBiz: Business | null = null
      
      // Load user's own business first
      try {
        const myBusinessResponse = await ideanApi.business.getMine()
        if (myBusinessResponse.data) {
          currentBiz = myBusinessResponse.data
          setCurrentBusiness(currentBiz)
        }
      } catch (err: any) {
        console.log('No personal business found:', err.message)
        
        // If it's a rate limit error, stop trying and use fallback
        if (err.status === 429) {
          console.warn('Rate limited - using fallback mode')
          setHasLoaded(true)
          return
        }
      }

      // Only load all businesses if we got a personal business successfully
      if (currentBiz) {
        try {
          const allBusinessResponse = await ideanApi.business.getAll({ limit: 50 })
          if (allBusinessResponse.data) {
            const bizList = allBusinessResponse.data.data || []
            setBusinesses(bizList)
          }
        } catch (err: any) {
          console.warn('Failed to load all businesses, using personal business only:', err.message)
          // Don't fail completely, just use the personal business
          setBusinesses([currentBiz])
        }
      }

    } catch (error: any) {
      console.error('Failed to load businesses:', error)
      
      // Don't set error for rate limiting - just use fallback mode
      if (error.status !== 429) {
        setError('Failed to load business information')
      }
      
    } finally {
      setLoading(false)
      setHasLoaded(true) // Mark as loaded even if failed to prevent retry loops
    }
  }

  const setCurrentBusiness = (business: Business) => {
    setCurrentBusinessState(business)
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentBusiness', JSON.stringify(business))
      localStorage.setItem('businessId', business.id)
      localStorage.setItem('businessName', business.business_name)
    }

    // Emit custom event for other components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('businessChanged', { 
        detail: business 
      }))
    }
  }

  const switchBusiness = async (businessId: string) => {
    const business = businesses.find(b => b.id === businessId)
    if (!business) {
      throw new Error('Business not found')
    }

    setCurrentBusiness(business)
    
    // Optionally refresh business data
    try {
      const updatedBusiness = await ideanApi.business.getById(businessId)
      if (updatedBusiness.data) {
        setCurrentBusiness(updatedBusiness.data)
      }
    } catch (error) {
      console.warn('Failed to refresh business data:', error)
      // Continue with cached business data
    }
  }

  const refreshBusinesses = async () => {
    await loadBusinesses()
  }

  const value: BusinessContextType = {
    currentBusiness,
    businesses,
    loading,
    error,
    setCurrentBusiness,
    refreshBusinesses,
    switchBusiness
  }

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}

// Hook to get current business info
export function useCurrentBusiness() {
  const { currentBusiness, loading } = useBusiness()
  
  return {
    business: currentBusiness,
    isLoading: loading,
    hasValidBusiness: !!currentBusiness?.id,
    businessId: currentBusiness?.id,
    businessName: currentBusiness?.business_name,
    industryTag: currentBusiness?.industry_tag,
    moduleSelect: currentBusiness?.module_select
  }
}

// Hook to listen for business changes
export function useBusinessListener(callback: (business: Business | null) => void) {
  const { currentBusiness } = useBusiness()
  
  useEffect(() => {
    callback(currentBusiness)
  }, [currentBusiness, callback])

  useEffect(() => {
    const handleBusinessChange = (event: CustomEvent) => {
      callback(event.detail)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('businessChanged', handleBusinessChange as EventListener)
      return () => {
        window.removeEventListener('businessChanged', handleBusinessChange as EventListener)
      }
    }
  }, [callback])
}