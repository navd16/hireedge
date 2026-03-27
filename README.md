# HireEdge AI — Setup Guide (Netlify + Stripe)

## Project Structure
```
hireedge/
├── public/
│   └── index.html              ← Your website (edit CONFIG block here)
├── netlify/
│   └── functions/
│       ├── generate.js         ← Secure Anthropic API proxy
│       └── stripe-webhook.js   ← Stripe payment handler
├── netlify.toml                ← Netlify config
├── package.json
└── README.md
```

---

## Step 1 — Get your Anthropic API Key (5 min)

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** in the left sidebar → **Create Key**
4. Name it "hireedge" → copy the key (starts with `sk-ant-...`)
5. Save it somewhere safe — you'll need it in Step 4

---

## Step 2 — Set up Stripe (20 min)

### 2a. Create your Stripe account
1. Go to https://stripe.com → click **Start now**
2. Fill in your details and verify your email
3. Complete business profile (you can use "Sole proprietor" / individual)

### 2b. Create your products
1. In Stripe dashboard → **Product catalog** → **Add product**

   **Product 1: HireEdge Pro**
   - Name: `HireEdge Pro`
   - Price: `$12.00` → Recurring → Monthly
   - Click **Save product**

   **Product 2: HireEdge Lifetime**
   - Name: `HireEdge Lifetime`
   - Price: `$79.00` → One time
   - Click **Save product**

### 2c. Create Payment Links
1. **Payment Links** (left sidebar) → **Create payment link**
2. Select "HireEdge Pro" → Create link
3. Under **After payment** → set redirect URL to:
   `https://YOUR-NETLIFY-SITE.netlify.app?success=true`
4. Copy the link URL (e.g. `https://buy.stripe.com/abc123`)
5. Repeat for "HireEdge Lifetime"

### 2d. Get your API keys
1. **Developers** → **API keys**
2. Copy the **Secret key** (starts with `sk_test_...` for test mode)
3. When ready to go live, use `sk_live_...`

---

## Step 3 — Update index.html CONFIG (2 min)

Open `public/index.html` and find this block near the bottom:

```js
const CONFIG = {
  STRIPE_PRO_LINK: 'https://buy.stripe.com/YOUR_PRO_LINK',
  STRIPE_LIFETIME_LINK: 'https://buy.stripe.com/YOUR_LIFETIME_LINK',
  ...
  AFFILIATE_LINKS: {
    'Teal': 'https://www.tealhq.com?ref=hireedge',   // ← replace with YOUR affiliate URLs
    ...
  }
}
```

Paste your Stripe payment link URLs there.

### Affiliate programs to sign up for (free money):
| Tool | Sign up at | Commission |
|---|---|---|
| Teal | tealhq.com/affiliate | ~20% |
| Rezi | rezi.ai/affiliates | 30% recurring |
| Final Round AI | finalroundai.com/affiliate | 20–30% |
| Taplio | taplio.com/affiliates | 30% recurring |
| Lavender | lavender.ai/partners | 20% recurring |
| JobScan | jobscan.co/affiliates | 25% |

---

## Step 4 — Deploy to Netlify (10 min)

### Option A: Drag & Drop (easiest, no coding)
1. Go to https://netlify.com → sign up free
2. From dashboard: **Add new site** → **Deploy manually**
3. Zip your entire `hireedge` folder and drag it onto the deploy zone
4. Your site is live instantly at a `.netlify.app` URL

### Option B: GitHub (recommended for updates)
1. Push your project to a GitHub repo
2. Netlify → **Add new site** → **Import from Git** → select your repo
3. Build settings: leave blank (static site)
4. Click **Deploy site**

---

## Step 5 — Add Environment Variables in Netlify (5 min)

1. Netlify dashboard → your site → **Site configuration** → **Environment variables**
2. Add these variables:

| Key | Value |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (from Step 1) |
| `STRIPE_SECRET_KEY` | `sk_test_...` (from Step 2d) |
| `STRIPE_WEBHOOK_SECRET` | See Step 6 below |
| `ALLOWED_ORIGIN` | `https://your-site.netlify.app` |

3. Click **Save** → then **Trigger deploy** → **Deploy site**

---

## Step 6 — Set up Stripe Webhook (5 min)

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-site.netlify.app/api/stripe-webhook`
3. Events to listen to: select `checkout.session.completed`
4. Click **Add endpoint**
5. Click the webhook → **Signing secret** → **Reveal** → copy it
6. Add to Netlify env vars as `STRIPE_WEBHOOK_SECRET`
7. Redeploy

---

## Step 7 — Test End-to-End

1. Use Stripe test card: `4242 4242 4242 4242` / any future date / any CVC
2. Click "Start Pro →" on your site → complete checkout
3. You should be redirected back with `?success=true` → Pro unlocks
4. Check Netlify function logs to confirm webhook fired

---

## Step 8 — Go Live Checklist

- [ ] Anthropic API key added to Netlify env vars
- [ ] Stripe payment links pasted into index.html CONFIG
- [ ] Affiliate links updated in CONFIG
- [ ] Stripe webhook endpoint created and secret added
- [ ] Tested with Stripe test card
- [ ] Switch Stripe from **Test mode** to **Live mode** (toggle top-left)
- [ ] Update Stripe keys in Netlify env vars to `sk_live_...`
- [ ] Custom domain (optional): Netlify → Domain management → Add domain

---

## Revenue Projections

| Scenario | Monthly Revenue |
|---|---|
| 50 Pro subscribers | $600/mo |
| 200 Pro subscribers | $2,400/mo |
| 10 Lifetime sales/mo | +$790/mo |
| Affiliate commissions | +$200–800/mo |
| **200 Pro + affiliates** | **~$3,200/mo** |

---

## Getting Traffic (Quick wins)

1. **Reddit** — Post in r/resumes, r/jobs, r/cscareerquestions with a helpful post
2. **Product Hunt** — Launch for free, can drive thousands of visitors
3. **TikTok/Reels** — "I built an AI that writes your resume" gets huge reach
4. **SEO** — Target "AI resume writer free", "cover letter generator AI"

---

## Need help?
- Netlify docs: https://docs.netlify.com
- Stripe docs: https://stripe.com/docs
- Anthropic docs: https://docs.anthropic.com
