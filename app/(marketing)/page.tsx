'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Board } from '@/components/game/Board'
import { useGameStore } from '@/stores/gameStore'
import { generatePuzzle } from '@/lib/sudoku/generator'
import type { Difficulty } from '@/lib/sudoku/types'
import { Bot, Palette, Zap, Shield, ChevronRight, ArrowRight, ArrowUpRight } from 'lucide-react'

// ── Logo ──────────────────────────────────────────────────────────────────────
function MasterLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="7" fill="var(--accent)" />
      <line x1="10.67" y1="5" x2="10.67" y2="27" stroke="white" strokeWidth="1.2" opacity="0.35"/>
      <line x1="21.33" y1="5" x2="21.33" y2="27" stroke="white" strokeWidth="1.2" opacity="0.35"/>
      <line x1="5" y1="10.67" x2="27" y2="10.67" stroke="white" strokeWidth="1.2" opacity="0.35"/>
      <line x1="5" y1="21.33" x2="27" y2="21.33" stroke="white" strokeWidth="1.2" opacity="0.35"/>
      <circle cx="16" cy="16" r="2.8" fill="white" opacity="0.95" />
      <circle cx="16" cy="16" r="1.3" fill="var(--accent)" />
    </svg>
  )
}

// ── Hero preview board (loads an easy puzzle once) ────────────────────────────
function HeroBoard() {
  const { setPuzzle, puzzle } = useGameStore()

  useEffect(() => {
    if (!puzzle) {
      setPuzzle(generatePuzzle('easy'))
    }
  }, [puzzle, setPuzzle])

  if (!puzzle) {
    return (
      <div
        className="aspect-square rounded-[var(--radius-board)]"
        style={{
          width: 'min(78vw, 460px)',
          background: 'var(--board-bg)',
          border: '2px solid var(--grid-line-thick)',
        }}
      />
    )
  }

  return <Board />
}

// ── Difficulty options ────────────────────────────────────────────────────────
const DIFFICULTIES: { id: Difficulty; label: string; dots: number; time: string; blurb: string }[] = [
  { id: 'beginner', label: 'Beginner', dots: 1, time: '3–6 min',  blurb: 'Gentle warm-up' },
  { id: 'easy',     label: 'Easy',     dots: 2, time: '6–10 min', blurb: 'Naked singles' },
  { id: 'medium',   label: 'Medium',   dots: 3, time: '10–18 min', blurb: 'Hidden singles' },
  { id: 'hard',     label: 'Hard',     dots: 4, time: '18–30 min', blurb: 'Locked pairs' },
  { id: 'expert',   label: 'Expert',   dots: 5, time: '30+ min',  blurb: 'X-Wings, fish' },
  { id: 'master',   label: 'Master',   dots: 6, time: '45+ min',  blurb: 'No mercy' },
]

function DifficultyGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 w-full">
      {DIFFICULTIES.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + i * 0.04, type: 'spring', stiffness: 260, damping: 22 }}
        >
          <Link
            href={`/play?d=${d.id}`}
            className="group relative flex flex-col gap-1.5 p-3.5 rounded-[var(--radius-btn)] overflow-hidden transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              textDecoration: 'none',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="flex gap-0.5">
                {Array.from({ length: 6 }).map((_, j) => (
                  <span
                    key={j}
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      background: j < d.dots ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                ))}
              </span>
              <ArrowUpRight
                size={13}
                style={{ color: 'var(--text-muted)', transition: 'transform 0.2s, color 0.2s' }}
                className="group-hover:[transform:translate(2px,-2px)] group-hover:[color:var(--accent)]"
              />
            </div>
            <div>
              <div
                className="font-display"
                style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                {d.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                {d.time} · {d.blurb}
              </div>
            </div>
            {/* Hover accent slide */}
            <span
              aria-hidden
              className="absolute left-0 right-0 bottom-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              style={{ background: 'var(--accent)' }}
            />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Zap size={20} />,
    title: 'Instant generation',
    body: 'Every puzzle uniquely generated with a guaranteed single solution. Six difficulties, off-main-thread.',
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
    title: 'Progress, everywhere',
    body: 'Auto-saved every move. Sign in to sync across devices. Play as a guest, upgrade anytime.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 backdrop-blur"
        style={{ background: 'color-mix(in srgb, var(--bg) 88%, transparent)', borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
          <MasterLogo size={28} />
          <span
            className="font-display font-semibold"
            style={{ fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
          >
            Sudoku Master
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {['Features', 'Skins', 'Pricing'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}
              className="hover:[color:var(--text-primary)] transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-block px-3 py-1.5"
            style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            Sign in
          </Link>
          <Link
            href="/play"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-[var(--radius-btn)]"
            style={{
              background: 'var(--accent)',
              color: 'white',
              textDecoration: 'none',
              boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 28%, transparent)',
            }}
          >
            Play free <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ─────────────── Hero: strong horizontal split ─────────────── */}
      <section className="relative flex-1 grid lg:grid-cols-[1.05fr_1fr] min-h-[calc(100vh-4rem)]">
        {/* LEFT: editorial content + difficulty grid */}
        <div className="flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 lg:py-0 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-xl w-full"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
              style={{ background: 'var(--accent-muted)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}
            >
              <span
                className="inline-block"
                style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--accent)' }}
              />
              <span
                style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                Sudoku Master
              </span>
            </div>

            <h1
              className="font-display mb-5"
              style={{
                fontSize: 'clamp(40px, 5.5vw, 68px)',
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: '-0.032em',
                color: 'var(--text-primary)',
              }}
            >
              The thinking<br />
              person's<br />
              <span style={{ color: 'var(--accent)' }}>Sudoku.</span>
            </h1>

            <p
              className="mb-8 leading-relaxed"
              style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: 460 }}
            >
              Six difficulties from a gentle warm-up to puzzles that demand X-Wings.
              Pick one and start playing — no signup required.
            </p>

            {/* DIFFICULTY GRID — the horizontal interface */}
            <DifficultyGrid />

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/play/daily"
                className="inline-flex items-center gap-1.5"
                style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none' }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }} />
                Today's daily puzzle
                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              </Link>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>·</span>
              <Link
                href="/construct"
                className="inline-flex items-center gap-1.5"
                style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                Constructor Mode (Pro)
                <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: live preview board */}
        <div
          className="relative flex items-center justify-center p-8 md:p-12 lg:p-16 order-1 lg:order-2 overflow-hidden"
          style={{
            background: 'color-mix(in srgb, var(--accent) 4%, var(--bg))',
            borderLeft: '1px solid var(--border)',
          }}
        >
          {/* Decorative grid pattern */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            className="relative"
          >
            <HeroBoard />
            {/* Subtle caption under the board */}
            <p
              className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Live preview · Classic skin
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────────── Features ─────────────── */}
      <section id="features" className="px-6 md:px-10 py-24" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2
              className="font-display mb-3"
              style={{ fontSize: 'clamp(30px, 3.5vw, 46px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}
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
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -2 }}
                className="p-6 rounded-[var(--radius-board)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="mb-3" style={{ color: 'var(--accent)' }}>{f.icon}</div>
                <h3
                  className="font-display font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontSize: '16px', letterSpacing: '-0.01em' }}
                >
                  {f.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── Skins ─────────────── */}
      <section id="skins" className="px-6 md:px-10 py-24" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2
              className="font-display mb-3"
              style={{ fontSize: 'clamp(30px, 3.5vw, 46px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}
            >
              Seven identities.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '17px', maxWidth: 520 }}>
              Each skin is a complete visual environment — typography, borders, animations, personality.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {[
              { name: 'Classic', bg: '#f5f0e6', accent: '#1e3a6e' },
              { name: 'Dark',    bg: '#0a0a0a', accent: '#2de0c8' },
              { name: 'Kazakh',  bg: '#131c38', accent: '#f0b429' },
              { name: 'Japan',   bg: '#f2ede4', accent: '#cc2b1e' },
              { name: 'Royal',   bg: '#160d10', accent: '#d4a435' },
              { name: 'Beach',   bg: '#ede5d2', accent: '#2ca89a' },
              { name: 'Aurora',  bg: '#0e1128', accent: '#3de8a0' },
            ].map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-full aspect-square rounded-lg flex items-center justify-center"
                  style={{ background: s.bg, border: `2px solid ${s.accent}44` }}
                >
                  <div
                    className="w-6 h-6 rounded-sm"
                    style={{ background: s.accent, opacity: 0.85 }}
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
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none' }}
            >
              Browse all skins <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────── Pricing ─────────────── */}
      <section id="pricing" className="px-6 md:px-10 py-24" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="font-display mb-3"
              style={{ fontSize: 'clamp(30px, 3.5vw, 46px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}
            >
              Simple pricing.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '17px' }}>
              Free forever. Pro when you want more.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: 'Free', price: '$0', period: '',
                features: ['5 difficulty levels', '5 hints per day', '5 free skins', 'Full undo & redo', 'Daily puzzle', 'Personal stats'],
                cta: 'Play now', href: '/play', highlight: false,
              },
              {
                name: 'Pro', price: '$4.99', period: '/month',
                features: ['Everything in Free', 'Unlimited hints', 'AI Trainer (Claude)', 'Beach & Aurora skins', 'All future skins', 'Constructor Mode', 'Global leaderboard'],
                cta: 'Start Pro', href: '/pricing', highlight: true,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col p-7 rounded-[var(--radius-board)]"
                style={{
                  background: plan.highlight ? 'var(--accent)' : 'var(--surface)',
                  border: `1px solid ${plan.highlight ? 'var(--accent)' : 'var(--border)'}`,
                  color: plan.highlight ? 'white' : 'var(--text-primary)',
                  boxShadow: plan.highlight ? '0 8px 28px color-mix(in srgb, var(--accent) 22%, transparent)' : undefined,
                }}
              >
                <div className="mb-5">
                  <div className="text-sm font-semibold mb-1 opacity-80">{plan.name}</div>
                  <div>
                    <span className="font-display text-4xl font-bold">{plan.price}</span>
                    <span className="opacity-70 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 opacity-85">✓</span>
                      <span style={{ opacity: 0.88 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="flex items-center justify-center py-2.5 rounded-[var(--radius-btn)] text-sm font-semibold"
                  style={{
                    background: plan.highlight ? 'white' : 'var(--accent)',
                    color: plan.highlight ? 'var(--accent)' : 'white',
                    textDecoration: 'none',
                  }}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── Footer ─────────────── */}
      <footer className="px-6 md:px-10 py-10" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MasterLogo size={22} />
            <span className="font-display text-sm" style={{ color: 'var(--text-muted)' }}>
              Sudoku Master
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            The thinking person's Sudoku. Built with craft.
          </p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
