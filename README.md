# Sudoku Atelier

> "The thinking person's Sudoku."

A premium, market-differentiated Sudoku web application with AI coaching, seven hand-designed skins, and a full Stripe monetization layer.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript strict |
| Styling | Tailwind CSS v4 + CSS variables (per-skin tokens) |
| Animation | Framer Motion (spring physics throughout) |
| State | Zustand (game) + TanStack Query (server) |
| Database & Auth | Supabase (Postgres + RLS + Auth) |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| AI Trainer | Anthropic Claude Sonnet (streamed) |
| Fonts | next/font/google — 9 typefaces, skin-specific |

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd sudoku-atelier
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values — see `.env.example` for comments.

### 3. Supabase

1. Create a project at supabase.com
2. In your Supabase dashboard SQL Editor, paste and run: `lib/supabase/migrations/001_initial.sql`
3. Copy your project URL and anon key into `.env.local`
4. Enable Google OAuth in Supabase Auth → Providers if desired

### 4. Stripe (test mode)

1. Create a Stripe account and stay in test mode
2. Create these Products and Prices in your dashboard:
   - **Pro Monthly**: recurring, $4.99/month → `STRIPE_PRICE_PRO_MONTHLY`
   - **Pro Yearly**: recurring, $39/year → `STRIPE_PRICE_PRO_YEARLY`
   - **Beach Skin**: one-time, $2.99 → `STRIPE_PRICE_BEACH_SKIN`
3. Forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

**Test card numbers:**
| Scenario | Card |
|---|---|
| Success | 4242 4242 4242 4242 |
| Decline | 4000 0000 0000 0002 |
| 3D Secure | 4000 0027 6000 3184 |

Use any future expiry and any 3-digit CVC.

### 5. Anthropic

Get an API key from console.anthropic.com and set `ANTHROPIC_API_KEY`.

### 6. Seed the database

```bash
npx tsx scripts/seed.ts
```

### 7. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## Project structure

```
app/
  (marketing)/page.tsx     Landing page
  play/page.tsx            Game board
  play/daily/page.tsx      Daily puzzle
  stats/page.tsx           Statistics dashboard
  skins/page.tsx           Skin gallery and store
  pricing/page.tsx         Pricing + Stripe links
  login/page.tsx           Auth
  api/
    ai-trainer/route.ts    Streamed Claude responses
    stripe/webhook/route.ts

components/game/           Board, Cell, NumberPad, Timer, HUD, AITrainer, SkinSwitcher
lib/sudoku/                Generator, solver, technique detector, Web Worker
lib/supabase/              Client, server, types, migrations
stores/                    gameStore (Zustand), skinStore (Zustand)
styles/themes.css          All 7 skin token sets
```

---

## Skin system

Each skin is defined as a [data-skin="id"] block in styles/themes.css — ~25 CSS custom properties.
Switching is instant: document.documentElement.setAttribute('data-skin', id).

| Skin | Numerals | UI | Notes |
|---|---|---|---|
| Classic | Fraunces (oldstyle) | Inter | Free |
| Dark | Geist Mono | Geist Sans | Free |
| Kazakh | Cormorant Garamond | Montserrat | Free |
| Japan | DM Serif Display | DM Sans | Free |
| Royal | Playfair Display | EB Garamond | Free |
| Beach | Nunito | Inter | $2.99 one-time |
| Aurora | Instrument Serif | Geist Sans | Pro only |

---

## Sudoku engine

Built from scratch in lib/sudoku/:

- **Generator**: backtracking + Fisher-Yates shuffle + 180deg rotational symmetry + uniqueness check
- **Solver**: MRV (minimum remaining values) backtracking
- **Technique detector**: Naked single/pair/triple, Hidden single/pair, Pointing pair, Box-line reduction, X-Wing
- **Hint system**: Progressive 4-step hints (region → technique → cell → digit), 5/day free
- **Web Worker**: lib/sudoku/worker.ts — generation off main thread

---

## Stripe integration

- `checkout.session.completed`: grants Pro or Beach skin based on Price ID
- `customer.subscription.updated`: syncs subscription status and period end
- `customer.subscription.deleted`: downgrades to free

All stored on `profiles.subscription_status` with Supabase RLS.
