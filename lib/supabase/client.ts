import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// ─── Defensive sanitization ────────────────────────────────────────────────
//
// The browser's fetch API rejects any RequestInit.headers value containing a
// code point outside ISO-8859-1 (0..255), throwing
//   "Failed to read the 'headers' property from 'RequestInit':
//    String contains non ISO-8859-1 code point."
//
// Supabase only ever uses ASCII for its own headers (apikey, X-Client-Info,
// etc.), but the values for Authorization / apikey come straight from the
// project's anon key — i.e. a process.env value. If that env value was
// pasted into the Vercel dashboard from an editor that prepends a BOM (U+FEFF
// = 65279), or contains a stray non-breaking space (U+00A0 = 160 — which IS
// Latin-1 but signals bad copy/paste) or a smart quote, those characters end
// up in the Authorization header and the entire auth flow breaks.
//
// Two layers of defense below:
//   1. Strip non-Latin-1 from env values at client construction (root fix).
//   2. Sanitize every header value in the global fetch hook (belt-and-braces:
//      catches anything that slipped past, including session tokens that
//      may have been corrupted in localStorage by an older client version).

function stripNonLatin1(s: string): string {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    if (code <= 0xFF) out += s[i]
  }
  return out
}

function clearCorruptedAuthLocal(): void {
  if (typeof window === 'undefined') return
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('sb-') || k.includes('supabase.auth')) {
        localStorage.removeItem(k)
      }
    })
    document.cookie.split(';').forEach(raw => {
      const eq = raw.indexOf('=')
      const name = (eq > -1 ? raw.slice(0, eq) : raw).trim()
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    })
  } catch {}
}

function sanitizeHeaders(h: HeadersInit | undefined): HeadersInit | undefined {
  if (!h) return h

  const out: Record<string, string> = {}
  const visit = (key: string, value: string) => {
    const clean = stripNonLatin1(value)
    if (clean.length !== value.length) {
      if (typeof window !== 'undefined') {
        console.warn(
          `[supabase-fetch] Stripped non-Latin-1 chars from header "${key}".`
        )
        // Self-heal: if the corruption is in the Authorization or apikey
        // header, the stored session token is bad. Clear it so the next
        // request rebuilds clean state.
        if (/^authorization$|^apikey$/i.test(key)) {
          clearCorruptedAuthLocal()
        }
      }
    }
    out[key] = clean
  }

  if (h instanceof Headers) {
    h.forEach((value, key) => visit(key, value))
  } else if (Array.isArray(h)) {
    for (const [key, value] of h) visit(key, value)
  } else {
    for (const [key, value] of Object.entries(h)) visit(key, String(value))
  }

  return out
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!init?.headers) return fetch(input, init)
  return fetch(input, { ...init, headers: sanitizeHeaders(init.headers) })
}

// ─── Client factory ────────────────────────────────────────────────────────
export function createClient() {
  const url = stripNonLatin1((process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim())
  const key = stripNonLatin1((process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim())

  return createBrowserClient<Database>(url, key, {
    global: { fetch: safeFetch },
  })
}
