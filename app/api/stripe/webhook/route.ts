import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder')
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = await createServiceSupabaseClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const userId = session.metadata?.userId

      if (!userId) break

      if (session.mode === 'subscription') {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'pro',
            stripe_customer_id: customerId,
            owned_skins: ['classic', 'dark', 'kazakh', 'japan', 'royal', 'beach', 'aurora'],
          } as never)
          .eq('id', userId)
      } else if (session.mode === 'payment') {
        const priceId = session.line_items?.data[0]?.price?.id
        if (priceId === process.env.STRIPE_PRICE_BEACH_SKIN) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('owned_skins')
            .eq('id', userId)
            .single()
          const existing = (profile as { owned_skins: string[] } | null)?.owned_skins ?? []
          if (!existing.includes('beach')) {
            await supabase
              .from('profiles')
              .update({ owned_skins: [...existing, 'beach'], stripe_customer_id: customerId } as never)
              .eq('id', userId)
          }
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription & { current_period_end?: number }
      const customerId = sub.customer as string
      const isActive = sub.status === 'active' || sub.status === 'trialing'
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null

      await supabase
        .from('profiles')
        .update({
          subscription_status: isActive ? 'pro' : 'free',
          subscription_period_end: periodEnd,
        } as never)
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      await supabase
        .from('profiles')
        .update({ subscription_status: 'free', subscription_period_end: null } as never)
        .eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
