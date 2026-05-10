'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

const PRO_FEATURES = [
  'Unlimited hints — no daily limit',
  'AI Trainer powered by Claude Sonnet',
  'Beach skin unlocked',
  'Aurora (exclusive Pro-only skin)',
  'All future skins included automatically',
  'Global daily puzzle leaderboard',
  'Advanced statistics & technique tracking',
  'Priority support',
]

const FREE_FEATURES = [
  '5 difficulty levels (Beginner → Master)',
  '5 hints per day',
  'Classic, Dark, Kazakh, Japan & Royal skins',
  'Full move history & unlimited undo',
  'Notes (pencil marks) mode',
  'Daily puzzle',
  'Personal stats dashboard',
  'No account required to play',
]

type CheckoutState = 'idle' | 'loading' | 'error'
type ProductKey = 'pro_monthly' | 'pro_yearly' | 'beach_skin'

export default function PricingPage() {
  const { user, isPro } = useUser()
  const router = useRouter()
  const [proState, setProState] = useState<CheckoutState>('idle')
  const [yearlyState, setYearlyState] = useState<CheckoutState>('idle')
  const [beachState, setBeachState] = useState<CheckoutState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function startCheckout(product: ProductKey, setState: (s: CheckoutState) => void) {
    if (!user) { router.push('/login?next=/pricing'); return }

    setState('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed')
      window.location.href = data.url
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1
            className="font-display mb-4"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}
          >
            Simple pricing.<br />No surprises.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
            Free to play forever. Pro for the complete experience.
          </p>
          {isPro && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 font-medium"
              style={{ color: 'var(--accent)', fontSize: '15px' }}
            >
              ✓ You're already on Pro — thanks!
            </motion.p>
          )}
        </motion.div>

        {errorMsg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-6 px-4 py-3 rounded-[var(--radius-btn)] text-sm"
            style={{ background: 'var(--cell-error-bg)', color: 'var(--error)' }}
          >
            {errorMsg}
          </motion.p>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col p-8 rounded-[var(--radius-board)]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="mb-6">
              <h2 className="font-display font-semibold mb-1" style={{ fontSize: '20px', color: 'var(--text-primary)' }}>Free</h2>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold" style={{ fontSize: '48px', lineHeight: 1, color: 'var(--text-primary)' }}>$0</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: 4 }}>Forever. No card required.</p>
            </div>
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3">
                  <Check size={14} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/play"
              className="flex items-center justify-center py-3 rounded-[var(--radius-btn)] font-semibold text-sm"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--surface-elevated)' }}
            >
              Start playing
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col p-8 rounded-[var(--radius-board)] relative overflow-hidden"
            style={{ background: 'var(--accent)', border: '1px solid var(--accent)' }}
          >
            <div
              className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <Sparkles size={12} color="white" />
              <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>Most popular</span>
            </div>

            <div className="mb-6">
              <h2 className="font-display font-semibold mb-1" style={{ fontSize: '20px', color: 'white' }}>Pro</h2>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold" style={{ fontSize: '48px', lineHeight: 1, color: 'white' }}>$4.99</span>
                <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>/month</span>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                Or $39/year — save 35%
              </p>
            </div>

            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3">
                  <Check size={14} style={{ color: 'rgba(255,255,255,0.9)', flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2">
              <CheckoutButton
                label="Start Pro — $4.99/month"
                state={proState}
                disabled={isPro}
                onClick={() => startCheckout('pro_monthly', setProState)}
                style={{ background: 'white', color: 'var(--accent)' }}
              />
              <CheckoutButton
                label="Start Pro — $39/year (save 35%)"
                state={yearlyState}
                disabled={isPro}
                onClick={() => startCheckout('pro_yearly', setYearlyState)}
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              />
            </div>

            <p className="mt-3 text-center" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Cancel anytime. No commitment.
            </p>
          </motion.div>
        </div>

        {/* Beach skin standalone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-[var(--radius-board)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div>
            <h3 className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
              Beach skin — one-time purchase
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Sun-bleached pastels, sand texture, wave animation on completion. Yours forever.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="font-display font-bold" style={{ fontSize: '24px', color: 'var(--text-primary)' }}>$2.99</span>
            <CheckoutButton
              label="Buy Beach skin"
              state={beachState}
              disabled={isPro}
              onClick={() => startCheckout('beach_skin', setBeachState)}
              style={{ background: 'var(--accent)', color: 'white', padding: '8px 20px', whiteSpace: 'nowrap' }}
            />
          </div>
        </motion.div>

        {!user && (
          <p className="text-center mt-8" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            <Link href="/login?next=/pricing" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
            {' '}or{' '}
            <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>create an account</Link>
            {' '}to purchase.
          </p>
        )}
      </main>
    </div>
  )
}

function CheckoutButton({
  label,
  state,
  disabled,
  onClick,
  style = {},
}: {
  label: string
  state: CheckoutState
  disabled: boolean
  onClick: () => void
  style?: React.CSSProperties
}) {
  const isLoading = state === 'loading'
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="flex items-center justify-center gap-2 py-3 rounded-[var(--radius-btn)] font-semibold text-sm"
      style={{
        border: 'none',
        cursor: isLoading || disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {isLoading && <Loader2 size={14} className="animate-spin" />}
      {disabled ? 'Already unlocked' : isLoading ? 'Redirecting…' : label}
    </button>
  )
}
