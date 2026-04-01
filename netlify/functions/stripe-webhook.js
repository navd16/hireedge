const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const email = session.customer_email || session.customer_details?.email;
    const plan = session.metadata?.plan || 'pack';

    if (email) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

      // Find user by email
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('email', email);

      if (users && users.length > 0) {
        const userId = users[0].id;
        const updateData = { plan };

        // Set expiry for 30-day pack
        if (plan === 'pack') {
          const expires = new Date();
          expires.setDate(expires.getDate() + 30);
          updateData.plan_expires_at = expires.toISOString();
        }

        await supabase.from('users').update(updateData).eq('id', userId);
        console.log(`✅ Updated plan for ${email} → ${plan}`);
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
