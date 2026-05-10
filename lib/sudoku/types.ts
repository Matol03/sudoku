export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type Empty = 0
export type Cell = Digit | Empty

/** 81-element flat array, row-major order */
export type Grid = Cell[]

export type Difficulty =
  | 'beginner'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'expert'
  | 'master'

export interface Puzzle {
  id: string
  givens: Grid
  solution: Grid
  difficulty: Difficulty
  techniqueTags: SolvingTechnique[]
}

export type SolvingTechnique =
  | 'naked_single'
  | 'hidden_single'
  | 'naked_pair'
  | 'naked_triple'
  | 'hidden_pair'
  | 'pointing_pair'
  | 'box_line_reduction'
  | 'x_wing'
  | 'swordfish'
  | 'xy_wing'
  | 'brute_force'

export interface CellNote {
  [digit: number]: boolean
}

export interface GameCell {
  value: Cell
  isGiven: boolean
  notes: Set<Digit>
  isError: boolean
  isHint: boolean
}

export interface HintStep {
  type: 'region' | 'technique' | 'cell' | 'digit'
  message: string
  cellIndex?: number
  digit?: Digit
  technique?: SolvingTechnique
}

export interface WorkerRequest {
  type: 'generate'
  difficulty: Difficulty
  seed?: number
}

export interface WorkerResponse {
  type: 'puzzle' | 'error'
  puzzle?: Puzzle
  error?: string
}

export const DIFFICULTY_GIVENS: Record<Difficulty, [number, number]> = {
  beginner: [40, 50],
  easy:     [32, 35],
  medium:   [28, 31],
  hard:     [24, 27],
  expert:   [22, 24],
  master:   [17, 21],
}
