'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, RotateCcw } from 'lucide-react'
import { Board } from '@/components/game/Board'
import { NumberPad } from '@/components/game/NumberPad'
import { HUD } from '@/components/game/HUD'
import { DifficultySelector } from '@/components/game/DifficultySelector'
import { SkinSwitcher } from '@/components/game/SkinSwitcher'
import { Nav } from '@/components/Nav'
import { hasTourBeenSeen } from '@/components/OnboardingTour'
import { useGameStore } from '@/stores/gameStore'
import { generatePuzzleAsync } from '@/lib/sudoku/workerClient'
import type { Difficulty, Grid } from '@/lib/sudoku/types'

// Lazy-load heavy components — they only mount when actually needed
const AITrainer = dynamic(
  () => import('@/components/game/AITrainer').then(m => ({ default: m.AITrainer })),
  { ssr: false }
)
const OnboardingTour = dynamic(
  () => import('@/components/OnboardingTour').then(m => ({ default: m.OnboardingTour })),
  { ssr: false }
)

const VALID_DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master']

// ── Side-column action button ──────────────────────────────────────────────
function SideAction({
  icon, label, onClick, primary = false, ...rest
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  primary?: boolean
} & Record<string, unknown>) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex items-center justify-center rounded-[var(--radius-btn)]"
      style={{
        width: 36,
        height: 36,
        background: primary ? 'var(--accent-muted)' : 'var(--surface)',
        border: `1px solid ${primary ? 'var(--accent)' : 'var(--border)'}`,
        color: primary ? 'var(--accent)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
      }}
      {...rest}
    >
      {icon}
    </button>
  )
}

function SharedPuzzleLoader({
  onLoadPuzzle,
  onStartDifficulty,
}: {
  onLoadPuzzle: (givens: Grid) => void
  onStartDifficulty: (d: Difficulty) => void
}) {
  const searchParams = useSearchParams()
  const puzzleParam = searchParams.get('puzzle')
  const diffParam = searchParams.get('d')

  useEffect(() => {
    if (puzzleParam && /^\d{81}$/.test(puzzleParam)) {
      onLoadPuzzle(puzzleParam.split('').map(Number) as Grid)
      return
    }
    if (diffParam && (VALID_DIFFICULTIES as string[]).includes(diffParam)) {
      onStartDifficulty(diffParam as Difficulty)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleParam, diffParam])

  return null
}

export default function PlayPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium')
  const [isGenerating, setIsGenerating] = useState(false)
  const [trainerOpen, setTrainerOpen] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const { setPuzzle, puzzle, requestHint, showHintUpsell, dismissHintUpsell, loadCustomPuzzle } = useGameStore()

  // Trigger tour once, the first time a puzzle becomes active
  useEffect(() => {
    if (puzzle && !hasTourBeenSeen()) {
      setShowTour(true)
    }
  }, [puzzle])

  const startNewGame = useCallback(async (difficulty: Difficulty) => {
    setIsGenerating(true)
    try {
      const newPuzzle = await generatePuzzleAsync(difficulty)
      setPuzzle(newPuzzle)
    } catch (err) {
      console.error('Puzzle generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [setPuzzle])

  const handleHint = useCallback(() => {
    requestHint()
  }, [requestHint])

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />

      {/* Load puzzle from ?puzzle= or ?d= URL params */}
      <Suspense>
        <SharedPuzzleLoader
          onLoadPuzzle={loadCustomPuzzle}
          onStartDifficulty={(d) => { setSelectedDifficulty(d); startNewGame(d) }}
        />
      </Suspense>

      <main className="flex-1 flex flex-col items-center justify-start md:justify-center gap-5 px-2 sm:px-4 py-3 sm:py-5">
        <AnimatePresence mode="wait">
          {!puzzle ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="flex flex-col items-center gap-7 w-full max-w-md pt-6"
            >
              <div className="text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="font-display mb-2"
                  style={{ fontSize: 'clamp(34px, 5vw, 52px)', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.028em', lineHeight: 1.05 }}
                >
                  New Game
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{ color: 'var(--text-muted)', fontSize: '15px' }}
                >
                  Choose a difficulty to begin.
                </motion.p>
              </div>

              <DifficultySelector
                selected={selectedDifficulty}
                onChange={setSelectedDifficulty}
                loading={isGenerating}
              />

              <motion.button
                onClick={() => startNewGame(selectedDifficulty)}
                disabled={isGenerating}
                whileTap={{ scale: 0.98 }}
                whileHover={isGenerating ? {} : { y: -1, boxShadow: '0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                className="w-full py-4 rounded-[var(--radius-btn)] font-display font-semibold text-lg relative overflow-hidden"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  cursor: isGenerating ? 'wait' : 'pointer',
                  opacity: isGenerating ? 0.75 : 1,
                  boxShadow: '0 2px 10px color-mix(in srgb, var(--accent) 25%, transparent)',
                }}
              >
                {isGenerating ? (
                  <span className="inline-flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="inline-block"
                      style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }}
                    />
                    Generating…
                  </span>
                ) : (
                  'Start Puzzle'
                )}
              </motion.button>

              <div className="flex items-center gap-4">
                <SkinSwitcher />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Play as guest · No account needed
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full"
              // Reserve space on the right for the side-action column. CSS
              // var is consumed by Board, HUD and NumberPad widths.
              style={{ ['--board-max-w' as string]: 'calc(100vw - 76px)' }}
            >
              <div className="flex items-start gap-2 sm:gap-3 w-full justify-center">
                {/* Game column */}
                <div className="flex flex-col items-center gap-3 min-w-0">
                  <HUD />
                  <Board />
                  <NumberPad onHint={handleHint} />
                </div>

                {/* Side action column — aligns vertically with the top of the Board.
                    HUD height is ~38px (mobile) / ~42px (desktop), plus 12px gap. */}
                <div className="flex flex-col gap-2 pt-[50px] sm:pt-[56px] flex-shrink-0">
                  <SideAction
                    data-tour="ai-trainer-btn"
                    icon={<Bot size={16} />}
                    label="AI Trainer"
                    primary
                    onClick={() => setTrainerOpen(true)}
                  />
                  <SideAction
                    icon={<RotateCcw size={16} />}
                    label="New game"
                    onClick={() => startNewGame(selectedDifficulty)}
                  />
                  {/* Skin chooser — icon-only square button matching the column.
                      placement="top-right" so the dropdown opens upward and is
                      right-aligned, keeping it on-screen near the viewport edge. */}
                  <span data-tour="skin-switcher" className="inline-block">
                    <SkinSwitcher iconOnly placement="bottom-left" />
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Hint upsell modal */}
      <AnimatePresence>
        {showHintUpsell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={dismissHintUpsell}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm p-6 rounded-[var(--radius-board)]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2 className="font-display font-bold mb-2" style={{ fontSize: '22px', color: 'var(--text-primary)' }}>
                Daily hints used up
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                You've used all 5 free hints for today. Upgrade to Pro for unlimited hints, an AI trainer that teaches technique, and all current and future skins.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="/pricing"
                  className="flex items-center justify-center py-2.5 rounded-[var(--radius-btn)] font-semibold text-sm"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  Unlock Pro — $4.99/month
                </a>
                <button
                  onClick={dismissHintUpsell}
                  className="py-2.5 rounded-[var(--radius-btn)] text-sm"
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Continue without hints
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AITrainer isOpen={trainerOpen} onClose={() => setTrainerOpen(false)} />

      {showTour && <OnboardingTour onDone={() => setShowTour(false)} />}
    </div>
  )
}
