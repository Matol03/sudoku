'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export const TOUR_KEY = 'sudoku-atelier-tour-done'

export function hasTourBeenSeen(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(TOUR_KEY) === '1'
}

interface TourStep {
  target: string | null
  position: 'center' | 'right' | 'top' | 'bottom' | 'left'
  title: string
  body: string
}

const STEPS: TourStep[] = [
  {
    target: null,
    position: 'center',
    title: 'Welcome to Sudoku Atelier',
    body: "A precision-crafted Sudoku experience. Let's walk through the controls — takes about 30 seconds.",
  },
  {
    target: '[data-tour="board"]',
    position: 'right',
    title: 'The Puzzle Grid',
    body: 'Your 9×9 board. Click any white cell to select it, then type a digit. Arrow keys move between cells.',
  },
  {
    target: '[data-tour="numberpad"]',
    position: 'top',
    title: 'Enter Digits',
    body: 'Tap a number here or press 1–9 on your keyboard. A correct digit locks in; a wrong one is flagged.',
  },
  {
    target: '[data-tour="notes-btn"]',
    position: 'top',
    title: 'Notes Mode',
    body: 'Pencil in candidate digits without committing. Toggle with this button or press N on your keyboard.',
  },
  {
    target: '[data-tour="hint-btn"]',
    position: 'top',
    title: 'Hints',
    body: 'A hint walks you through the next logical step. Free users get 5 per day; Pro users get unlimited.',
  },
  {
    target: '[data-tour="ai-trainer-btn"]',
    position: 'top',
    title: 'AI Trainer',
    body: 'Open the AI coach to ask about techniques, get a board analysis, or learn new solving patterns.',
  },
  {
    target: '[data-tour="skin-switcher"]',
    position: 'top',
    title: 'Themes',
    body: "Change your board's look anytime. Pro unlocks premium skins — including the exclusive Aurora theme.",
  },
  {
    target: null,
    position: 'center',
    title: 'You\'re all set',
    body: 'Every puzzle has exactly one logical solution — no guessing ever required. Good luck.',
  },
]

interface Rect { top: number; left: number; width: number; height: number }

function queryRect(selector: string): Rect | null {
  if (typeof window === 'undefined') return null
  const el = document.querySelector(selector)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

const TOOLTIP_W = 288
const GAP = 14
const EDGE = 10

function tooltipStyle(rect: Rect | null, position: TourStep['position']): React.CSSProperties {
  if (!rect || position === 'center') {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: TOOLTIP_W,
    }
  }

  const ww = window.innerWidth
  const wh = window.innerHeight

  const right = rect.left + rect.width
  const bottom = rect.top + rect.height

  if (position === 'right') {
    const top = Math.max(EDGE, Math.min(rect.top + rect.height / 2 - 90, wh - 220))
    const left = right + GAP
    if (left + TOOLTIP_W > ww - EDGE) {
      return { position: 'fixed', top, left: Math.max(EDGE, rect.left - TOOLTIP_W - GAP), width: TOOLTIP_W }
    }
    return { position: 'fixed', top, left, width: TOOLTIP_W }
  }

  if (position === 'top') {
    const top = Math.max(EDGE, rect.top - 190 - GAP)
    const left = Math.max(EDGE, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, ww - TOOLTIP_W - EDGE))
    return { position: 'fixed', top, left, width: TOOLTIP_W }
  }

  if (position === 'bottom') {
    const top = Math.min(bottom + GAP, wh - 220)
    const left = Math.max(EDGE, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, ww - TOOLTIP_W - EDGE))
    return { position: 'fixed', top, left, width: TOOLTIP_W }
  }

  // left
  const top = Math.max(EDGE, Math.min(rect.top + rect.height / 2 - 90, wh - 220))
  const left = Math.max(EDGE, rect.left - TOOLTIP_W - GAP)
  return { position: 'fixed', top, left, width: TOOLTIP_W }
}

export function OnboardingTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isCenter = !current.target

  const refresh = useCallback(() => {
    setRect(current.target ? queryRect(current.target) : null)
  }, [current.target])

  useEffect(() => {
    refresh()
    window.addEventListener('resize', refresh)
    return () => window.removeEventListener('resize', refresh)
  }, [refresh])

  function next() {
    if (isLast) { finish(); return }
    setStep(s => s + 1)
  }

  function finish() {
    localStorage.setItem(TOUR_KEY, '1')
    onDone()
  }

  const style = tooltipStyle(rect, current.position)

  return (
    <>
      {/* Backdrop for center steps */}
      {isCenter && (
        <div
          className="fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 9000 }}
        />
      )}

      {/* Spotlight cutout for targeted steps */}
      {rect && !isCenter && (
        <div
          style={{
            position: 'fixed',
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderRadius: 10,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            border: '2px solid var(--accent)',
            pointerEvents: 'none',
            zIndex: 9000,
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{
            ...style,
            zIndex: 9001,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-board)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
            padding: '20px',
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className="font-display font-semibold"
              style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.3 }}
            >
              {current.title}
            </h3>
            <button
              onClick={finish}
              aria-label="Skip tour"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>
            {current.body}
          </p>

          <div className="flex items-center justify-between">
            {/* Step indicator dots */}
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 6,
                    width: i === step ? 18 : 6,
                    borderRadius: 3,
                    background: i === step ? 'var(--accent)' : 'var(--border)',
                    transition: 'width 0.25s, background 0.25s',
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                padding: '7px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isLast ? "Let’s go" : 'Next →'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
