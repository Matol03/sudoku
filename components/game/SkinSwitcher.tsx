'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette } from 'lucide-react'
import { useSkinStore, SKINS, type SkinId } from '@/stores/skinStore'
import { cn } from '@/lib/utils'

const SKIN_DOTS: Record<SkinId, string> = {
  classic: '#1e3a6e',
  dark:    '#2de0c8',
  kazakh:  '#f0b429',
  japan:   '#cc2b1e',
  royal:   '#d4a435',
  beach:   '#2ca89a',
  aurora:  '#3de8a0',
}

type Placement = 'top-left' | 'bottom-right'

interface Props {
  placement?: Placement
  compact?: boolean
}

export function SkinSwitcher({ placement = 'top-left', compact = false }: Props) {
  const [open, setOpen] = useState(false)
  const { activeSkin, setSkin, canUseSkin } = useSkinStore()

  const dropdownPos = placement === 'bottom-right'
    ? 'top-full mt-2 right-0'
    : 'bottom-full mb-2 left-0'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Change skin"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-btn)] text-xs"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          minHeight: 36,
        }}
      >
        <span
          aria-hidden
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: SKIN_DOTS[activeSkin] }}
        />
        <Palette size={12} />
        <span
          className={compact ? 'hidden sm:inline' : ''}
          style={{ textTransform: 'capitalize' }}
        >
          {activeSkin}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: placement === 'bottom-right' ? -4 : 4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: placement === 'bottom-right' ? -4 : 4, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`absolute z-20 p-2 rounded-[var(--radius-board)] ${dropdownPos}`}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                minWidth: 180,
              }}
            >
              {SKINS.map(skin => {
                const isActive = activeSkin === skin.id
                const owned = canUseSkin(skin.id)
                return (
                  <button
                    key={skin.id}
                    onClick={() => { if (owned) { setSkin(skin.id); setOpen(false) } }}
                    disabled={!owned}
                    className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded text-left text-sm transition-colors"
                    style={{
                      background: isActive ? 'var(--accent-muted)' : 'transparent',
                      color: owned ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: owned ? 'pointer' : 'not-allowed',
                      border: 'none',
                    }}
                    aria-pressed={isActive}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: SKIN_DOTS[skin.id] }}
                    />
                    <span>{skin.name}</span>
                    {!owned && <span className="ml-auto text-xs opacity-60">{skin.isPro ? 'Pro' : `$${skin.price}`}</span>}
                    {isActive && <span className="ml-auto" style={{ color: 'var(--accent)', fontSize: '10px' }}>✓</span>}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
