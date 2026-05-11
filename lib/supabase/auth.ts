import { createClient } from './client'

const REDIRECT_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`

// ─── Input sanitizers ────────────────────────────────────────────────────────
// Trim + Unicode-normalize. Helps when users paste values containing invisible
// codepoints (zero-width spaces, BOM, smart-quote autocorrect, etc.) which can
// leak into URL params or stored values and break fetch later.
function cleanEmail(s: string): string {
  return s.trim().normalize('NFC').toLowerCase()
}
function cleanPassword(s: string): string {
  // Don't trim password — leading/trailing spaces can be intentional.
  return s.normalize('NFC')
}
function cleanUsername(s: string | undefined): string | undefined {
  if (!s) return undefined
  const t = s.trim().normalize('NFC')
  return t.length === 0 ? undefined : t
}

// ─── Local-storage / cookie cache reset ──────────────────────────────────────
// If the browser has a corrupted Supabase auth token (rare, but causes
// "non ISO-8859-1 code point" fetch errors because the bad token ends up in
// the Authorization header), wipe it so the next call uses fresh anon auth.
export function clearLocalAuthCache(): void {
  if (typeof window === 'undefined') return

  // localStorage entries written by @supabase/auth-js
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase.auth')) {
      try { localStorage.removeItem(key) } catch {}
    }
  })

  // Cookies written by @supabase/ssr (cookie-backed storage)
  document.cookie.split(';').forEach(raw => {
    const eqIdx = raw.indexOf('=')
    const name = (eqIdx > -1 ? raw.slice(0, eqIdx) : raw).trim()
    if (name.startsWith('sb-')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
}

// ─── Auth methods ────────────────────────────────────────────────────────────
export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail(email),
    password: cleanPassword(password),
  })
  return { data, error }
}

export async function signInWithMagicLink(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail(email),
    options: { emailRedirectTo: REDIRECT_URL },
  })
  return { error }
}

export async function signInWithGoogle() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: REDIRECT_URL },
  })
  return { error }
}

export async function signUp(email: string, password: string, username?: string) {
  const supabase = createClient()
  const u = cleanUsername(username)
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail(email),
    password: cleanPassword(password),
    options: {
      emailRedirectTo: REDIRECT_URL,
      data: u ? { username: u } : undefined,
    },
  })
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
