'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'

interface Props {
  children: ReactNode
}

export function SessionProvider({ children }: Props) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          retry: (failureCount, error: any) => {
            // Don't retry on 401/403 errors
            if (error?.status === 401 || error?.status === 403) {
              return false
            }
            return failureCount < 3
          },
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}