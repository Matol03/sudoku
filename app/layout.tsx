import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import {
  fraunces, cormorantGaramond, playfairDisplay, dmSerifDisplay,
  dmSans, nunito, instrumentSerif, montserrat, ebGaramond, inter,
  GeistSans, GeistMono,
} from '@/lib/fonts'

export const metadata: Metadata = {
  title: {
    template: '%s — Sudoku Atelier',
    default: "Sudoku Atelier — The thinking person's Sudoku",
  },
  description: 'A premium Sudoku experience with AI coaching, beautiful skins, and daily challenges.',
  keywords: ['sudoku', 'puzzle', 'brain training', 'daily puzzle'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0e8' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

const fontClasses = [
  fraunces.variable,
  cormorantGaramond.variable,
  playfairDisplay.variable,
  dmSerifDisplay.variable,
  dmSans.variable,
  nunito.variable,
  instrumentSerif.variable,
  montserrat.variable,
  ebGaramond.variable,
  inter.variable,
  GeistSans.variable,
  GeistMono.variable,
].join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-skin="classic" suppressHydrationWarning>
      <body className={`${fontClasses} min-h-screen flex flex-col`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
