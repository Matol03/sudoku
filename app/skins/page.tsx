'use client'

import { motion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { useSkinStore, SKINS, type SkinId } from '@/stores/skinStore'
import { Lock, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const SKIN_PREVIEWS: Record<SkinId, { bg: string; accent: string; text: string; border: string }> = {
  classic: { bg: '#f5f0e6', accent: '#1e3a6e', text: '#1a1208', border: '#c8baa0' },
  dark:    { bg: '#0a0a0a', accent: '#2de0c8', text: '#c8ede8', border: '#2a2a2a' },
  kazakh:  { bg: '#131c38', accent: '#f0b429', text: '#f0e0b0', border: '#f0b42955' },
  japan:   { bg: '#f2ede4', accent: '#cc2b1e', text: '#141414', border: '#d0d0d0' },
  royal:   { bg: '#160d10', accent: '#d4a435', text: '#e8d8a0', border: '#d4a43555' },
  beach:   { bg: '#ede5d2', accent: '#2ca89a', text: '#1a3540', border: '#c0b090' },
  aurora:  { bg: '#0e1128', accent: '#3de8a0', text: '#d0e8f0', border: '#3030a055' },
}

function MiniBoard({ skinId }: { skinId: SkinId }) {
  const p = SKIN_PREVIEWS[skinId]
  const cells = [4,0,0, 0,2,6, 0,0,0,
                 0,0,0, 5,0,0, 3,0,0,
                 0,1,8, 0,0,0, 0,9,0]
  return (
    <div
      className="w-full aspect-square rounded-sm overflow-hidden"
      style={{ background: p.bg, border: `1.5px solid ${p.border}`, padding: 4 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, width: '100%', height: '100%' }}>
        {[0,1,2].map(box => (
          <div key={box} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, border: `1px solid ${p.accent}44` }}>
            {Array.from({ length: 9 }, (_, i) => {
              const globalIdx = Math.floor(box / 3) * 27 + (i % 3) + Math.floor(i / 3) * 3 + (box % 3) * 3
              const val = cells[globalIdx % 27]
              return (
                <div
                  key={i}
                  className="flex items-center justify-center"
                  style={{
                    background: val ? `${p.accent}18` : 'transparent',
                    fontSize: '6px',
                    color: val ? p.accent : 'transparent',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {val || ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SkinsPage() {
  const { activeSkin, ownedSkins, setSkin, canUseSkin } = useSkinStore()

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <header className="mb-10">
          <h1
            className="font-display mb-2"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
          >
            Skins
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '480px' }}>
            Each skin is a complete visual identity — different typography, borders, and animations.
            Switch instantly. Your choice persists across sessions.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SKINS.map((skin, i) => {
            const isActive = activeSkin === skin.id
            const isOwned = canUseSkin(skin.id)

            return (
              <motion.button
                key={skin.id}
                onClick={() => isOwned && setSkin(skin.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 28 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group relative flex flex-col gap-3 p-3 text-left rounded-[var(--radius-board)] cursor-pointer"
                style={{
                  background: isActive ? 'var(--accent-muted)' : 'var(--surface)',
                  border: `${isActive ? 2 : 1}px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  opacity: !isOwned && !skin.isPro ? 0.85 : 1,
                }}
                aria-pressed={isActive}
                aria-label={`${skin.name} skin${!isOwned ? ' (locked)' : ''}`}
              >
                <MiniBoard skinId={skin.id} />

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display font-semibold"
                      style={{ fontSize: '14px', color: 'var(--text-primary)' }}
                    >
                      {skin.name}
                    </span>
                    <StatusBadge skin={skin} isActive={isActive} isOwned={isOwned} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {skin.tagline}
                  </span>
                </div>

                {!isOwned && (
                  <div
                    className="absolute inset-0 rounded-[inherit] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'var(--bg)', opacity: 0 }}
                  >
                    <PurchaseCTA skin={skin} />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="mt-12 p-6 rounded-[var(--radius-board)]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-start gap-4">
            <Sparkles size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h2 className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Pro includes everything
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '520px' }}>
                Upgrade to Pro and instantly unlock Beach, Aurora, and all future skins — plus unlimited hints and AI coaching.
                $4.99/month or $39/year.
              </p>
              <a
                href="/pricing"
                className="inline-block mt-3 px-4 py-2 text-sm font-medium rounded-[var(--radius-btn)]"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                View Pro plans
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ skin, isActive, isOwned }: { skin: typeof SKINS[0]; isActive: boolean; isOwned: boolean }) {
  if (isActive) return <Check size={14} style={{ color: 'var(--accent)' }} />
  if (!isOwned && skin.isPro) return <Sparkles size={12} style={{ color: 'var(--warning)' }} />
  if (!isOwned && skin.price) return <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>${skin.price}</span>
  return null
}

function PurchaseCTA({ skin }: { skin: typeof SKINS[0] }) {
  return (
    <a
      href="/pricing"
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full"
      style={{ background: 'var(--accent)', color: 'white' }}
      onClick={e => e.stopPropagation()}
    >
      <Lock size={12} />
      {skin.isPro ? 'Pro' : `$${skin.price}`}
    </a>
  )
}
