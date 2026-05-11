'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Wand2, CheckCircle2, Share2 } from 'lucide-react'
import { generatePuzzle } from '@/lib/sudoku/generator'
import { SkinSwitcher } from '@/components/game/SkinSwitcher'
import type { Difficulty } from '@/lib/sudoku/types'

// ── Logo ──────────────────────────────────────────────────────────────────────
function MasterLogo({ size = 26 }: { size?: number }) {
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

// ── Static preview board ─────────────────────────────────────────────────────
function LandingBoard({ maxWidth = 360 }: { maxWidth?: number }) {
  const [givens, setGivens] = useState<number[] | null>(null)

  useEffect(() => {
    const puzzle = generatePuzzle('easy')
    setGivens([...puzzle.givens])
  }, [])

  if (!givens) {
    return (
      <div
        aria-hidden
        style={{
          width: '100%',
          maxWidth,
          aspectRatio: '1',
          background: 'var(--board-bg)',
          borderRadius: 'var(--radius-board)',
          border: '2px solid var(--grid-line-thick)',
          margin: '0 auto',
        }}
      />
    )
  }

  return (
    <motion.div
      role="img"
      aria-label="Sudoku puzzle preview"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(9, 1fr)',
        gridTemplateRows: 'repeat(9, 1fr)',
        width: '100%',
        maxWidth,
        aspectRatio: '1',
        background: 'var(--board-bg)',
        borderRadius: 'var(--radius-board)',
        boxShadow: 'var(--shadow-board)',
        border: '2px solid var(--grid-line-thick)',
        overflow: 'hidden',
        margin: '0 auto',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {givens.map((v, i) => {
        const row = Math.floor(i / 9)
        const col = i % 9
        const thickR = col === 2 || col === 5
        const thickB = row === 2 || row === 5
        return (
          <div
            key={i}
            style={{
              borderRight: col < 8
                ? `${thickR ? 2 : 1}px solid ${thickR ? 'var(--grid-line-thick)' : 'var(--grid-line)'}`
                : undefined,
              borderBottom: row < 8
                ? `${thickB ? 2 : 1}px solid ${thickB ? 'var(--grid-line-thick)' : 'var(--grid-line)'}`
                : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {v !== 0 && (
              <span
                className="font-numeral"
                style={{
                  fontSize: 'clamp(11px, 2.4vw, 20px)',
                  color: 'var(--cell-given)',
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {v}
              </span>
            )}
          </div>
        )
      })}
    </motion.div>
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
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16 gap-2 sticky top-0 z-30 backdrop-blur"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--bg) 90%, transparent)',
        }}
      >
        <Link href="/" className="flex items-center gap-2 min-w-0" style={{ textDecoration: 'none' }}>
          <MasterLogo size={26} />
          <span
            className="font-display font-semibold hidden xs:inline sm:inline truncate"
            style={{ fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
          >
            Sudoku Master
          </span>
        </Link>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <SkinSwitcher placement="bottom-right" compact />
          <Link
            href="/login"
            className="px-2.5 sm:px-3 py-2 min-h-[40px] flex items-center text-xs sm:text-sm whitespace-nowrap"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            Sign in
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-2 min-h-[40px] flex items-center text-xs sm:text-sm font-medium rounded-[var(--radius-btn)]"
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

      {/* ── HERO: horizontal split on lg+, stacked on mobile ── */}
      <section className="px-4 sm:px-8 py-6 sm:py-10 lg:py-14">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
          {/* LEFT: preview board */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center justify-center order-1 lg:order-1"
          >
            <LandingBoard maxWidth={420} />
          </motion.div>

          {/* RIGHT: difficulty grid + Play */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            className="flex flex-col gap-3 sm:gap-4 order-2 lg:order-2 w-full"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {DIFFICULTIES.map((d, i) => {
                const isActive = selected === d.id
                return (
                  <motion.button
                    key={d.id}
                    onClick={() => setSelected(d.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.04, type: 'spring', stiffness: 280, damping: 22 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex flex-col items-start gap-1.5 p-3 sm:p-3.5 rounded-[var(--radius-btn)] min-h-[72px] sm:min-h-[82px]"
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
                        color: isActive ? 'rgba(255,255,255,0.78)' : 'var(--text-muted)',
                        lineHeight: 1,
                      }}
                    >
                      {d.time}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href={`/play?d=${selected}`}
                className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-btn)] font-display font-semibold"
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
          </motion.div>
        </div>
      </section>

      {/* ── SPECIAL SECTION: Creator Mode ── */}
      <section className="px-4 sm:px-8 pb-10 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto rounded-[var(--radius-board)] overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, var(--surface)) 0%, var(--surface) 70%)',
            border: '1.5px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          }}
        >
          {/* Decorative grid pattern */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 p-6 sm:p-10 items-center">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className="flex items-center justify-center rounded-[var(--radius-btn)]"
                  style={{
                    width: 48,
                    height: 48,
                    background: 'var(--accent)',
                    color: 'white',
                    boxShadow: '0 4px 14px color-mix(in srgb, var(--accent) 30%, transparent)',
                  }}
                >
                  <Wand2 size={22} />
                </div>
                <h2
                  className="font-display font-bold"
                  style={{
                    fontSize: 'clamp(24px, 3.5vw, 36px)',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.1,
                  }}
                >
                  Creator Mode
                </h2>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}
                >
                  <Sparkles size={10} />
                  PRO TO SHARE
                </span>
              </div>

              <p
                style={{
                  fontSize: 'clamp(14px, 1.6vw, 16px)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  maxWidth: 560,
                  margin: 0,
                }}
              >
                Build your own Sudoku puzzles cell by cell. Anyone can create and validate —
                we check uniqueness, estimate difficulty from the techniques required, and
                show you whether the puzzle is solvable. Upgrade to Pro when you're ready
                to play your creation or share it with friends via a public link.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
                <FeaturePill icon={<Wand2 size={13} />} text="Free to create & validate" />
                <FeaturePill icon={<CheckCircle2 size={13} />} text="Auto difficulty rating" />
                <FeaturePill icon={<Share2 size={13} />} text="Pro to play & share" />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
                <Link
                  href="/construct"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--radius-btn)] font-semibold"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '15px',
                    minHeight: 48,
                    boxShadow: '0 4px 14px color-mix(in srgb, var(--accent) 28%, transparent)',
                  }}
                >
                  Open Creator Mode
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-[var(--radius-btn)]"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    background: 'var(--surface-elevated)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    minHeight: 48,
                  }}
                >
                  See Pro pricing
                </Link>
              </div>
            </div>

            {/* Illustration: mini blank board with a few digits typed in */}
            <div className="hidden lg:flex flex-col items-center gap-3">
              <div
                aria-hidden
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(9, 1fr)',
                  gridTemplateRows: 'repeat(9, 1fr)',
                  width: 220,
                  aspectRatio: '1',
                  background: 'var(--board-bg)',
                  borderRadius: 'var(--radius-board)',
                  border: '2px solid var(--grid-line-thick)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-board)',
                }}
              >
                {Array.from({ length: 81 }).map((_, i) => {
                  const row = Math.floor(i / 9), col = i % 9
                  // Sparse user-placed digits for illustration
                  const sample: Record<number, number> = { 1: 5, 4: 3, 9: 6, 17: 9, 22: 7, 30: 4, 40: 1, 50: 8, 60: 2, 70: 5, 76: 6 }
                  const v = sample[i]
                  return (
                    <div
                      key={i}
                      style={{
                        borderRight: col < 8 ? `${col === 2 || col === 5 ? 2 : 1}px solid ${col === 2 || col === 5 ? 'var(--grid-line-thick)' : 'var(--grid-line)'}` : undefined,
                        borderBottom: row < 8 ? `${row === 2 || row === 5 ? 2 : 1}px solid ${row === 2 || row === 5 ? 'var(--grid-line-thick)' : 'var(--grid-line)'}` : undefined,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {v && (
                        <span
                          className="font-numeral"
                          style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, lineHeight: 1 }}
                        >
                          {v}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              <span
                style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Your blank canvas
              </span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontWeight: 500,
      }}
    >
      <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>{icon}</span>
      {text}
    </span>
  )
}
