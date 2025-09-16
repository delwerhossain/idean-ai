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

  // Listen for business creation events from onboarding
  useEffect(() => {
    const handleBusinessCreated = (event: CustomEvent) => {
      const newBusiness = event.detail
      console.log('🎉 BusinessContext: New business created', newBusiness)

      // Update context with new business
      setCurrentBusiness(newBusiness)

      // Add new business to existing list instead of overwriting
      setBusinesses(prevBusinesses => {
        console.log('📊 BusinessContext: Before business creation update:', {
          previousCount: prevBusinesses.length,
          previousBusinesses: prevBusinesses.map(b => ({ id: b.id, name: b.business_name })),
          newBusinessToAdd: { id: newBusiness.id, name: newBusiness.business_name }
        })

        // Check if business already exists to avoid duplicates
        const existingBusiness = prevBusinesses.find(b => b.id === newBusiness.id)
        if (existingBusiness) {
          console.log('📋 Business already exists in list, updating it')
          const updatedList = prevBusinesses.map(b => b.id === newBusiness.id ? newBusiness : b)
          console.log('✅ Updated business list:', {
            totalCount: updatedList.length,
            businesses: updatedList.map(b => ({ id: b.id, name: b.business_name }))
          })
          return updatedList
        } else {
          console.log('➕ Adding new business to existing list:', prevBusinesses.length + 1, 'total')
          const newList = [...prevBusinesses, newBusiness]
          console.log('✅ New business list after addition:', {
            totalCount: newList.length,
            businesses: newList.map(b => ({ id: b.id, name: b.business_name }))
          })
          return newList
        }
      })

      setHasLoaded(true)
      setError(null)
    }

    const handleBusinessSwitched = (event: CustomEvent) => {
      const { newBusiness } = event.detail
      console.log('🔄 BusinessContext: Business switched via creation', newBusiness)

      // Handle business switching for existing users creating additional businesses
      setCurrentBusiness(newBusiness)

      // Add new business to existing list
      setBusinesses(prevBusinesses => {
        console.log('📊 BusinessContext: Before business switch update:', {
          previousCount: prevBusinesses.length,
          previousBusinesses: prevBusinesses.map(b => ({ id: b.id, name: b.business_name })),
          newBusinessToAdd: { id: newBusiness.id, name: newBusiness.business_name }
        })

        const existingBusiness = prevBusinesses.find(b => b.id === newBusiness.id)
        if (existingBusiness) {
          console.log('📋 Business already exists in list during switch, updating it')
          const updatedList = prevBusinesses.map(b => b.id === newBusiness.id ? newBusiness : b)
          console.log('✅ Updated business list during switch:', {
            totalCount: updatedList.length,
            businesses: updatedList.map(b => ({ id: b.id, name: b.business_name }))
          })
          return updatedList
        } else {
          console.log('➕ Adding new business during switch:', prevBusinesses.length + 1, 'total')
          const newList = [...prevBusinesses, newBusiness]
          console.log('✅ New business list after switch addition:', {
            totalCount: newList.length,
            businesses: newList.map(b => ({ id: b.id, name: b.business_name }))
          })
          return newList
        }
      })

      setError(null)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('businessCreated', handleBusinessCreated as EventListener)
      window.addEventListener('businessSwitched', handleBusinessSwitched as EventListener)
      return () => {
        window.removeEventListener('businessCreated', handleBusinessCreated as EventListener)
        window.removeEventListener('businessSwitched', handleBusinessSwitched as EventListener)
      }
    }
  }, [])

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

      console.log('🔄 Loading businesses for user:', user.email)
      console.log('📊 Current business state before load:', {
        currentBusiness: currentBusiness?.business_name,
        businessCount: businesses.length,
        businessIds: businesses.map(b => b.id)
      })

      let currentBiz: Business | null = null
      let businessList: Business[] = []

      // Load user's business from user profile
      try {
        const userResponse = await ideanApi.user.getMe()
        if (userResponse.business) {
          currentBiz = userResponse.business as any
          if (currentBiz) {
            businessList.push(currentBiz)
          }
          console.log('✅ User business loaded:', currentBiz?.business_name)

          // Check if there's a saved business in localStorage that's different
          const savedBusinessId = localStorage.getItem('businessId')
          if (savedBusinessId && currentBiz && savedBusinessId !== currentBiz.id) {
            // Try to load the saved business if it's different from user's primary business
            console.log('🔍 Found different saved business ID, will attempt to load all businesses')
          }
        } else {
          console.log('👤 User has no business yet')
          setHasLoaded(true)
          return
        }
      } catch (err: any) {
        console.log('📋 Failed to load user profile:', err.message)

        // If it's a rate limit error, stop trying and mark as loaded
        if (err.status === 429) {
          console.warn('⏳ Rate limited - will retry later')
          setHasLoaded(true)
          return
        }

        // For 404 or similar, user profile not found
        if (err.status === 404 || err.status === 400) {
          console.log('❌ User profile not found')
          setHasLoaded(true)
          return
        }
      }

      // Load all businesses that user has access to
      if (currentBiz) {
        try {
          const allBusinessResponse = await ideanApi.business.getAll({ limit: 50 })
          if (allBusinessResponse.items) {
            const allBizList = allBusinessResponse.items || []
            if (allBizList.length > 0) {
              businessList = allBizList
              console.log(`📊 Loaded ${allBizList.length} total businesses`)
            }
          }
        } catch (err: any) {
          console.warn('⚠️ Failed to load all businesses, using personal business only:', err.message)
          // Don't fail completely, just use the personal business
        }

        // Set the businesses list
        setBusinesses(businessList)
        console.log('✅ Business list updated:', {
          totalCount: businessList.length,
          businesses: businessList.map(b => ({ id: b.id, name: b.business_name }))
        })

        // Determine which business to set as current
        const savedBusinessId = localStorage.getItem('businessId')
        if (savedBusinessId) {
          // Try to find the saved business in our list
          const savedBusiness = businessList.find(b => b.id === savedBusinessId)
          if (savedBusiness) {
            console.log('🏠 Using saved business from localStorage:', savedBusiness.business_name)
            setCurrentBusiness(savedBusiness)
          } else {
            console.log('⚠️ Saved business not found in user\'s businesses, using primary business')
            setCurrentBusiness(currentBiz)
          }
        } else {
          // No saved business, use the primary one
          setCurrentBusiness(currentBiz)
        }
      }

    } catch (error: any) {
      console.error('❌ Failed to load businesses:', error)

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

    console.log('🔄 Switching to business:', business.business_name)

    // Update current business immediately for responsive UI
    setCurrentBusiness(business)

    // Emit business change event for immediate UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('businessChanged', {
        detail: business
      }))

      // Also emit a more specific event for data generation contexts
      window.dispatchEvent(new CustomEvent('businessSwitched', {
        detail: {
          previousBusinessId: currentBusiness?.id,
          newBusiness: business
        }
      }))
    }

    // Optionally refresh business data from server
    try {
      const updatedBusiness = await ideanApi.business.getById(businessId)
      if (updatedBusiness) {
        const refreshedBusiness = updatedBusiness
        setCurrentBusiness(refreshedBusiness)
        console.log('✅ Business data refreshed from server')

        // Update businesses list with refreshed data
        setBusinesses(prevBusinesses => {
          console.log('📊 BusinessContext: Before business refresh update:', {
            businessCount: prevBusinesses.length,
            refreshedBusinessId: businessId,
            refreshedBusinessName: refreshedBusiness.business_name
          })
          const updatedList = prevBusinesses.map(b => b.id === businessId ? refreshedBusiness : b)
          console.log('✅ Business list after refresh update:', {
            totalCount: updatedList.length,
            businesses: updatedList.map(b => ({ id: b.id, name: b.business_name }))
          })
          return updatedList
        })

        // Emit update event with refreshed data
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('businessDataRefreshed', {
            detail: refreshedBusiness
          }))
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to refresh business data from server:', error)
      // Continue with cached business data - not a critical failure
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

// Hook to listen for business switching events (more detailed than basic change)
export function useBusinessSwitchListener(
  callback: (data: { previousBusinessId?: string; newBusiness: Business }) => void
) {
  useEffect(() => {
    const handleBusinessSwitch = (event: CustomEvent) => {
      callback(event.detail)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('businessSwitched', handleBusinessSwitch as EventListener)
      return () => {
        window.removeEventListener('businessSwitched', handleBusinessSwitch as EventListener)
      }
    }
  }, [callback])
}

// Hook to listen for business data refresh events
export function useBusinessDataRefreshListener(callback: (business: Business) => void) {
  useEffect(() => {
    const handleBusinessRefresh = (event: CustomEvent) => {
      callback(event.detail)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('businessDataRefreshed', handleBusinessRefresh as EventListener)
      return () => {
        window.removeEventListener('businessDataRefreshed', handleBusinessRefresh as EventListener)
      }
    }
  }, [callback])
}

// Hook for data generation contexts to reset/refresh when business changes
export function useBusinessDataContext() {
  const { currentBusiness, loading } = useBusiness()

  return {
    currentBusiness,
    loading,
    businessId: currentBusiness?.id,
    businessName: currentBusiness?.business_name,
    industryTag: currentBusiness?.industry_tag,
    moduleSelect: currentBusiness?.module_select,
    businessContext: currentBusiness?.business_context,
    // Helper function to check if business data is ready for generation
    isReadyForGeneration: !loading && !!currentBusiness?.id
  }
}