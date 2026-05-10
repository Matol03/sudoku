'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UserContextValue {
  user: User | null
  loading: boolean
  isPro: boolean
}

// Exported for use in Providers.tsx
export const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  isPro: false,
})

export function useUser() {
  return useContext(UserContext)
}

export function useUserProvider(): UserContextValue {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
      if (user) fetchProfile(user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setIsPro(false)
    })

    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', userId)
        .single()
      const profile = data as { subscription_status: string | null } | null
      setIsPro(profile?.subscription_status === 'pro')
    }

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, isPro }
}
