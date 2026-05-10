'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useSkinStore } from '@/stores/skinStore'

export default function PricingSuccessPage() {
  const { unlockSkin } = useSkinStore()

  // Optimistically unlock beach + aurora — the webhook also handles this server-side
  useEffect(() => {
    unlockSkin('beach')
    unlockSkin('aurora')
  }, [unlockSkin])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--accent-muted)' }}
        >
          <Sparkles size={28} style={{ color: 'var(--accent)' }} />
        </motion.div>

        <h1
          className="font-display font-bold mb-3"
          style={{ fontSize: '32px', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}
        >
          You're Pro.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.6, marginBottom: 32 }}>
          Unlimited hints, AI Trainer, Beach skin, Aurora skin, and all future skins are now unlocked.
          Thank you.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/play"
            className="flex items-center justify-center py-3 rounded-[var(--radius-btn)] font-semibold text-sm"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Back to the board
          </Link>
          <Link
            href="/skins"
            className="flex items-center justify-center py-3 rounded-[var(--radius-btn)] text-sm"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Explore your new skins
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
