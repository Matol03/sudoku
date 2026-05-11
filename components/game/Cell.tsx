'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import type { GameCell } from '@/lib/sudoku/types'
import type { Digit } from '@/lib/sudoku/types'
import { cn } from '@/lib/utils'

interface CellProps {
  cell: GameCell
  index: number
  isSelected: boolean
  isPeer: boolean
  isSameNumber: boolean
  onClick: () => void
}

const NOTES_POSITIONS: Record<number, string> = {
  1: 'col-start-1 row-start-1',
  2: 'col-start-2 row-start-1',
  3: 'col-start-3 row-start-1',
  4: 'col-start-1 row-start-2',
  5: 'col-start-2 row-start-2',
  6: 'col-start-3 row-start-2',
  7: 'col-start-1 row-start-3',
  8: 'col-start-2 row-start-3',
  9: 'col-start-3 row-start-3',
}

function NotesGrid({ notes }: { notes: Set<Digit> }) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-[1px]">
      {[1,2,3,4,5,6,7,8,9].map(d => (
        <div key={d} className={cn('flex items-center justify-center', NOTES_POSITIONS[d])}>
          {notes.has(d as Digit) && (
            <span
              className="font-numeral leading-none select-none"
              style={{ fontSize: 'clamp(7px, 1.1vw, 10px)', color: 'var(--text-muted)', opacity: 0.9 }}
            >
              {d}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function getCellBackground(
  cell: GameCell,
  isSelected: boolean,
  isPeer: boolean,
  isSameNumber: boolean,
): string {
  if (isSelected) return 'var(--cell-selected-bg)'
  if (cell.isHint) return 'var(--cell-hint-bg)'
  if (cell.isError) return 'var(--cell-error-bg)'
  if (isSameNumber) return 'var(--cell-same-bg)'
  if (cell.isGiven) return 'var(--cell-given-bg)'
  if (isPeer) return 'var(--cell-peer-bg)'
  return 'transparent'
}

function getCellColor(cell: GameCell, isSelected: boolean): string {
  if (cell.isError) return 'var(--error)'
  if (cell.isHint) return 'var(--accent)'
  if (isSelected && !cell.isGiven) return 'var(--cell-selected)'
  if (cell.isGiven) return 'var(--cell-given)'
  return 'var(--accent)'
}

export const Cell = memo(function Cell({
  cell,
  index,
  isSelected,
  isPeer,
  isSameNumber,
  onClick,
}: CellProps) {
  const hasNotes = cell.notes.size > 0 && cell.value === 0

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center w-full h-full',
        'cursor-pointer select-none outline-none focus-visible:z-10',
        'transition-colors duration-150',
        cell.isGiven && 'cursor-default',
      )}
      style={{
        background: getCellBackground(cell, isSelected, isPeer, isSameNumber),
        borderRadius: 'var(--radius-cell, 0)',
        boxShadow: isSelected
          ? 'inset 0 0 0 2px var(--accent)'
          : cell.isHint
          ? 'inset 0 0 0 1.5px var(--accent)'
          : undefined,
      }}
      whileTap={{ scale: 0.94 }}
      aria-label={
        cell.isGiven
          ? `Given: ${cell.value}, row ${Math.floor(index / 9) + 1}, column ${(index % 9) + 1}`
          : cell.value
          ? `${cell.value}, row ${Math.floor(index / 9) + 1}, column ${(index % 9) + 1}`
          : `Empty, row ${Math.floor(index / 9) + 1}, column ${(index % 9) + 1}`
      }
      role="gridcell"
      aria-selected={isSelected}
    >
      {cell.value !== 0 && (
        <motion.span
          key={`${index}-${cell.value}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 22 }}
          className={cn(
            'font-numeral select-none leading-none',
            cell.isGiven ? 'font-semibold' : 'font-normal',
          )}
          style={{
            fontSize: 'clamp(14px, 2.8vw, 26px)',
            color: getCellColor(cell, isSelected),
            fontWeight: cell.isGiven ? 600 : 400,
          }}
        >
          {cell.value}
        </motion.span>
      )}

      {hasNotes && <NotesGrid notes={cell.notes as Set<Digit>} />}

      {cell.isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ background: 'var(--error)', opacity: 0.08 }}
        />
      )}

      {cell.isHint && (
        <motion.div
          initial={{ opacity: 0.6, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 1.2, repeat: 1 }}
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ background: 'var(--accent)', opacity: 0.15 }}
        />
      )}
    </motion.button>
  )
})
