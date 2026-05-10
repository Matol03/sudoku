import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SkinId = 'classic' | 'dark' | 'kazakh' | 'japan' | 'royal' | 'beach' | 'aurora'

export interface SkinMeta {
  id: SkinId
  name: string
  tagline: string
  isFree: boolean
  isPro: boolean
  price?: number
  description: string
}

export const SKINS: SkinMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    tagline: 'Crisp newsprint',
    isFree: true,
    isPro: false,
    description: 'Cream paper background, deep ink digits. Letterpress elegance.',
  },
  {
    id: 'dark',
    name: 'Dark',
    tagline: 'Terminal poetry',
    isFree: true,
    isPro: false,
    description: 'OLED-true blacks with phosphor-cyan accents. Built for night sessions.',
  },
  {
    id: 'kazakh',
    name: 'Kazakh',
    tagline: 'Illuminated manuscript',
    isFree: true,
    isPro: false,
    description: 'Deep blue and gold inspired by Kazakh ornamental tradition.',
  },
  {
    id: 'japan',
    name: 'Japan',
    tagline: 'Wabi-sabi studio',
    isFree: true,
    isPro: false,
    description: 'Washi texture, sumi-ink strokes, a single vermillion accent.',
  },
  {
    id: 'royal',
    name: 'Royal',
    tagline: 'Leather-bound cabinet',
    isFree: true,
    isPro: false,
    description: 'Deep burgundy and brushed gold. Like a hand-crafted chess set.',
  },
  {
    id: 'beach',
    name: 'Beach',
    tagline: 'Sun-bleached cove',
    isFree: false,
    isPro: false,
    price: 2.99,
    description: 'Sand textures, coral and turquoise. Wave animation on completion.',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'Boreal observatory',
    isFree: false,
    isPro: true,
    description: 'Iridescent northern-lights accents on a deep navy ground. Pro exclusive.',
  },
]

interface SkinState {
  activeSkin: SkinId
  ownedSkins: SkinId[]
  setSkin: (id: SkinId) => void
  unlockSkin: (id: SkinId) => void
  canUseSkin: (id: SkinId) => boolean
}

export const useSkinStore = create<SkinState>()(
  persist(
    (set, get) => ({
      activeSkin: 'classic',
      ownedSkins: ['classic', 'dark', 'kazakh', 'japan', 'royal'],

      setSkin: (id) => {
        if (!get().canUseSkin(id)) return
        set({ activeSkin: id })
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-skin', id)
        }
      },

      unlockSkin: (id) => set(s => ({
        ownedSkins: s.ownedSkins.includes(id) ? s.ownedSkins : [...s.ownedSkins, id],
      })),

      canUseSkin: (id) => {
        const { ownedSkins } = get()
        return ownedSkins.includes(id)
      },
    }),
    {
      name: 'sudoku-atelier-skin',
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-skin', state.activeSkin)
        }
      },
    }
  )
)
