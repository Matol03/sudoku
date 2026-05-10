import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type ProductKey = 'pro_monthly' | 'pro_yearly' | 'beach_skin'

const PRICE_MAP: Record<ProductKey, { envKey: string; mode: 'subscription' | 'payment' }> = {
  pro_monthly: { envKey: 'STRIPE_PRICE_PRO_MONTHLY', mode: 'subscription' },
  pro_yearly:  { envKey: 'STRIPE_PRICE_PRO_YEARLY',  mode: 'subscription' },
  beach_skin:  { envKey: 'STRIPE_PRICE_BEACH_SKIN',  mode: 'payment' },
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in to purchase' }, { status: 401 })
  }

  let body: { product: ProductKey }
  try {
    body = await req.json() as { product: ProductKey }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const productConfig = PRICE_MAP[body.product]
  if (!productConfig) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
  }

  const priceId = process.env[productConfig.envKey]
  if (!priceId) {
    return NextResponse.json(
      { error: `${productConfig.envKey} is not configured. Set it in .env.local.` },
      { status: 503 }
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Reuse existing Stripe customer if available
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = (profile as { stripe_customer_id: string | null } | null)?.stripe_customer_id ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabaseUserId: user.id },
    })
    customerId = customer.id
    // Persist customer ID now so we don't create duplicates on retry
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId } as never)
      .eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: productConfig.mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId: user.id },
    ...(productConfig.mode === 'subscription' && {
      subscription_data: { metadata: { userId: user.id } },
    }),
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
