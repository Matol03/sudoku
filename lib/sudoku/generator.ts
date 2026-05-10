import type { Grid, Digit, Cell, Difficulty, Puzzle, SolvingTechnique } from './types'
import { DIFFICULTY_GIVENS } from './types'
import { solve, hasUniqueSolution, ALL_PEERS, usedDigits, getCandidates, ROWS, COLS, BOXES } from './solver'
import { detectTechniques } from './techniqueDetector'

/** Seeded pseudo-random (mulberry32) */
function makePrng(seed: number) {
  let s = seed
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Generate a complete, valid solution grid */
function generateSolution(rand: () => number): Grid {
  const grid: Grid = Array(81).fill(0) as Grid

  function fill(pos: number): boolean {
    if (pos === 81) return true
    const digits = shuffle([1,2,3,4,5,6,7,8,9] as Digit[], rand)
    const used = usedDigits(grid, pos)
    for (const d of digits) {
      if (!used.has(d)) {
        grid[pos] = d
        if (fill(pos + 1)) return true
        grid[pos] = 0
      }
    }
    return false
  }

  fill(0)
  return grid
}

/**
 * Dig holes in the solution to reach the target given count.
 * Uses symmetric removal (180° rotational symmetry) when possible.
 */
function digHoles(solution: Grid, targetGivens: number, rand: () => number): Grid {
  const givens = [...solution] as Grid
  let givenCount = 81

  // Build removal order with 180° symmetry pairs
  const indices = shuffle(Array.from({ length: 41 }, (_, i) => i), rand)

  for (const i of indices) {
    if (givenCount <= targetGivens) break
    const mirror = 80 - i
    const iVal = givens[i]
    const mVal = givens[mirror]

    if (iVal === 0 && mVal === 0) continue

    // Try removing both (symmetric)
    if (i !== mirror && iVal !== 0 && mVal !== 0 && givenCount - 2 >= targetGivens) {
      givens[i] = 0
      givens[mirror] = 0
      if (hasUniqueSolution(givens)) {
        givenCount -= 2
        continue
      }
      givens[i] = iVal
      givens[mirror] = mVal
    }

    // Try removing just i
    if (iVal !== 0 && givenCount - 1 >= targetGivens) {
      givens[i] = 0
      if (hasUniqueSolution(givens)) {
        givenCount--
        continue
      }
      givens[i] = iVal
    }

    // Try removing just mirror
    if (i !== mirror && mVal !== 0 && givenCount - 1 >= targetGivens) {
      givens[mirror] = 0
      if (hasUniqueSolution(givens)) {
        givenCount--
        continue
      }
      givens[mirror] = mVal
    }
  }

  return givens
}

let puzzleIdCounter = 0

export function generatePuzzle(difficulty: Difficulty, seed?: number): Puzzle {
  const rand = makePrng(seed ?? (Date.now() ^ Math.random() * 0xFFFFFFFF))
  const [minGivens, maxGivens] = DIFFICULTY_GIVENS[difficulty]
  const targetGivens = minGivens + Math.floor(rand() * (maxGivens - minGivens + 1))

  const solution = generateSolution(rand)
  const givens = digHoles(solution, targetGivens, rand)
  const techniqueTags = detectTechniques(givens)

  return {
    id: `${difficulty}-${Date.now()}-${++puzzleIdCounter}`,
    givens,
    solution,
    difficulty,
    techniqueTags,
  }
}

/** Generate daily puzzle seeded by date string (YYYY-MM-DD) */
export function generateDailyPuzzle(dateStr: string, difficulty: Difficulty = 'medium'): Puzzle {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = Math.imul(31, hash) + dateStr.charCodeAt(i) | 0
  }
  return generatePuzzle(difficulty, Math.abs(hash))
}
