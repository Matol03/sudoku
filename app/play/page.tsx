'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot } from 'lucide-react'
import { Board } from '@/components/game/Board'
import { NumberPad } from '@/components/game/NumberPad'
import { HUD } from '@/components/game/HUD'
import { DifficultySelector } from '@/components/game/DifficultySelector'
import { AITrainer } from '@/components/game/AITrainer'
import { SkinSwitcher } from '@/components/game/SkinSwitcher'
import { Nav } from '@/components/Nav'
import { useGameStore } from '@/stores/gameStore'
import { generatePuzzle } from '@/lib/sudoku/generator'
import type { Difficulty } from '@/lib/sudoku/types'

export default function PlayPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium')
  const [isGenerating, setIsGenerating] = useState(false)
  const [trainerOpen, setTrainerOpen] = useState(false)
  const { setPuzzle, puzzle, requestHint, showHintUpsell, dismissHintUpsell } = useGameStore()

  const startNewGame = useCallback(async (difficulty: Difficulty) => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 0))
      const newPuzzle = generatePuzzle(difficulty)
      setPuzzle(newPuzzle)
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

      <main className="flex-1 flex flex-col items-center justify-start md:justify-center gap-5 px-4 py-5">
        <AnimatePresence mode="wait">
          {!puzzle ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8 w-full max-w-md pt-8"
            >
              <div className="text-center">
                <h1
                  className="font-display mb-2"
                  style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.025em' }}
                >
                  New Game
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                  Choose a difficulty to begin.
                </p>
              </div>

              <DifficultySelector
                selected={selectedDifficulty}
                onChange={setSelectedDifficulty}
                loading={isGenerating}
              />

              <motion.button
                onClick={() => startNewGame(selectedDifficulty)}
                disabled={isGenerating}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-[var(--radius-btn)] font-display font-semibold text-lg"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  cursor: isGenerating ? 'wait' : 'pointer',
                  opacity: isGenerating ? 0.7 : 1,
                }}
              >
                {isGenerating ? 'Generating…' : 'Start Puzzle'}
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
              className="flex flex-col items-center gap-4 w-full"
            >
              <div className="flex items-center justify-between w-full max-w-[min(min(90vw,90vh-200px),480px)]">
                <HUD />
              </div>

              <Board />
              <NumberPad onHint={handleHint} />

              <div className="flex items-center justify-between w-full max-w-[min(min(90vw,90vh-200px),480px)] mt-1">
                <div className="flex items-center gap-2">
                  <SkinSwitcher />
                  <button
                    onClick={() => startNewGame(selectedDifficulty)}
                    className="text-xs px-3 py-1.5 rounded-[var(--radius-btn)]"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'none', cursor: 'pointer' }}
                  >
                    New
                  </button>
                </div>

                <button
                  onClick={() => setTrainerOpen(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[var(--radius-btn)]"
                  style={{
                    background: 'var(--accent-muted)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                  }}
                >
                  <Bot size={12} />
                  AI Trainer
                </button>
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
    </div>
  )
}
