# VRS · go-live checklist

Your site: **https://vrs.taild9f089.ts.net**. This works now: sign-up, 7-day Elite trial, login, the bridge download, the challenge and all pages.

## Today (30 min): open for sign-ups
1. **Restart your bridge:** close `start_bridge.bat` and start it again (it loads the new version).
2. **Keep the PC on:**
   - Settings → System → Power → *sleep when plugged in*: **Never**.
   - **Win + R** → `shell:startup` → New → Shortcut → `backend\deploy\START VRS ONLINE.bat`.
3. **Your settings:** open `backend\saas\data\server.env` in Notepad and fill in:
   - `GP_BROKER_LINKS=vtmarkets=https://…` (your VT Markets partner link)
   - alerts: `GP_CALLMEBOT_KEY=` + `GP_NOTIFY_WHATSAPP=32470051138`, and/or the Gmail ones.
   Save → close the VRS ONLINE window → start it again → **Admin → 🔔 Test alert**.
4. **GitHub:** in your `chart` folder, replace `index.html` with `backend\deploy\github-pages-redirect\index.html`. That's all GitHub is still needed for: old links keep working.
5. **Bio links** (Instagram, TikTok, Discord): `https://vrs.taild9f089.ts.net`
6. **Test as a customer** on your phone with Wi-Fi off: sign up with another email → Setup → download.

## This week: take money (Stripe)
Until this is done, people can use the free trial, and "buy" shows *"Payments are not open yet"*.
1. **Stripe → Product catalog** → make these prices and copy each **price ID** (`price_…`):

   | Setting in server.env | Price |
   |---|---|
   | `STRIPE_PRICE_PRO_MONTHLY` | VIP €29 / month |
   | `STRIPE_PRICE_PRO_YEARLY` | VIP €197 / year |
   | `STRIPE_PRICE_PRO_FOUNDING_MONTHLY` | VIP founding €19 / month |
   | `STRIPE_PRICE_PRO_FOUNDING_YEARLY` | VIP founding €147 / year |
   | `STRIPE_PRICE_ELITE_MONTHLY` | Elite €59 / month |
   | `STRIPE_PRICE_ELITE_YEARLY` | Elite €497 / year |
   | `STRIPE_PRICE_ELITE_LIFETIME` | Elite Lifetime €997 **one-time** |
   | `STRIPE_PRICE_ELITE_LIFETIME3` | Elite Lifetime in 3 × €349 / month |

2. **Stripe → Developers → Webhooks → Add endpoint:**
   - URL `https://vrs.taild9f089.ts.net/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
   - Copy the **signing secret** (`whsec_…`).
3. In `server.env`: `STRIPE_SECRET_KEY=sk_live_…`, `STRIPE_WEBHOOK_SECRET=whsec_…` and the price IDs above. Restart the VRS ONLINE window.
4. Buy VIP once yourself with a real card, then refund it in Stripe. If that worked, everything works.

## Also before you push it hard
- **TradingView:** publish VRS Indicator Pro as an *invite-only* script (description is ready). Add trial users when the alert comes in.
- **VT Markets:** get it in writing which countries the 100% credit offer is allowed in.

## Good to know
- **Your PC = the server.** If it's off, nobody can sign up or log in. Customers' bridges keep trading for 72 hours without it.
- Backups: copy `backend\saas\data` to a USB stick or Google Drive once a week. That folder is all your customers.
