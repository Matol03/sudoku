'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Board } from '@/components/game/Board'
import { useGameStore } from '@/stores/gameStore'
import { generatePuzzle } from '@/lib/sudoku/generator'
import { Bot, Palette, Zap, Shield, ChevronRight, ArrowRight } from 'lucide-react'

function AtelierLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="6" fill="var(--accent)" />
      <line x1="10.67" y1="5" x2="10.67" y2="27" stroke="white" strokeWidth="1.2" opacity="0.35"/>
      <line x1="21.33" y1="5" x2="21.33" y2="27" stroke="white" strokeWidth="1.2" opacity="0.35"/>
      <line x1="5" y1="10.67" x2="27" y2="10.67" stroke="white" strokeWidth="1.2" opacity="0.35"/>
      <line x1="5" y1="21.33" x2="27" y2="21.33" stroke="white" strokeWidth="1.2" opacity="0.35"/>
      <circle cx="16" cy="16" r="2.8" fill="white" opacity="0.9" />
      <circle cx="16" cy="16" r="1.4" fill="var(--accent)" />
    </svg>
  )
}

function HeroBoard() {
  const { setPuzzle, puzzle } = useGameStore()

  useEffect(() => {
    const p = generatePuzzle('easy')
    setPuzzle(p)
  }, [setPuzzle])

  if (!puzzle) return (
    <div
      className="aspect-square rounded-[var(--radius-board)]"
      style={{
        width: 'min(90vw, 420px)',
        background: 'var(--board-bg)',
        border: '2px solid var(--grid-line-thick)',
      }}
    />
  )

  return <Board />
}

const FEATURES = [
  {
    icon: <Zap size={20} />,
    title: 'Instant generation',
    body: 'Every puzzle is uniquely generated with guaranteed single solution. Six difficulties, from Beginner to Master.',
  },
  {
    icon: <Bot size={20} />,
    title: 'AI Trainer',
    body: 'Your personal coach sees the board and teaches technique — never just giving answers. Powered by Claude.',
  },
  {
    icon: <Palette size={20} />,
    title: 'Seven skins',
    body: 'Classic, Dark, Kazakh, Japan, Royal, Beach, and Aurora. Each a distinct identity, not just a recolor.',
  },
  {
    icon: <Shield size={20} />,
    title: 'Your progress, everywhere',
    body: 'Auto-saved on every move. Sign in to sync across devices. Play as a guest, upgrade anytime.',
  },
]

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    features: [
      '5 difficulty levels',
      '5 hints per day',
      'Classic, Dark, Kazakh, Japan & Royal skins',
      'Full move history & undo',
      'Daily puzzle',
      'Personal stats',
    ],
    cta: 'Play now',
    href: '/play',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: '/month',
    features: [
      'Everything in Free',
      'Unlimited hints',
      'AI Trainer (Claude-powered)',
      'Beach & Aurora skins included',
      'All future skins included',
      'Global daily leaderboard',
      'Advanced statistics',
    ],
    cta: 'Start Pro',
    href: '/pricing',
    highlight: true,
  },
]

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -40])

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 h-16"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <AtelierLogo size={28} />
          <span className="font-display font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Sudoku Atelier
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {['Features', 'Skins', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}>
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Sign in</Link>
          <Link
            href="/play"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-[var(--radius-btn)]"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Play free <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero — split layout */}
      <section className="relative flex-1 grid md:grid-cols-2 min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left: interactive board */}
        <motion.div
          style={{ y: heroY }}
          className="flex items-center justify-center p-8 md:p-12 order-2 md:order-1"
        >
          <HeroBoard />
        </motion.div>

        {/* Right: editorial copy */}
        <div
          className="flex flex-col justify-center px-8 md:px-12 py-12 order-1 md:order-2"
          style={{ borderLeft: '1px solid var(--border)' }}
        >
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p
              className="mb-4 tracking-widest uppercase"
              style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.2em' }}
            >
              Sudoku Atelier
            </p>
            <h1
              className="font-display mb-6"
              style={{
                fontSize: 'clamp(36px, 4.5vw, 64px)',
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}
            >
              The thinking<br/>
              person's<br/>
              Sudoku.
            </h1>
            <p
              className="mb-8 leading-relaxed"
              style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '400px' }}
            >
              Crafted for the player who values elegance.
              Seven hand-designed skins, AI coaching
              that teaches technique, and a daily puzzle
              that resets every morning.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/play"
                className="flex items-center gap-2 px-6 py-3 font-semibold rounded-[var(--radius-btn)]"
                style={{ background: 'var(--accent)', color: 'white', fontSize: '15px' }}
              >
                Play now — it's free
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/skins"
                className="flex items-center gap-2 px-6 py-3 font-medium rounded-[var(--radius-btn)]"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '15px' }}
              >
                View skins
              </Link>
            </div>
            <p className="mt-4" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              No account required to start playing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-10 py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2
              className="font-display mb-3"
              style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
            >
              Built different.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '17px' }}>
              Not another Sudoku clone. Every detail is intentional.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-[var(--radius-board)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="mb-3" style={{ color: 'var(--accent)' }}>{f.icon}</div>
                <h3 className="font-display font-semibold mb-2" style={{ color: 'var(--text-primary)', fontSize: '16px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skins showcase */}
      <section id="skins" className="px-6 md:px-10 py-20" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2
              className="font-display mb-3"
              style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
            >
              Seven identities.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '17px', maxWidth: 520 }}>
              Each skin is a complete visual environment — different typography, borders, animations, and personality.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {[
              { name: 'Classic', bg: '#f5f0e6', accent: '#1e3a6e' },
              { name: 'Dark',    bg: '#0a0a0a', accent: '#2de0c8' },
              { name: 'Kazakh', bg: '#131c38', accent: '#f0b429' },
              { name: 'Japan',  bg: '#f2ede4', accent: '#cc2b1e' },
              { name: 'Royal',  bg: '#160d10', accent: '#d4a435' },
              { name: 'Beach',  bg: '#ede5d2', accent: '#2ca89a' },
              { name: 'Aurora', bg: '#0e1128', accent: '#3de8a0' },
            ].map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-full aspect-square rounded-lg flex items-center justify-center"
                  style={{ background: s.bg, border: `2px solid ${s.accent}44` }}
                >
                  <div
                    className="w-6 h-6 rounded-sm"
                    style={{ background: s.accent, opacity: 0.8 }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.name}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/skins"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-[var(--radius-btn)]"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Browse all skins <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-10 py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="font-display mb-3"
              style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
            >
              Simple pricing.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '17px' }}>
              Free forever. Pro when you want more.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col p-6 rounded-[var(--radius-board)]"
                style={{
                  background: plan.highlight ? 'var(--accent)' : 'var(--surface)',
                  border: `1px solid ${plan.highlight ? 'var(--accent)' : 'var(--border)'}`,
                  color: plan.highlight ? 'white' : 'var(--text-primary)',
                }}
              >
                <div className="mb-4">
                  <div className="text-sm font-semibold mb-1 opacity-80">{plan.name}</div>
                  <div>
                    <span className="font-display text-4xl font-bold">{plan.price}</span>
                    <span className="opacity-70 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 opacity-80">✓</span>
                      <span style={{ opacity: 0.85 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="flex items-center justify-center py-2.5 rounded-[var(--radius-btn)] text-sm font-semibold"
                  style={{
                    background: plan.highlight ? 'white' : 'var(--accent)',
                    color: plan.highlight ? 'var(--accent)' : 'white',
                  }}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-10 py-10"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AtelierLogo size={22} />
            <span className="font-display text-sm" style={{ color: 'var(--text-muted)' }}>Sudoku Atelier</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            The thinking person's Sudoku. Built with craft.
          </p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
