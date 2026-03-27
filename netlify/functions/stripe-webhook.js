// netlify/functions/stripe-webhook.js
// Handles Stripe payment confirmation events

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const email = session.customer_email;
    const plan = session.metadata?.plan || 'pro';

    console.log(`✅ Payment success: ${email} — ${plan}`);

    // TODO: Save to a database (Supabase is easiest — see README)
    // Example with Supabase:
    // const { createClient } = require('@supabase/supabase-js')
    // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    // await supabase.from('users').upsert({ email, plan, upgraded_at: new Date() })
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
