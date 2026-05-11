'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { useUser } from '@/lib/hooks/useUser'
import { solve, hasUniqueSolution } from '@/lib/sudoku/solver'
import { detectTechniques } from '@/lib/sudoku/techniqueDetector'
import type { Grid, Difficulty, SolvingTechnique } from '@/lib/sudoku/types'
import { Sparkles, CheckCircle2, XCircle, Share2, Trash2, Copy, Check, Loader2, Lock } from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────────────────────

function isThickRight(col: number) { return col === 2 || col === 5 }
function isThickBottom(row: number) { return row === 2 || row === 5 }

function rateFromTechniques(techniques: SolvingTechnique[]): Difficulty {
  if (techniques.some(t => ['swordfish', 'xy_wing'].includes(t))) return 'master'
  if (techniques.some(t => ['x_wing'].includes(t))) return 'expert'
  if (techniques.some(t => ['naked_pair', 'naked_triple', 'hidden_pair', 'box_line_reduction', 'pointing_pair'].includes(t))) return 'hard'
  if (techniques.includes('hidden_single')) return 'medium'
  if (techniques.includes('brute_force')) return 'expert'
  return 'easy'
}

function encodeGrid(cells: number[]): string {
  return cells.join('')
}

type ValidationState =
  | { status: 'idle' }
  | { status: 'validating' }
  | { status: 'valid'; difficulty: Difficulty }
  | { status: 'invalid'; reason: string }

// ── main page ─────────────────────────────────────────────────────────────────

export default function ConstructPage() {
  const { isPro, loading: authLoading } = useUser()

  const [cells, setCells] = useState<number[]>(Array(81).fill(0))
  const [selected, setSelected] = useState<number | null>(null)
  const [validation, setValidation] = useState<ValidationState>({ status: 'idle' })
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const givenCount = cells.filter(v => v !== 0).length

  // Keyboard handler
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (selected === null) return

    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault()
      const digit = parseInt(e.key)
      setCells(prev => { const n = [...prev]; n[selected] = digit; return n })
      setValidation({ status: 'idle' })
      setShareUrl(null)
      return
    }

    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      e.preventDefault()
      setCells(prev => { const n = [...prev]; n[selected] = 0; return n })
      setValidation({ status: 'idle' })
      setShareUrl(null)
      return
    }

    const row = Math.floor(selected / 9)
    const col = selected % 9
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(Math.max(0, (row - 1)) * 9 + col) }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(Math.min(8, (row + 1)) * 9 + col) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setSelected(row * 9 + Math.max(0, col - 1)) }
    if (e.key === 'ArrowRight') { e.preventDefault(); setSelected(row * 9 + Math.min(8, col + 1)) }
  }, [selected])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function handleCellClick(index: number) {
    setSelected(index)
  }

  function handleCellDigit(index: number, digit: number) {
    setSelected(index)
    setCells(prev => {
      const n = [...prev]
      n[index] = n[index] === digit ? 0 : digit
      return n
    })
    setValidation({ status: 'idle' })
    setShareUrl(null)
  }

  function clearAll() {
    setCells(Array(81).fill(0))
    setSelected(null)
    setValidation({ status: 'idle' })
    setShareUrl(null)
  }

  function validate() {
    if (givenCount < 17) {
      setValidation({ status: 'invalid', reason: `Need at least 17 given digits (you have ${givenCount}).` })
      return
    }

    setValidation({ status: 'validating' })

    // Run in a micro-task so the "validating" state renders
    setTimeout(() => {
      const givens = cells as Grid
      const isUnique = hasUniqueSolution(givens)
      if (!isUnique) {
        setValidation({ status: 'invalid', reason: 'This puzzle has no unique solution. Add or adjust digits.' })
        return
      }
      const techniques = detectTechniques(givens)
      const difficulty = rateFromTechniques(techniques)
      setValidation({ status: 'valid', difficulty })

      // Auto-generate share URL on valid
      const encoded = encodeGrid(cells)
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      setShareUrl(`${base}/play?puzzle=${encoded}`)
    }, 50)
  }

  async function copyLink() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />

      <main className="flex-1 flex flex-col items-center gap-5 sm:gap-6 px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <h1
                className="font-display font-bold"
                style={{ fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--text-primary)', letterSpacing: '-0.025em' }}
              >
                Constructor Mode
              </h1>
              {!isPro && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{
                    background: 'var(--accent-muted)',
                    color: 'var(--accent)',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  <Sparkles size={9} />
                  PRO TO SHARE
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Click a cell, then type 1–9 to place a digit. Backspace to erase.
            </p>
          </motion.div>

          {/* Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(9, 1fr)',
              gridTemplateRows: 'repeat(9, 1fr)',
              width: 'min(min(90vw, 90vh - 240px), 480px)',
              aspectRatio: '1',
              background: 'var(--board-bg)',
              borderRadius: 'var(--radius-board)',
              boxShadow: 'var(--shadow-board)',
              border: '2px solid var(--grid-line-thick)',
              overflow: 'hidden',
            }}
          >
            {cells.map((value, index) => {
              const row = Math.floor(index / 9)
              const col = index % 9
              const isSelected = selected === index
              const thickR = isThickRight(col)
              const thickB = isThickBottom(row)

              return (
                <div
                  key={index}
                  style={{
                    borderRight: col < 8
                      ? `${thickR ? 2 : 1}px solid ${thickR ? 'var(--grid-line-thick)' : 'var(--grid-line)'}`
                      : undefined,
                    borderBottom: row < 8
                      ? `${thickB ? 2 : 1}px solid ${thickB ? 'var(--grid-line-thick)' : 'var(--grid-line)'}`
                      : undefined,
                    background: isSelected ? 'var(--cell-selected)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'background 0.1s',
                  }}
                  onClick={() => handleCellClick(index)}
                >
                  {/* Number input popup when selected */}
                  {isSelected && (
                    <NumberPicker
                      current={value}
                      cellIndex={index}
                      onPick={(d) => handleCellDigit(index, d)}
                    />
                  )}
                  {value !== 0 && (
                    <span
                      className="font-numeral select-none"
                      style={{
                        fontSize: 'clamp(14px, 3.5vw, 22px)',
                        fontWeight: 700,
                        color: 'var(--accent)',
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </span>
                  )}
                </div>
              )
            })}
          </motion.div>

          {/* Counter */}
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {givenCount} given{givenCount !== 1 ? 's' : ''} placed
            {givenCount < 17 && givenCount > 0 && (
              <span style={{ color: 'var(--error)', marginLeft: 6 }}>
                (need at least 17)
              </span>
            )}
          </p>

          {/* Action bar */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-btn)] text-sm"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={14} />
              Clear all
            </button>

            <button
              onClick={validate}
              disabled={validation.status === 'validating' || givenCount < 17}
              className="flex items-center gap-1.5 px-5 py-2 rounded-[var(--radius-btn)] text-sm font-semibold"
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                cursor: givenCount < 17 || validation.status === 'validating' ? 'not-allowed' : 'pointer',
                opacity: givenCount < 17 ? 0.5 : 1,
              }}
            >
              {validation.status === 'validating'
                ? <><Loader2 size={14} className="animate-spin" /> Validating…</>
                : 'Validate Puzzle'
              }
            </button>
          </div>

          {/* Validation result */}
          <AnimatePresence mode="wait">
            {validation.status === 'valid' && (
              <motion.div
                key="valid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 w-full max-w-md"
              >
                <div
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-board)]"
                  style={{ background: 'var(--cell-correct-bg, #d1fae5)', border: '1px solid var(--success, #10b981)' }}
                >
                  <CheckCircle2 size={18} style={{ color: 'var(--success, #10b981)', flexShrink: 0 }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--success, #059669)' }}>
                      Valid puzzle — estimated <span style={{ textTransform: 'capitalize' }}>{validation.difficulty}</span> difficulty
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--success, #059669)', opacity: 0.8 }}>
                      Unique solution confirmed.
                    </p>
                  </div>
                </div>

                {shareUrl && (isPro ? (
                  // ─── Pro: full play + share UI ──────────────────────────
                  <div className="w-full flex flex-col gap-2">
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Share your puzzle
                    </p>
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-btn)]"
                      style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
                    >
                      <span
                        className="flex-1 text-xs truncate"
                        style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}
                      >
                        {shareUrl}
                      </span>
                      <button
                        onClick={copyLink}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-btn)]"
                        style={{
                          background: copied ? 'var(--accent)' : 'var(--surface)',
                          color: copied ? 'white' : 'var(--accent)',
                          border: '1px solid var(--accent)',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'background 0.2s, color 0.2s',
                        }}
                      >
                        {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={shareUrl}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-btn)] text-sm font-semibold"
                        style={{ background: 'var(--accent)', color: 'white', textDecoration: 'none' }}
                      >
                        <Share2 size={14} />
                        Play it yourself
                      </Link>
                    </div>
                  </div>
                ) : (
                  // ─── Free: Pro upsell for play + share ──────────────────
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full p-4 sm:p-5 rounded-[var(--radius-board)] flex flex-col items-center gap-3 text-center"
                    style={{
                      background: 'color-mix(in srgb, var(--accent) 8%, var(--surface))',
                      border: '1.5px solid color-mix(in srgb, var(--accent) 35%, transparent)',
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{ width: 40, height: 40, background: 'var(--accent)', color: 'white' }}
                    >
                      <Lock size={18} />
                    </div>
                    <div>
                      <p
                        className="font-display font-semibold mb-1"
                        style={{ fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                      >
                        Nice puzzle. Pro to play or share.
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 360 }}>
                        Your puzzle is valid and saved in this session. Upgrade to play
                        it yourself or share it with friends via a public link.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Link
                        href="/pricing"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-btn)] text-sm font-semibold"
                        style={{ background: 'var(--accent)', color: 'white', textDecoration: 'none' }}
                      >
                        <Sparkles size={14} />
                        Upgrade to Pro
                      </Link>
                      <Link
                        href="/play"
                        className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-[var(--radius-btn)] text-sm"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none' }}
                      >
                        Back to Play
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {validation.status === 'invalid' && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-md flex items-center gap-3 px-4 py-3 rounded-[var(--radius-board)]"
                style={{ background: 'var(--cell-error-bg)', border: '1px solid var(--error)' }}
              >
                <XCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />
                <p className="text-sm" style={{ color: 'var(--error)' }}>
                  {validation.reason}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md p-4 rounded-[var(--radius-board)]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p
              className="font-display font-semibold mb-2"
              style={{ fontSize: '13px', color: 'var(--text-primary)' }}
            >
              Tips for good puzzles
            </p>
            <ul style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: 16 }}>
              <li>Aim for 25–35 given digits for medium difficulty.</li>
              <li>Spread givens across all 9 rows, columns, and boxes.</li>
              <li>Use 180° rotational symmetry for an elegant layout.</li>
              <li>Click Validate — it checks for a unique solution automatically.</li>
            </ul>
          </motion.div>
      </main>
    </div>
  )
}

// ── NumberPicker ─────────────────────────────────────────────────────────────

function NumberPicker({
  current,
  cellIndex,
  onPick,
}: {
  current: number
  cellIndex: number
  onPick: (d: number) => void
}) {
  // Smart placement: pop UP if cell is in lower half of the board, DOWN otherwise.
  // Pop LEFT if cell is in right half, RIGHT otherwise. Keeps it on-screen.
  const row = Math.floor(cellIndex / 9)
  const col = cellIndex % 9
  const popUp   = row >= 4
  const popLeft = col >= 5

  const vertical = popUp
    ? { bottom: '100%', marginBottom: 4 }
    : { top:    '100%', marginTop:    4 }
  const horizontal = popLeft
    ? { right: 0 }
    : { left:  0 }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="absolute z-30"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        boxShadow: '0 6px 28px rgba(0,0,0,0.22)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 4,
        padding: 6,
        width: 132,
        ...vertical,
        ...horizontal,
      }}
      onClick={e => e.stopPropagation()}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
        <button
          key={d}
          onMouseDown={e => { e.preventDefault(); onPick(d) }}
          onTouchStart={e => { e.preventDefault(); onPick(d) }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            border: 'none',
            background: current === d ? 'var(--accent)' : 'var(--surface-elevated)',
            color: current === d ? 'white' : 'var(--text-primary)',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-numeral, inherit)',
          }}
        >
          {d}
        </button>
      ))}
    </motion.div>
  )
}
