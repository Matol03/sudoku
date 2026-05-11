'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { Timer } from './Timer'
import type { Difficulty } from '@/lib/sudoku/types'

function formatDifficulty(d: Difficulty): string {
  return d.charAt(0).toUpperCase() + d.slice(1)
}

export function HUD() {
  const { puzzle, mistakeCount, hintsUsed, tick, isRunning } = useGameStore()

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [isRunning, tick])

  if (!puzzle) return null

  return (
    <div
      className="flex items-center justify-between w-full max-w-[min(min(var(--board-max-w,90vw),90vh-200px),480px)] px-1 gap-2"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col min-w-0 items-start">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Difficulty
        </span>
        <span className="font-display truncate text-[13px] sm:text-[14px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {formatDifficulty(puzzle.difficulty)}
        </span>
      </div>

      <Timer />

      <div className="flex gap-2.5 sm:gap-4 flex-shrink-0">
        <Stat label="Mistakes" value={mistakeCount} />
        <Stat label="Hints" value={hintsUsed} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span
        className="text-[13px] sm:text-[14px] font-semibold leading-tight"
        style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>
    </div>
  )
}
