import type { Grid, Digit, SolvingTechnique } from './types'
import { getCandidates, ROWS, COLS, BOXES, ALL_UNITS, getBox } from './solver'

/**
 * Detects which solving techniques are required for this puzzle.
 * Simulates a human solver and records each technique used.
 */
export function detectTechniques(givens: Grid): SolvingTechnique[] {
  const used = new Set<SolvingTechnique>()
  const g = [...givens] as Grid
  let progress = true

  while (g.some(c => c === 0)) {
    progress = false
    const candidates = getCandidates(g)
    if (candidates.size === 0 && g.some(c => c === 0)) {
      used.add('brute_force')
      break
    }

    // Naked single
    for (const [idx, cands] of candidates) {
      if (cands.size === 1) {
        g[idx] = [...cands][0]
        used.add('naked_single')
        progress = true
        break
      }
    }
    if (progress) continue

    // Hidden single (in row, col, or box)
    outer: for (const unit of ALL_UNITS) {
      for (let d = 1; d <= 9; d++) {
        const positions = unit.filter(i => {
          const c = candidates.get(i)
          return c && c.has(d as Digit)
        })
        if (positions.length === 1) {
          g[positions[0]] = d as Digit
          used.add('hidden_single')
          progress = true
          break outer
        }
      }
    }
    if (progress) continue

    // Naked pair
    if (applyNakedPair(g, candidates)) { used.add('naked_pair'); progress = true; continue }

    // Naked triple
    if (applyNakedTriple(g, candidates)) { used.add('naked_triple'); progress = true; continue }

    // Hidden pair
    if (applyHiddenPair(g, candidates)) { used.add('hidden_pair'); progress = true; continue }

    // Pointing pair (box → row/col elimination)
    if (applyPointingPair(g, candidates)) { used.add('pointing_pair'); progress = true; continue }

    // Box-line reduction
    if (applyBoxLineReduction(g, candidates)) { used.add('box_line_reduction'); progress = true; continue }

    // X-Wing
    if (applyXWing(g, candidates)) { used.add('x_wing'); progress = true; continue }

    // If no technique works, puzzle requires brute force (or techniques beyond our detector)
    if (!progress) {
      used.add('brute_force')
      break
    }
  }

  return [...used]
}

function applyNakedPair(g: Grid, candidates: Map<number, Set<Digit>>): boolean {
  for (const unit of ALL_UNITS) {
    const pairs = unit.filter(i => candidates.get(i)?.size === 2)
    for (let a = 0; a < pairs.length - 1; a++) {
      for (let b = a + 1; b < pairs.length; b++) {
        const ca = candidates.get(pairs[a])!
        const cb = candidates.get(pairs[b])!
        if (!setsEqual(ca, cb)) continue
        let eliminated = false
        for (const i of unit) {
          if (i === pairs[a] || i === pairs[b]) continue
          const c = candidates.get(i)
          if (!c) continue
          for (const d of ca) {
            if (c.has(d)) { c.delete(d); eliminated = true }
          }
        }
        if (eliminated) return true
      }
    }
  }
  return false
}

function applyNakedTriple(g: Grid, candidates: Map<number, Set<Digit>>): boolean {
  for (const unit of ALL_UNITS) {
    const triples = unit.filter(i => {
      const c = candidates.get(i)
      return c && c.size >= 2 && c.size <= 3
    })
    for (let a = 0; a < triples.length - 2; a++) {
      for (let b = a + 1; b < triples.length - 1; b++) {
        for (let c = b + 1; c < triples.length; c++) {
          const union = new Set([
            ...candidates.get(triples[a])!,
            ...candidates.get(triples[b])!,
            ...candidates.get(triples[c])!,
          ])
          if (union.size !== 3) continue
          let eliminated = false
          for (const i of unit) {
            if (i === triples[a] || i === triples[b] || i === triples[c]) continue
            const cands = candidates.get(i)
            if (!cands) continue
            for (const d of union) {
              if (cands.has(d)) { cands.delete(d); eliminated = true }
            }
          }
          if (eliminated) return true
        }
      }
    }
  }
  return false
}

function applyHiddenPair(g: Grid, candidates: Map<number, Set<Digit>>): boolean {
  for (const unit of ALL_UNITS) {
    for (let d1 = 1; d1 <= 8; d1++) {
      for (let d2 = d1 + 1; d2 <= 9; d2++) {
        const p1 = unit.filter(i => candidates.get(i)?.has(d1 as Digit))
        const p2 = unit.filter(i => candidates.get(i)?.has(d2 as Digit))
        if (p1.length !== 2 || p2.length !== 2) continue
        if (!p1.every(x => p2.includes(x))) continue
        let eliminated = false
        for (const i of p1) {
          const c = candidates.get(i)!
          for (const d of [...c]) {
            if (d !== d1 && d !== d2) { c.delete(d); eliminated = true }
          }
        }
        if (eliminated) return true
      }
    }
  }
  return false
}

function applyPointingPair(g: Grid, candidates: Map<number, Set<Digit>>): boolean {
  for (const box of BOXES) {
    for (let d = 1; d <= 9; d++) {
      const inBox = box.filter(i => candidates.get(i)?.has(d as Digit))
      if (inBox.length < 2 || inBox.length > 3) continue

      const rows = new Set(inBox.map(i => Math.floor(i / 9)))
      const cols = new Set(inBox.map(i => i % 9))

      if (rows.size === 1) {
        const row = [...rows][0]
        let eliminated = false
        for (const i of ROWS[row]) {
          if (box.includes(i)) continue
          const c = candidates.get(i)
          if (c?.has(d as Digit)) { c.delete(d as Digit); eliminated = true }
        }
        if (eliminated) return true
      }

      if (cols.size === 1) {
        const col = [...cols][0]
        let eliminated = false
        for (const i of COLS[col]) {
          if (box.includes(i)) continue
          const c = candidates.get(i)
          if (c?.has(d as Digit)) { c.delete(d as Digit); eliminated = true }
        }
        if (eliminated) return true
      }
    }
  }
  return false
}

function applyBoxLineReduction(g: Grid, candidates: Map<number, Set<Digit>>): boolean {
  for (let d = 1; d <= 9; d++) {
    for (const row of ROWS) {
      const inRow = row.filter(i => candidates.get(i)?.has(d as Digit))
      if (inRow.length < 2 || inRow.length > 3) continue
      const boxes = new Set(inRow.map(i => getBox(i)))
      if (boxes.size !== 1) continue
      const boxIdx = [...boxes][0]
      let eliminated = false
      for (const i of BOXES[boxIdx]) {
        if (row.includes(i)) continue
        const c = candidates.get(i)
        if (c?.has(d as Digit)) { c.delete(d as Digit); eliminated = true }
      }
      if (eliminated) return true
    }

    for (const col of COLS) {
      const inCol = col.filter(i => candidates.get(i)?.has(d as Digit))
      if (inCol.length < 2 || inCol.length > 3) continue
      const boxes = new Set(inCol.map(i => getBox(i)))
      if (boxes.size !== 1) continue
      const boxIdx = [...boxes][0]
      let eliminated = false
      for (const i of BOXES[boxIdx]) {
        if (col.includes(i)) continue
        const c = candidates.get(i)
        if (c?.has(d as Digit)) { c.delete(d as Digit); eliminated = true }
      }
      if (eliminated) return true
    }
  }
  return false
}

function applyXWing(g: Grid, candidates: Map<number, Set<Digit>>): boolean {
  for (let d = 1; d <= 9; d++) {
    // Row-based X-Wing
    const rowPairs: [number, number[]][] = []
    for (let r = 0; r < 9; r++) {
      const positions = ROWS[r].filter(i => candidates.get(i)?.has(d as Digit))
      if (positions.length === 2) rowPairs.push([r, positions.map(i => i % 9)])
    }
    for (let a = 0; a < rowPairs.length - 1; a++) {
      for (let b = a + 1; b < rowPairs.length; b++) {
        const [, colsA] = rowPairs[a]
        const [, colsB] = rowPairs[b]
        if (colsA[0] !== colsB[0] || colsA[1] !== colsB[1]) continue
        let eliminated = false
        for (const col of colsA) {
          for (const i of COLS[col]) {
            const row = Math.floor(i / 9)
            if (row === rowPairs[a][0] || row === rowPairs[b][0]) continue
            const c = candidates.get(i)
            if (c?.has(d as Digit)) { c.delete(d as Digit); eliminated = true }
          }
        }
        if (eliminated) return true
      }
    }
  }
  return false
}

function setsEqual(a: Set<Digit>, b: Set<Digit>): boolean {
  if (a.size !== b.size) return false
  for (const x of a) if (!b.has(x)) return false
  return true
}
