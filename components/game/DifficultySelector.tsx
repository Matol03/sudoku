'use client'

import { motion } from 'framer-motion'
import type { Difficulty } from '@/lib/sudoku/types'

const DIFFICULTIES: { id: Difficulty; label: string; dots: number }[] = [
  { id: 'beginner', label: 'Beginner', dots: 1 },
  { id: 'easy',     label: 'Easy',     dots: 2 },
  { id: 'medium',   label: 'Medium',   dots: 3 },
  { id: 'hard',     label: 'Hard',     dots: 4 },
  { id: 'expert',   label: 'Expert',   dots: 5 },
  { id: 'master',   label: 'Master',   dots: 6 },
]

interface Props {
  selected: Difficulty
  onChange: (d: Difficulty) => void
  loading?: boolean
}

export function DifficultySelector({ selected, onChange, loading }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {DIFFICULTIES.map(({ id, label, dots }) => {
        const isActive = selected === id
        return (
          <motion.button
            key={id}
            onClick={() => !loading && onChange(id)}
            disabled={loading}
            whileTap={loading ? {} : { scale: 0.96 }}
            whileHover={loading ? {} : { y: -1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="relative flex flex-col items-center gap-1.5 py-3 px-3 rounded-[var(--radius-btn)] overflow-hidden"
            style={{
              background: isActive ? 'var(--accent)' : 'var(--surface)',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.55 : 1,
              transition: 'background 0.2s, border-color 0.2s',
            }}
            aria-pressed={isActive}
          >
            {/* Difficulty dots */}
            <div className="flex gap-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: i < dots
                      ? (isActive ? 'rgba(255,255,255,0.95)' : 'var(--accent)')
                      : (isActive ? 'rgba(255,255,255,0.25)' : 'var(--border)'),
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
            <span
              className="font-display"
              style={{
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'white' : 'var(--text-primary)',
                lineHeight: 1,
                letterSpacing: '-0.005em',
              }}
            >
              {label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
