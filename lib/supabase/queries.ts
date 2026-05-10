import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'
import type { Difficulty } from '@/lib/sudoku/types'

export type StatsData = {
  totalPuzzles: number
  completedPuzzles: number
  winRate: number
  currentStreak: number
  longestStreak: number
  bestTimes: Record<Difficulty, number | null>
  techniquesMastered: Array<{ name: string; count: number; max: number }>
  calendarData: Record<string, number>
}

type SB = SupabaseClient<Database>

/** Fetch all stats for a given user. All queries run concurrently. */
export async function fetchUserStats(supabase: SB, userId: string): Promise<StatsData> {
  const [gamesResult, calendarResult] = await Promise.all([
    supabase
      .from('games')
      .select(`
        id,
        status,
        time_elapsed_seconds,
        completed_at,
        puzzles!inner ( difficulty, technique_tags )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: true }),

    supabase
      .from('games')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null),
  ])

  type GameRow = {
    id: string
    status: string
    time_elapsed_seconds: number
    completed_at: string | null
    puzzles: { difficulty: string; technique_tags: string[] }
  }
  const games = (gamesResult.data ?? []) as unknown as GameRow[]
  const completed = games.filter(g => g.status === 'completed')

  // Win rate
  const totalPuzzles = games.length
  const completedPuzzles = completed.length
  const winRate = totalPuzzles > 0 ? Math.round((completedPuzzles / totalPuzzles) * 100) : 0

  // Best times per difficulty
  const bestTimes: Record<string, number | null> = {
    beginner: null, easy: null, medium: null, hard: null, expert: null, master: null,
  }
  for (const g of completed) {
    const diff = g.puzzles.difficulty
    const t = g.time_elapsed_seconds
    if (bestTimes[diff] === null || t < (bestTimes[diff] ?? Infinity)) {
      bestTimes[diff] = t
    }
  }

  // Technique mastery — count how many completed games used each technique
  const techniqueCounts: Record<string, number> = {}
  for (const g of completed) {
    for (const tag of g.puzzles.technique_tags ?? []) {
      techniqueCounts[tag] = (techniqueCounts[tag] ?? 0) + 1
    }
  }

  const TECHNIQUE_MAXES: Record<string, number> = {
    naked_single: 1000,
    hidden_single: 500,
    naked_pair: 200,
    naked_triple: 100,
    hidden_pair: 80,
    pointing_pair: 100,
    box_line_reduction: 60,
    x_wing: 50,
    swordfish: 30,
    xy_wing: 30,
  }
  const TECHNIQUE_LABELS: Record<string, string> = {
    naked_single: 'Naked Single',
    hidden_single: 'Hidden Single',
    naked_pair: 'Naked Pair',
    naked_triple: 'Naked Triple',
    hidden_pair: 'Hidden Pair',
    pointing_pair: 'Pointing Pair',
    box_line_reduction: 'Box-Line Reduction',
    x_wing: 'X-Wing',
    swordfish: 'Swordfish',
    xy_wing: 'XY-Wing',
  }

  const techniquesMastered = Object.entries(techniqueCounts)
    .filter(([key]) => key !== 'brute_force')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key, count]) => ({
      name: TECHNIQUE_LABELS[key] ?? key,
      count,
      max: TECHNIQUE_MAXES[key] ?? 100,
    }))

  // Calendar data — count completions per UTC day
  const calendarData: Record<string, number> = {}
  const calRows = (calendarResult.data ?? []) as unknown as Array<{ completed_at: string | null }>
  for (const g of calRows) {
    if (!g.completed_at) continue
    const day = g.completed_at.slice(0, 10)
    calendarData[day] = (calendarData[day] ?? 0) + 1
  }

  // Streak calculation — consecutive days with at least one completion
  const days = Object.keys(calendarData).sort()
  let currentStreak = 0
  let longestStreak = 0
  let streak = 0

  const todayStr = new Date().toISOString().slice(0, 10)
  const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

  for (let i = 0; i < days.length; i++) {
    if (i === 0) {
      streak = 1
    } else {
      const prev = new Date(days[i - 1])
      const curr = new Date(days[i])
      const diff = (curr.getTime() - prev.getTime()) / 86_400_000
      streak = diff === 1 ? streak + 1 : 1
    }
    longestStreak = Math.max(longestStreak, streak)
    if (days[i] === todayStr || days[i] === yesterdayStr) {
      currentStreak = streak
    }
  }

  return {
    totalPuzzles,
    completedPuzzles,
    winRate,
    currentStreak,
    longestStreak,
    bestTimes: bestTimes as Record<Difficulty, number | null>,
    techniquesMastered,
    calendarData,
  }
}
