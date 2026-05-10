import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Grid, Cell, Digit, GameCell, Puzzle, HintStep } from '@/lib/sudoku/types'
import { ALL_PEERS, solve } from '@/lib/sudoku/solver'
import { getHintSteps } from '@/lib/sudoku/hintSystem'

export interface MoveRecord {
  cellIndex: number
  previousValue: Cell
  previousNotes: Set<Digit>
  newValue: Cell
  newNotes: Set<Digit>
  timestamp: number
}

interface GameState {
  puzzle: Puzzle | null
  cells: GameCell[]
  selectedCell: number | null
  isNotesMode: boolean
  mistakeCount: number
  hintsUsed: number
  timeElapsed: number
  isRunning: boolean
  isComplete: boolean
  history: MoveRecord[]
  historyIndex: number
  hintSteps: HintStep[]
  hintStepIndex: number
  showHintUpsell: boolean

  setPuzzle: (puzzle: Puzzle) => void
  selectCell: (index: number | null) => void
  enterDigit: (digit: Digit) => void
  clearCell: () => void
  toggleNotesMode: () => void
  toggleNote: (digit: Digit) => void
  undo: () => void
  redo: () => void
  tick: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  requestHint: () => HintStep | null
  dismissHintUpsell: () => void
  loadCustomPuzzle: (givens: Grid) => boolean
  reset: () => void
}

function buildInitialCells(puzzle: Puzzle): GameCell[] {
  return puzzle.givens.map(value => ({
    value,
    isGiven: value !== 0,
    notes: new Set<Digit>(),
    isError: false,
    isHint: false,
  }))
}

function checkComplete(cells: GameCell[], solution: Grid): boolean {
  return cells.every((c, i) => c.value === solution[i])
}

function checkError(cells: GameCell[], solution: Grid, index: number): boolean {
  const cell = cells[index]
  if (cell.value === 0 || cell.isGiven) return false
  return cell.value !== solution[index]
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      puzzle: null,
      cells: [],
      selectedCell: null,
      isNotesMode: false,
      mistakeCount: 0,
      hintsUsed: 0,
      timeElapsed: 0,
      isRunning: false,
      isComplete: false,
      history: [],
      historyIndex: -1,
      hintSteps: [],
      hintStepIndex: 0,
      showHintUpsell: false,

      setPuzzle: (puzzle) => set({
        puzzle,
        cells: buildInitialCells(puzzle),
        selectedCell: null,
        isNotesMode: false,
        mistakeCount: 0,
        hintsUsed: 0,
        timeElapsed: 0,
        isRunning: true,
        isComplete: false,
        history: [],
        historyIndex: -1,
        hintSteps: [],
        hintStepIndex: 0,
        showHintUpsell: false,
      }),

      selectCell: (index) => set(state => {
        // Clear previous hint highlights
        const cells = state.cells.map(c => ({ ...c, isHint: false }))
        return { selectedCell: index, cells }
      }),

      enterDigit: (digit) => set(state => {
        const { selectedCell, cells, puzzle, isNotesMode } = state
        if (selectedCell === null || !puzzle) return {}
        const cell = cells[selectedCell]
        if (cell.isGiven) return {}

        if (isNotesMode) {
          const newNotes = new Set(cell.notes)
          if (newNotes.has(digit)) newNotes.delete(digit)
          else newNotes.add(digit)

          const record: MoveRecord = {
            cellIndex: selectedCell,
            previousValue: cell.value,
            previousNotes: new Set(cell.notes),
            newValue: cell.value,
            newNotes,
            timestamp: Date.now(),
          }
          const newCells = [...cells]
          newCells[selectedCell] = { ...cell, notes: newNotes }
          const history = [...state.history.slice(0, state.historyIndex + 1), record]
          return { cells: newCells, history, historyIndex: history.length - 1 }
        }

        const record: MoveRecord = {
          cellIndex: selectedCell,
          previousValue: cell.value,
          previousNotes: new Set(cell.notes),
          newValue: digit,
          newNotes: new Set(),
          timestamp: Date.now(),
        }

        const newCells = [...cells]
        const isError = digit !== puzzle.solution[selectedCell]
        newCells[selectedCell] = { ...cell, value: digit, notes: new Set(), isError, isHint: false }

        // Clear notes from peers when digit placed correctly
        if (!isError) {
          for (const p of ALL_PEERS[selectedCell]) {
            if (!newCells[p].isGiven) {
              const pNotes = new Set(newCells[p].notes)
              pNotes.delete(digit)
              newCells[p] = { ...newCells[p], notes: pNotes }
            }
          }
        }

        const mistakeCount = isError ? state.mistakeCount + 1 : state.mistakeCount
        const isComplete = !isError && checkComplete(newCells, puzzle.solution)
        const history = [...state.history.slice(0, state.historyIndex + 1), record]

        return {
          cells: newCells,
          mistakeCount,
          isComplete,
          isRunning: !isComplete,
          history,
          historyIndex: history.length - 1,
        }
      }),

      clearCell: () => set(state => {
        const { selectedCell, cells } = state
        if (selectedCell === null) return {}
        const cell = cells[selectedCell]
        if (cell.isGiven) return {}

        const record: MoveRecord = {
          cellIndex: selectedCell,
          previousValue: cell.value,
          previousNotes: new Set(cell.notes),
          newValue: 0,
          newNotes: new Set(),
          timestamp: Date.now(),
        }
        const newCells = [...cells]
        newCells[selectedCell] = { ...cell, value: 0, notes: new Set(), isError: false }
        const history = [...state.history.slice(0, state.historyIndex + 1), record]
        return { cells: newCells, history, historyIndex: history.length - 1 }
      }),

      toggleNotesMode: () => set(s => ({ isNotesMode: !s.isNotesMode })),

      toggleNote: (digit) => {
        const { isNotesMode, enterDigit, toggleNotesMode } = get()
        if (!isNotesMode) toggleNotesMode()
        get().enterDigit(digit)
        if (!isNotesMode) toggleNotesMode()
      },

      undo: () => set(state => {
        if (state.historyIndex < 0) return {}
        const record = state.history[state.historyIndex]
        const newCells = [...state.cells]
        newCells[record.cellIndex] = {
          ...newCells[record.cellIndex],
          value: record.previousValue,
          notes: new Set(record.previousNotes),
          isError: false,
        }
        return { cells: newCells, historyIndex: state.historyIndex - 1 }
      }),

      redo: () => set(state => {
        if (state.historyIndex >= state.history.length - 1) return {}
        const record = state.history[state.historyIndex + 1]
        const { puzzle } = state
        const newCells = [...state.cells]
        const isError = record.newValue !== 0 && puzzle
          ? record.newValue !== puzzle.solution[record.cellIndex]
          : false
        newCells[record.cellIndex] = {
          ...newCells[record.cellIndex],
          value: record.newValue,
          notes: new Set(record.newNotes),
          isError,
        }
        return { cells: newCells, historyIndex: state.historyIndex + 1 }
      }),

      tick: () => set(s => s.isRunning && !s.isComplete
        ? { timeElapsed: s.timeElapsed + 1 }
        : {}
      ),

      pauseTimer: () => set({ isRunning: false }),
      resumeTimer: () => set(s => s.isComplete ? {} : { isRunning: true }),

      requestHint: () => {
        const state = get()
        const { puzzle, cells, hintsUsed, hintSteps, hintStepIndex } = state
        if (!puzzle) return null

        const FREE_HINTS = 5
        // TODO: check Pro subscription here
        if (hintsUsed >= FREE_HINTS) {
          set({ showHintUpsell: true })
          return null
        }

        let steps = hintSteps
        let stepIdx = hintStepIndex

        if (steps.length === 0 || stepIdx >= steps.length) {
          const current = cells.map(c => c.value) as Grid
          steps = getHintSteps(puzzle.givens, current, puzzle.solution)
          stepIdx = 0
        }

        if (steps.length === 0) return null

        const step = steps[stepIdx]
        const newCells = [...cells]

        if (step.type === 'cell' && step.cellIndex !== undefined) {
          newCells[step.cellIndex] = { ...newCells[step.cellIndex], isHint: true }
        }
        if (step.type === 'digit' && step.cellIndex !== undefined && step.digit) {
          newCells[step.cellIndex] = {
            ...newCells[step.cellIndex],
            value: step.digit,
            isHint: true,
            isError: false,
          }
        }

        set({
          cells: newCells,
          hintsUsed: hintsUsed + 1,
          hintSteps: steps,
          hintStepIndex: stepIdx + 1,
        })

        return step
      },

      dismissHintUpsell: () => set({ showHintUpsell: false }),

      loadCustomPuzzle: (givens) => {
        const solution = solve([...givens])
        if (!solution) return false
        const puzzle: Puzzle = {
          id: `custom-${Date.now()}`,
          givens: [...givens] as Grid,
          solution: solution as Grid,
          difficulty: 'medium',
          techniqueTags: [],
        }
        set({
          puzzle,
          cells: buildInitialCells(puzzle),
          selectedCell: null,
          isNotesMode: false,
          mistakeCount: 0,
          hintsUsed: 0,
          timeElapsed: 0,
          isRunning: true,
          isComplete: false,
          history: [],
          historyIndex: -1,
          hintSteps: [],
          hintStepIndex: 0,
          showHintUpsell: false,
        })
        return true
      },

      reset: () => set(state => {
        if (!state.puzzle) return {}
        return {
          cells: buildInitialCells(state.puzzle),
          selectedCell: null,
          mistakeCount: 0,
          hintsUsed: 0,
          timeElapsed: 0,
          isRunning: true,
          isComplete: false,
          history: [],
          historyIndex: -1,
          hintSteps: [],
          hintStepIndex: 0,
        }
      }),
    }),
    {
      name: 'sudoku-atelier-game',
      partialize: (state) => ({
        puzzle: state.puzzle,
        cells: state.cells.map(c => ({
          ...c,
          notes: [...c.notes],
        })),
        timeElapsed: state.timeElapsed,
        mistakeCount: state.mistakeCount,
        hintsUsed: state.hintsUsed,
        historyIndex: state.historyIndex,
      }),
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<GameState> & { cells?: Array<GameCell & { notes: Digit[] }> }
        if (!p.cells) return current
        return {
          ...current,
          ...p,
          cells: p.cells.map((c) => ({ ...c, notes: new Set(c.notes ?? []) })),
          isRunning: false,
        }
      },
    }
  )
)

export type { GameState }
