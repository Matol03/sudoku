'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react'
import type { Difficulty } from '@/lib/sudoku/types'

// ── Logo ──────────────────────────────────────────────────────────────────────
function MasterLogo({ size = 28 }: { size?: number }) {
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

// ── Difficulty options ────────────────────────────────────────────────────────
const DIFFICULTIES: { id: Difficulty; label: string; dots: number; time: string }[] = [
  { id: 'beginner', label: 'Beginner', dots: 1, time: '3–6 min' },
  { id: 'easy',     label: 'Easy',     dots: 2, time: '6–10 min' },
  { id: 'medium',   label: 'Medium',   dots: 3, time: '10–18 min' },
  { id: 'hard',     label: 'Hard',     dots: 4, time: '18–30 min' },
  { id: 'expert',   label: 'Expert',   dots: 5, time: '30+ min' },
  { id: 'master',   label: 'Master',   dots: 6, time: '45+ min' },
]

export default function LandingPage() {
  const [selected, setSelected] = useState<Difficulty>('medium')

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* ── Minimal header ── */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <MasterLogo size={26} />
          <span
            className="font-display font-semibold"
            style={{ fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
          >
            Sudoku Master
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            href="/login"
            className="px-3 py-2 min-h-[40px] flex items-center"
            style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            Sign in
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-2 min-h-[40px] flex items-center text-sm font-medium rounded-[var(--radius-btn)]"
            style={{
              background: 'var(--accent)',
              color: 'white',
              textDecoration: 'none',
              boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 28%, transparent)',
            }}
          >
            Pro
          </Link>
        </div>
      </header>

      {/* ── Main: difficulty options + Play + Creator Mode ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 w-full">
        <div className="w-full max-w-md flex flex-col gap-4 sm:gap-5">

          {/* Difficulty grid — 2 cols on mobile, 3 on tablet+ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {DIFFICULTIES.map((d, i) => {
              const isActive = selected === d.id
              return (
                <motion.button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 22 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex flex-col items-start gap-1.5 p-3 sm:p-3.5 rounded-[var(--radius-btn)] min-h-[72px] sm:min-h-[78px]"
                  style={{
                    background: isActive ? 'var(--accent)' : 'var(--surface)',
                    border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    transition: 'background 0.18s, border-color 0.18s',
                    boxShadow: isActive
                      ? '0 4px 14px color-mix(in srgb, var(--accent) 28%, transparent)'
                      : undefined,
                  }}
                  aria-pressed={isActive}
                >
                  {/* dots */}
                  <span className="flex gap-0.5">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <span
                        key={j}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          background: j < d.dots
                            ? (isActive ? 'rgba(255,255,255,0.95)' : 'var(--accent)')
                            : (isActive ? 'rgba(255,255,255,0.25)' : 'var(--border)'),
                        }}
                      />
                    ))}
                  </span>
                  <span
                    className="font-display"
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: 1.05,
                      letterSpacing: '-0.01em',
                      color: isActive ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    {d.label}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: isActive ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
                      lineHeight: 1,
                    }}
                  >
                    {d.time}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Play button — full-width, tall, primary */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href={`/play?d=${selected}`}
              className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-btn)] font-display font-semibold relative overflow-hidden"
              style={{
                background: 'var(--accent)',
                color: 'white',
                textDecoration: 'none',
                minHeight: 56,
                fontSize: '17px',
                letterSpacing: '-0.01em',
                boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 32%, transparent)',
              }}
            >
              Play
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Creator Mode card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 sm:mt-3 p-4 sm:p-5 rounded-[var(--radius-board)]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center rounded-[var(--radius-btn)] flex-shrink-0"
                style={{
                  background: 'var(--accent-muted)',
                  width: 40,
                  height: 40,
                  color: 'var(--accent)',
                }}
              >
                <Wand2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="font-display font-semibold"
                    style={{
                      fontSize: '15px',
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Creator Mode
                  </h3>
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'var(--accent-muted)',
                      color: 'var(--accent)',
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                    }}
                  >
                    <Sparkles size={9} />
                    PRO
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Build your own Sudoku puzzles. Validate for a unique solution,
                  get an automatic difficulty rating, and share via link.
                </p>
              </div>
            </div>
            <Link
              href="/construct"
              className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-1.5 rounded-[var(--radius-btn)] font-medium"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '14px',
                minHeight: 44,
                background: 'var(--surface-elevated)',
              }}
            >
              Open Creator Mode
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
