'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { useUser } from '@/lib/hooks/useUser'
import type { StatsData } from '@/lib/supabase/queries'
import { Trophy, Flame, Clock, Target, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import type { Difficulty } from '@/lib/sudoku/types'

function formatTime(s: number | null): string {
  if (s === null) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function StatCard({
  icon, label, value, sub, delay = 0,
}: { icon: React.ReactNode; label: string; value: string | number; sub?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col gap-1 p-5 rounded-[var(--radius-board)]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
      </div>
      <span className="font-display" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</span>}
    </motion.div>
  )
}

function TechniqueBar({ name, count, max, delay }: { name: string; count: number; max: number; delay: number }) {
  const pct = Math.min(100, (count / max) * 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{name}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--accent)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  )
}

function HeatmapCalendar({ data }: { data: Record<string, number> }) {
  const weeks: Array<Array<{ date: string; count: number }>> = []
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 364 - start.getDay())

  let week: Array<{ date: string; count: number }> = []
  for (const d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0]
    week.push({ date: key, count: data[key] ?? 0 })
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length) weeks.push(week)

  function cellColor(count: number): string {
    if (count === 0) return 'var(--border)'
    if (count === 1) return 'color-mix(in srgb, var(--accent) 30%, transparent)'
    if (count === 2) return 'color-mix(in srgb, var(--accent) 55%, transparent)'
    if (count === 3) return 'color-mix(in srgb, var(--accent) 75%, transparent)'
    return 'var(--accent)'
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ display: 'flex', gap: 3, minWidth: 'max-content' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map(({ date, count }) => (
              <div
                key={date}
                title={`${date}: ${count} puzzle${count !== 1 ? 's' : ''}`}
                style={{ width: 11, height: 11, borderRadius: 2, background: cellColor(count), flexShrink: 0 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master']

function EmptyTechniqueState() {
  return (
    <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
      Complete puzzles to see technique data.
    </p>
  )
}

export default function StatsPage() {
  const { user, loading: authLoading } = useUser()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)

    fetch('/api/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load stats')
        return res.json() as Promise<StatsData>
      })
      .then(data => setStats(data))
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <h1
            className="font-display"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
          >
            Your Stats
          </h1>
          {user && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {user.email}
            </span>
          )}
        </header>

        {/* Unauthenticated */}
        {!authLoading && !user && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4 text-center"
          >
            <Trophy size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <div>
              <p className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)', fontSize: '18px' }}>
                Sign in to track your progress
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px' }}>
                Your stats are saved when you're logged in — streaks, best times, and technique mastery.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Link
                href="/signup"
                className="px-5 py-2.5 rounded-[var(--radius-btn)] text-sm font-semibold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-[var(--radius-btn)] text-sm"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {(authLoading || loading) && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            className="p-4 rounded-[var(--radius-board)] text-sm"
            style={{ background: 'var(--cell-error-bg)', color: 'var(--error)' }}
          >
            {error}
          </div>
        )}

        {/* Stats — zero-state (logged in but no games) */}
        {user && !loading && !error && stats && stats.totalPuzzles === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-3 text-center"
          >
            <Target size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <div>
              <p className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)', fontSize: '18px' }}>
                No puzzles yet
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Complete your first puzzle to start tracking stats.
              </p>
            </div>
            <Link
              href="/play"
              className="mt-2 px-5 py-2.5 rounded-[var(--radius-btn)] text-sm font-semibold"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              Play now
            </Link>
          </motion.div>
        )}

        {/* Stats — populated */}
        {user && !loading && !error && stats && stats.totalPuzzles > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<Target size={16} />} label="Puzzles" value={stats.completedPuzzles} delay={0} />
              <StatCard icon={<TrendingUp size={16} />} label="Win Rate" value={`${stats.winRate}%`} delay={0.04} />
              <StatCard
                icon={<Flame size={16} />}
                label="Streak"
                value={stats.currentStreak}
                sub={`Best: ${stats.longestStreak}`}
                delay={0.08}
              />
              <StatCard
                icon={<Trophy size={16} />}
                label="Best Time"
                value={formatTime(stats.bestTimes.medium)}
                sub="Medium"
                delay={0.12}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Best times per difficulty */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 rounded-[var(--radius-board)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)', fontSize: '15px' }}>
                  <Clock size={14} className="inline mr-2" style={{ color: 'var(--accent)' }} />
                  Best Times
                </h2>
                <div className="flex flex-col gap-2">
                  {DIFFICULTIES.map(d => (
                    <div key={d} className="flex justify-between items-center">
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{d}</span>
                      <span
                        className="font-numeral"
                        style={{
                          fontSize: '14px',
                          color: stats.bestTimes[d] ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatTime(stats.bestTimes[d])}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Technique mastery */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-5 rounded-[var(--radius-board)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)', fontSize: '15px' }}>
                  Technique Mastery
                </h2>
                {stats.techniquesMastered.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {stats.techniquesMastered.map((t, i) => (
                      <TechniqueBar key={t.name} {...t} delay={0.2 + i * 0.08} />
                    ))}
                  </div>
                ) : (
                  <EmptyTechniqueState />
                )}
              </motion.div>
            </div>

            {/* Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-6 p-5 rounded-[var(--radius-board)]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)', fontSize: '15px' }}>
                <Calendar size={14} className="inline mr-2" style={{ color: 'var(--accent)' }} />
                Activity
              </h2>
              <HeatmapCalendar data={stats.calendarData} />
            </motion.div>
          </>
        )}
      </main>
    </div>
  )
}
