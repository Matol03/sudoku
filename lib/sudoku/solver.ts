import type { Grid, Digit, Cell } from './types'

/** Returns row/col/box peers of cell index i (excluding i itself) */
export function getPeers(i: number): number[] {
  const row = Math.floor(i / 9)
  const col = i % 9
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3

  const peers = new Set<number>()
  for (let c = 0; c < 9; c++) peers.add(row * 9 + c)
  for (let r = 0; r < 9; r++) peers.add(r * 9 + col)
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      peers.add((boxRow + r) * 9 + (boxCol + c))
  peers.delete(i)
  return [...peers]
}

/** All peer sets pre-computed */
export const ALL_PEERS: number[][] = Array.from({ length: 81 }, (_, i) => getPeers(i))

/** Returns the set of digits already used in cell i's peers */
export function usedDigits(grid: Grid, i: number): Set<Digit> {
  const used = new Set<Digit>()
  for (const p of ALL_PEERS[i]) {
    const v = grid[p]
    if (v !== 0) used.add(v as Digit)
  }
  return used
}

/** Returns candidate digits for each empty cell */
export function getCandidates(grid: Grid): Map<number, Set<Digit>> {
  const candidates = new Map<number, Set<Digit>>()
  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) continue
    const used = usedDigits(grid, i)
    const cands = new Set<Digit>()
    for (let d = 1; d <= 9; d++) {
      if (!used.has(d as Digit)) cands.add(d as Digit)
    }
    candidates.set(i, cands)
  }
  return candidates
}

/**
 * Solve grid using backtracking.
 * Returns null if no solution, the solution grid otherwise.
 * countSolutions=true stops after finding 2 (uniqueness check).
 */
export function solve(grid: Grid, countSolutions = false): Grid | null {
  const g = [...grid] as Grid
  let solutionCount = 0

  function backtrack(): Grid | null {
    // Find empty cell with fewest candidates (MRV heuristic)
    let minCands = 10
    let minIdx = -1
    for (let i = 0; i < 81; i++) {
      if (g[i] !== 0) continue
      const used = usedDigits(g, i)
      const count = 9 - used.size
      if (count < minCands) {
        minCands = count
        minIdx = i
        if (count === 0) return null // dead end
      }
    }
    if (minIdx === -1) {
      solutionCount++
      if (countSolutions && solutionCount >= 2) return [...g] as Grid
      return [...g] as Grid
    }

    const used = usedDigits(g, minIdx)
    for (let d = 1; d <= 9; d++) {
      if (used.has(d as Digit)) continue
      g[minIdx] = d as Digit
      const result = backtrack()
      if (result && !countSolutions) return result
      if (countSolutions && solutionCount >= 2) return result
      g[minIdx] = 0
    }
    return null
  }

  return backtrack()
}

/** Returns true if puzzle has exactly one solution */
export function hasUniqueSolution(givens: Grid): boolean {
  const g = [...givens] as Grid
  let count = 0

  function backtrack(): void {
    if (count >= 2) return

    let minCands = 10
    let minIdx = -1
    for (let i = 0; i < 81; i++) {
      if (g[i] !== 0) continue
      const used = usedDigits(g, i)
      const c = 9 - used.size
      if (c === 0) return
      if (c < minCands) { minCands = c; minIdx = i }
    }
    if (minIdx === -1) { count++; return }

    const used = usedDigits(g, minIdx)
    for (let d = 1; d <= 9; d++) {
      if (used.has(d as Digit) || count >= 2) continue
      g[minIdx] = d as Digit
      backtrack()
      g[minIdx] = 0
    }
  }

  backtrack()
  return count === 1
}

/** Validates a complete grid (all 81 cells filled, no conflicts) */
export function isValidSolution(grid: Grid): boolean {
  if (grid.some(c => c === 0)) return false
  const check = (cells: number[]) => {
    const digits = cells.map(i => grid[i])
    return new Set(digits).size === 9
  }
  for (let i = 0; i < 9; i++) {
    if (!check(Array.from({ length: 9 }, (_, j) => i * 9 + j))) return false
    if (!check(Array.from({ length: 9 }, (_, j) => j * 9 + i))) return false
    const br = Math.floor(i / 3) * 3
    const bc = (i % 3) * 3
    if (!check([0,1,2,9,10,11,18,19,20].map(o => (br + Math.floor(o/3)) * 9 + bc + (o % 3)))) return false
  }
  return true
}

/** Returns the row units (9 arrays of 9 indices each) */
export function getRows(): number[][] {
  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => r * 9 + c)
  )
}

/** Returns the column units */
export function getCols(): number[][] {
  return Array.from({ length: 9 }, (_, c) =>
    Array.from({ length: 9 }, (_, r) => r * 9 + c)
  )
}

/** Returns the box units */
export function getBoxes(): number[][] {
  return Array.from({ length: 9 }, (_, b) => {
    const br = Math.floor(b / 3) * 3
    const bc = (b % 3) * 3
    return Array.from({ length: 9 }, (_, j) =>
      (br + Math.floor(j / 3)) * 9 + (bc + (j % 3))
    )
  })
}

export const ROWS = getRows()
export const COLS = getCols()
export const BOXES = getBoxes()
export const ALL_UNITS = [...ROWS, ...COLS, ...BOXES]

/** Get box index for cell i */
export function getBox(i: number): number {
  const row = Math.floor(i / 9)
  const col = i % 9
  return Math.floor(row / 3) * 3 + Math.floor(col / 3)
}
