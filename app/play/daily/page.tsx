'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Board } from '@/components/game/Board'
import { NumberPad } from '@/components/game/NumberPad'
import { HUD } from '@/components/game/HUD'
import { Nav } from '@/components/Nav'
import { useGameStore } from '@/stores/gameStore'
import { generateDailyPuzzle } from '@/lib/sudoku/generator'
import { Calendar, Trophy } from 'lucide-react'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export default function DailyPuzzlePage() {
  const { setPuzzle, puzzle, isComplete, timeElapsed, mistakeCount } = useGameStore()
  const [loading, setLoading] = useState(true)
  const today = todayStr()

  useEffect(() => {
    const p = generateDailyPuzzle(today, 'medium')
    setPuzzle(p)
    setLoading(false)
  }, [today, setPuzzle])

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="flex-1 flex flex-col items-center justify-start md:justify-center gap-6 px-4 py-6">
        <div className="flex items-center gap-3">
          <Calendar size={18} style={{ color: 'var(--accent)' }} />
          <h1 className="font-display font-semibold" style={{ fontSize: '20px', color: 'var(--text-primary)' }}>
            Daily Puzzle — {new Date(today).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h1>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Generating today's puzzle…</div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <HUD />
            <Board />
            <NumberPad />

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-6 py-4 rounded-[var(--radius-board)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <Trophy size={20} style={{ color: 'var(--accent)' }} />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    Solved in {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')} with {mistakeCount} mistake{mistakeCount !== 1 ? 's' : ''}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Sign in to see the global leaderboard
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}
