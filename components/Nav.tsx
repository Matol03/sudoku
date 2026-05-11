'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

function AtelierLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="5" fill="var(--accent)" />
      {/* 3×3 grid */}
      <line x1="9.33" y1="5" x2="9.33" y2="23" stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="18.67" y1="5" x2="18.67" y2="23" stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="5" y1="9.33" x2="23" y2="9.33" stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="5" y1="18.67" x2="23" y2="18.67" stroke="white" strokeWidth="1" opacity="0.4"/>
      {/* Maker mark in center cell */}
      <circle cx="14" cy="14" r="2.2" fill="white" opacity="0.9" />
      <circle cx="14" cy="14" r="1.1" fill="var(--accent)" />
    </svg>
  )
}

const NAV_LINKS = [
  { href: '/play', label: 'Play' },
  { href: '/play/daily', label: 'Daily' },
  { href: '/construct', label: 'Create' },
  { href: '/stats', label: 'Stats' },
  { href: '/skins', label: 'Skins' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 h-14"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      <Link href="/" className="flex items-center gap-2 outline-none">
        <AtelierLogo />
        <span
          className="font-display hidden sm:block"
          style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
        >
          Sudoku Master
        </span>
      </Link>

      {/* Desktop nav links — hidden on mobile to prevent overflow */}
      <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="relative px-3 py-1.5 text-sm rounded-md outline-none transition-colors"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-md"
                  style={{ background: 'var(--accent-muted)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile compact nav — horizontally scrollable, icon-y links */}
      <nav className="flex md:hidden items-center gap-0.5 overflow-x-auto -mx-2 px-2 scrollbar-hide" aria-label="Main navigation">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="relative px-2.5 py-1.5 text-xs rounded-md whitespace-nowrap flex-shrink-0"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'var(--accent-muted)' : 'transparent',
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link
          href="/pricing"
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm rounded-[var(--radius-btn)] font-medium relative overflow-hidden group"
          style={{
            background: 'var(--accent)',
            color: 'white',
            boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)',
          }}
        >
          <span className="relative z-10">Pro</span>
          <motion.span
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          />
        </Link>
        <Link
          href="/login"
          className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-[var(--radius-btn)] transition-colors hover:bg-[var(--surface-elevated)] whitespace-nowrap"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          Sign in
        </Link>
      </div>
    </header>
  )
}
