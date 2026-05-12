import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

// Strip any character with code point > 0xFF so env values cannot inject
// invalid characters into fetch headers. See lib/supabase/client.ts for
// the full reasoning — same defense applied here for the server client.
function stripNonLatin1(s: string): string {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    if (code <= 0xFF) out += s[i]
  }
  return out
}

const URL_CLEAN     = stripNonLatin1((process.env.NEXT_PUBLIC_SUPABASE_URL      ?? '').trim())
const ANON_CLEAN    = stripNonLatin1((process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim())
const SERVICE_CLEAN = stripNonLatin1((process.env.SUPABASE_SERVICE_ROLE_KEY     ?? '').trim())

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    URL_CLEAN,
    ANON_CLEAN,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createServiceSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    URL_CLEAN,
    SERVICE_CLEAN,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
