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

    // Determine plan from redirect URL
    let plan = 'pack';
    const successUrl = session.success_url || '';
    if (successUrl.includes('plan=single')) plan = 'single';
    else if (successUrl.includes('plan=lifetime')) plan = 'lifetime';
    else if (successUrl.includes('plan=pack')) plan = 'pack';

    console.log(`Payment: ${email} → ${plan}`);

    if (email) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

      const { data: users } = await supabase
        .from('users')
        .select('id, single_credits')
        .eq('email', email);

      if (users && users.length > 0) {
        const userId = users[0].id;

        if (plan === 'single') {
          // Add 1 credit, don't change plan
          const currentCredits = users[0].single_credits || 0;
          await supabase.from('users').update({
            single_credits: currentCredits + 1
          }).eq('id', userId);
          console.log(`Added 1 credit to ${email}`);
        } else if (plan === 'pack') {
          const expires = new Date();
          expires.setDate(expires.getDate() + 30);
          await supabase.from('users').update({
            plan: 'pack',
            plan_expires_at: expires.toISOString()
          }).eq('id', userId);
        } else if (plan === 'lifetime') {
          await supabase.from('users').update({
            plan: 'lifetime'
          }).eq('id', userId);
        }
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
