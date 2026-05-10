'use client'

import { motion } from 'framer-motion'
import { Pencil, RotateCcw, Undo2, Redo2, Lightbulb } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import type { Digit } from '@/lib/sudoku/types'
import { cn } from '@/lib/utils'

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

interface NumberPadProps {
  onHint?: () => void
}

export function NumberPad({ onHint }: NumberPadProps) {
  const {
    enterDigit,
    clearCell,
    toggleNotesMode,
    isNotesMode,
    undo,
    redo,
    historyIndex,
    history,
    puzzle,
    hintsUsed,
  } = useGameStore()

  if (!puzzle) return null

  const canUndo = historyIndex >= 0
  const canRedo = historyIndex < history.length - 1
  const FREE_HINTS = 5

  return (
    <div className="flex flex-col gap-3 w-full max-w-[min(min(90vw,90vh-200px),480px)]">
      {/* Control row */}
      <div className="flex items-center justify-between gap-2">
        <ActionBtn
          onClick={undo}
          disabled={!canUndo}
          label="Undo"
          icon={<Undo2 size={16} />}
        />
        <ActionBtn
          onClick={redo}
          disabled={!canRedo}
          label="Redo"
          icon={<Redo2 size={16} />}
        />
        <ActionBtn
          onClick={toggleNotesMode}
          label={isNotesMode ? 'Notes On' : 'Notes'}
          icon={<Pencil size={16} />}
          active={isNotesMode}
        />
        <ActionBtn
          onClick={clearCell}
          label="Erase"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
              <path d="M22 21H7" />
              <path d="m5 11 9 9" />
            </svg>
          }
        />
        <ActionBtn
          onClick={onHint}
          label={`Hint ${hintsUsed}/${FREE_HINTS}`}
          icon={<Lightbulb size={16} />}
        />
      </div>

      {/* Digit grid */}
      <div className="grid grid-cols-9 gap-1">
        {DIGITS.map(digit => (
          <DigitButton
            key={digit}
            digit={digit}
            onClick={() => enterDigit(digit)}
            isNotesMode={isNotesMode}
          />
        ))}
      </div>
    </div>
  )
}

function DigitButton({
  digit,
  onClick,
  isNotesMode,
}: {
  digit: Digit
  onClick: () => void
  isNotesMode: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className="relative flex items-center justify-center aspect-square w-full rounded-[var(--radius-btn)]"
      style={{
        background: isNotesMode ? 'var(--accent-muted)' : 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        color: isNotesMode ? 'var(--accent)' : 'var(--text-primary)',
        minHeight: 44,
      }}
      aria-label={`Enter ${digit}`}
    >
      <span className="font-numeral text-xl leading-none select-none">
        {digit}
      </span>
    </motion.button>
  )
}

function ActionBtn({
  onClick,
  label,
  icon,
  disabled = false,
  active = false,
}: {
  onClick?: () => void
  label: string
  icon: React.ReactNode
  disabled?: boolean
  active?: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.93 }}
      className="flex flex-col items-center gap-1 flex-1 py-2 rounded-[var(--radius-btn)]"
      style={{
        background: active ? 'var(--accent-muted)' : 'var(--surface)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        color: disabled ? 'var(--text-muted)' : active ? 'var(--accent)' : 'var(--text-primary)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minHeight: 44,
      }}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
      <span style={{ fontSize: '10px', color: 'inherit', lineHeight: 1 }}>{label}</span>
    </motion.button>
  )
}
