/**
 * Seed script — generates example puzzles for each difficulty and inserts them
 * into Supabase, plus creates daily_puzzles entries for the next 30 days.
 *
 * Usage: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import { generatePuzzle, generateDailyPuzzle } from '../lib/sudoku/generator'
import type { Difficulty } from '../lib/sudoku/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master']

async function seed() {
  console.log('Seeding puzzles…')

  // Insert 5 puzzles per difficulty (30 total)
  const puzzles = DIFFICULTIES.flatMap(difficulty =>
    Array.from({ length: 5 }, (_, i) => {
      const p = generatePuzzle(difficulty)
      return {
        id: p.id,
        difficulty: p.difficulty,
        givens: p.givens,
        solution: p.solution,
        technique_tags: p.techniqueTags,
      }
    })
  )

  const { error: puzzleErr } = await supabase.from('puzzles').upsert(puzzles)
  if (puzzleErr) { console.error('Puzzle insert error:', puzzleErr); process.exit(1) }
  console.log(`✓ Inserted ${puzzles.length} puzzles`)

  // Generate daily puzzles for the next 30 days
  const today = new Date()
  const dailyEntries = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const p = generateDailyPuzzle(dateStr)

    const { data: inserted } = await supabase
      .from('puzzles')
      .upsert({
        id: p.id,
        difficulty: p.difficulty,
        givens: p.givens,
        solution: p.solution,
        technique_tags: p.techniqueTags,
      })
      .select('id')
      .single()

    dailyEntries.push({ date: dateStr, puzzle_id: p.id })
  }

  const { error: dailyErr } = await supabase.from('daily_puzzles').upsert(dailyEntries)
  if (dailyErr) { console.error('Daily puzzle insert error:', dailyErr); process.exit(1) }
  console.log(`✓ Created ${dailyEntries.length} daily puzzle entries`)
  console.log('Seed complete.')
}

seed()
