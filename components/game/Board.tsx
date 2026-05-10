'use client'

import { useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { Cell } from './Cell'
import type { Digit } from '@/lib/sudoku/types'
import { cn } from '@/lib/utils'

function getBorderClasses(index: number): string {
  const row = Math.floor(index / 9)
  const col = index % 9
  const classes: string[] = []

  // Right border
  if (col < 8) classes.push('border-r')
  // Bottom border
  if (row < 8) classes.push('border-b')

  return classes.join(' ')
}

function isThickRight(col: number) { return col === 2 || col === 5 }
function isThickBottom(row: number) { return row === 2 || row === 5 }

export function Board() {
  const {
    puzzle,
    cells,
    selectedCell,
    selectCell,
    enterDigit,
    clearCell,
    toggleNotesMode,
    undo,
    redo,
    isComplete,
  } = useGameStore()

  const boardRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!puzzle) return

    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault()
      enterDigit(parseInt(e.key) as Digit)
      return
    }

    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      e.preventDefault()
      clearCell()
      return
    }

    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault()
      toggleNotesMode()
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault()
      redo()
      return
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
      const current = selectedCell ?? 0
      const row = Math.floor(current / 9)
      const col = current % 9
      let next = current
      if (e.key === 'ArrowUp') next = Math.max(0, (row - 1)) * 9 + col
      if (e.key === 'ArrowDown') next = Math.min(8, (row + 1)) * 9 + col
      if (e.key === 'ArrowLeft') next = row * 9 + Math.max(0, col - 1)
      if (e.key === 'ArrowRight') next = row * 9 + Math.min(8, col + 1)
      selectCell(next)
    }
  }, [puzzle, selectedCell, enterDigit, clearCell, toggleNotesMode, undo, redo, selectCell])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const selectedValue = selectedCell !== null ? cells[selectedCell]?.value : null
  const isPeer = useCallback((index: number) => {
    if (selectedCell === null) return false
    const sRow = Math.floor(selectedCell / 9)
    const sCol = selectedCell % 9
    const sBox = Math.floor(sRow / 3) * 3 + Math.floor(sCol / 3)
    const row = Math.floor(index / 9)
    const col = index % 9
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3)
    return row === sRow || col === sCol || box === sBox
  }, [selectedCell])

  const isSameNumber = useCallback((index: number) => {
    if (!selectedValue) return false
    return cells[index]?.value === selectedValue
  }, [selectedValue, cells])

  if (!puzzle) return null

  return (
    <div className="relative flex flex-col items-center gap-4">
      <motion.div
        ref={boardRef}
        role="grid"
        aria-label="Sudoku board"
        data-tour="board"
        className="relative"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gridTemplateRows: 'repeat(9, 1fr)',
          width: 'min(min(90vw, 90vh - 200px), 480px)',
          aspectRatio: '1',
          background: 'var(--board-bg)',
          borderRadius: 'var(--radius-board)',
          boxShadow: 'var(--shadow-board)',
          border: '2px solid var(--grid-line-thick)',
          overflow: 'hidden',
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        {cells.map((cell, index) => {
          const row = Math.floor(index / 9)
          const col = index % 9
          const thickR = isThickRight(col)
          const thickB = isThickBottom(row)

          return (
            <div
              key={index}
              className="relative"
              style={{
                borderRight: col < 8
                  ? `${thickR ? 2 : 1}px solid ${thickR ? 'var(--grid-line-thick)' : 'var(--grid-line)'}`
                  : undefined,
                borderBottom: row < 8
                  ? `${thickB ? 2 : 1}px solid ${thickB ? 'var(--grid-line-thick)' : 'var(--grid-line)'}`
                  : undefined,
              }}
            >
              <Cell
                cell={cell}
                index={index}
                isSelected={selectedCell === index}
                isPeer={isPeer(index) && selectedCell !== index}
                isSameNumber={isSameNumber(index) && selectedCell !== index}
                onClick={() => selectCell(index)}
              />
            </div>
          )
        })}
      </motion.div>

      <AnimatePresence>
        {isComplete && (
          <CompletionOverlay />
        )}
      </AnimatePresence>
    </div>
  )
}

function CompletionOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="absolute inset-0 flex flex-col items-center justify-center rounded-[inherit] z-10"
      style={{ background: 'var(--completion-color)', opacity: 0.95 }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-center"
        style={{ color: 'white' }}
      >
        <div className="font-display text-4xl font-semibold mb-2">Solved</div>
        <div className="text-sm opacity-80">Well played.</div>
      </motion.div>
    </motion.div>
  )
}
