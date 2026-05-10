'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { signUp, signInWithGoogle } from '@/lib/supabase/auth'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifyEmail, setVerifyEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { data, error } = await signUp(email, password, username || undefined)
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // If email confirmation is required, show verify message
    if (data.user && !data.session) {
      setVerifyEmail(true)
    } else {
      router.push('/play')
    }
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  const inputStyle = {
    background: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1
            className="font-display font-bold mb-2"
            style={{ fontSize: '28px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Create account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Free forever. Sync progress across devices.
          </p>
        </div>

        <div
          className="p-6 rounded-[var(--radius-board)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <AnimatePresence mode="wait">
            {verifyEmail ? (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="text-3xl mb-3">✉️</div>
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Check your inbox
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                  We sent a confirmation link to{' '}
                  <strong>{email}</strong>.
                  Click it to activate your account.
                </p>
                <Link
                  href="/play"
                  className="inline-block mt-5 text-sm"
                  style={{ color: 'var(--accent)', fontWeight: 600 }}
                >
                  Continue playing as guest →
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-3"
              >
                <button
                  type="button"
                  onClick={handleGoogle}
                  className="py-2.5 rounded-[var(--radius-btn)] text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span style={{ fontSize: '12px' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                <input
                  type="text"
                  placeholder="Username (optional)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  className="px-3 py-2.5 rounded-[var(--radius-btn)] text-sm outline-none"
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="px-3 py-2.5 rounded-[var(--radius-btn)] text-sm outline-none"
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Password (8+ characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  className="px-3 py-2.5 rounded-[var(--radius-btn)] text-sm outline-none"
                  style={inputStyle}
                />

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm px-3 py-2 rounded-[var(--radius-btn)]"
                      style={{ background: 'var(--cell-error-bg)', color: 'var(--error)' }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 rounded-[var(--radius-btn)] text-sm font-semibold mt-1"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>

                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  By signing up you agree to our Terms and Privacy Policy.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-4" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
