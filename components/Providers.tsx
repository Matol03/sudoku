'use client'

import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSkinStore } from '@/stores/skinStore'
import { UserContext, useUserProvider } from '@/lib/hooks/useUser'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
})

function SkinHydrator() {
  const { activeSkin } = useSkinStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-skin', activeSkin)
  }, [activeSkin])

  return null
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useUserProvider()
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SkinHydrator />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
