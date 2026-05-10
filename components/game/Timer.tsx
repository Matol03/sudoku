'use client'

import { useGameStore } from '@/stores/gameStore'
import { motion } from 'framer-motion'

function pad(n: number) { return n.toString().padStart(2, '0') }

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

export function Timer() {
  const { timeElapsed, isRunning, pauseTimer, resumeTimer } = useGameStore()

  return (
    <button
      onClick={() => isRunning ? pauseTimer() : resumeTimer()}
      aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
    >
      <motion.span
        key={Math.floor(timeElapsed / 60)}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-numeral"
        style={{
          fontSize: '22px',
          fontVariantNumeric: 'tabular-nums',
          color: isRunning ? 'var(--text-primary)' : 'var(--text-muted)',
          letterSpacing: '-0.02em',
        }}
      >
        {isRunning ? formatTime(timeElapsed) : '—:——'}
      </motion.span>
    </button>
  )
}
