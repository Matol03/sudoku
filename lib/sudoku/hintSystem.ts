import type { Grid, Digit, HintStep, SolvingTechnique } from './types'
import { getCandidates, ROWS, COLS, BOXES, ALL_UNITS } from './solver'

/**
 * Progressive hint system — returns steps from vague to specific.
 * Each step costs one hint credit.
 */
export function getHintSteps(givens: Grid, current: Grid, solution: Grid): HintStep[] {
  const candidates = getCandidates(current)
  if (candidates.size === 0) return []

  // Find a cell that can be solved next (match solution)
  const solvableCell = findNextSolvableCell(current, solution, candidates)
  if (!solvableCell) return []

  const { idx, technique } = solvableCell
  const row = Math.floor(idx / 9)
  const col = idx % 9
  const digit = solution[idx] as Digit

  const steps: HintStep[] = [
    {
      type: 'region',
      message: `Look at row ${row + 1} and column ${col + 1}.`,
    },
    {
      type: 'technique',
      message: `Try using the ${formatTechnique(technique)} technique near row ${row + 1}.`,
      technique,
    },
    {
      type: 'cell',
      message: `The cell at row ${row + 1}, column ${col + 1} can be determined.`,
      cellIndex: idx,
    },
    {
      type: 'digit',
      message: `Place ${digit} at row ${row + 1}, column ${col + 1}.`,
      cellIndex: idx,
      digit,
    },
  ]

  return steps
}

function findNextSolvableCell(
  current: Grid,
  solution: Grid,
  candidates: Map<number, Set<Digit>>
): { idx: number; technique: SolvingTechnique } | null {
  // Prefer naked singles first (most instructive)
  for (const [idx, cands] of candidates) {
    if (cands.size === 1) return { idx, technique: 'naked_single' }
  }

  // Hidden singles
  for (const unit of ALL_UNITS) {
    for (let d = 1; d <= 9; d++) {
      const positions = unit.filter(i => candidates.get(i)?.has(d as Digit))
      if (positions.length === 1) return { idx: positions[0], technique: 'hidden_single' }
    }
  }

  // Fall back to first unsolved cell (requires more advanced technique)
  for (let i = 0; i < 81; i++) {
    if (current[i] === 0) return { idx: i, technique: 'naked_pair' }
  }

  return null
}

function formatTechnique(t: SolvingTechnique): string {
  return {
    naked_single: 'naked single',
    hidden_single: 'hidden single',
    naked_pair: 'naked pair',
    naked_triple: 'naked triple',
    hidden_pair: 'hidden pair',
    pointing_pair: 'pointing pair',
    box_line_reduction: 'box-line reduction',
    x_wing: 'X-Wing',
    swordfish: 'Swordfish',
    xy_wing: 'XY-Wing',
    brute_force: 'elimination',
  }[t] ?? t
}

export const DAILY_HINT_LIMIT = 5
