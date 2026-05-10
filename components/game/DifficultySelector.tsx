'use client'

import { motion } from 'framer-motion'
import type { Difficulty } from '@/lib/sudoku/types'
import { cn } from '@/lib/utils'

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'expert', label: 'Expert' },
  { id: 'master', label: 'Master' },
]

interface DifficultySelectorProps {
  selected: Difficulty
  onChange: (d: Difficulty) => void
  loading?: boolean
}

export function DifficultySelector({ selected, onChange, loading }: DifficultySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {DIFFICULTIES.map(({ id, label }) => (
        <motion.button
          key={id}
          onClick={() => !loading && onChange(id)}
          whileTap={{ scale: 0.94 }}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-[var(--radius-btn)] transition-colors"
          style={{
            background: selected === id ? 'var(--accent)' : 'var(--surface)',
            color: selected === id ? 'white' : 'var(--text-muted)',
            border: `1px solid ${selected === id ? 'var(--accent)' : 'var(--border)'}`,
            fontWeight: selected === id ? 600 : 400,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          aria-pressed={selected === id}
        >
          {label}
        </motion.button>
      ))}
    </div>
  )
}
