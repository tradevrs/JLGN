# Goldmine: the GoldZone funnel

Built on Alex Hormozi's *$100M Leads*, *$100M Offers* and *$100M Money Models*. Updated 2026-11-12 for the 3-step ladder.

## 1. The brand in one line
**TradingView shows you the trade. Goldmine takes it for you, safely.**
- Colours: navy + gold (on every page).
- Names (one job each):
  - **GoldZone Lite**: the free TradingView indicator. Shows you *where*.
  - **The GoldZone Playbook**: the free 16-page PDF that comes with Lite. Teaches you to read and trade it.
  - **GoldZone Pro**: the paid, invite-only TradingView script. Tells you *which* (grades, backtest card, filters, exit plans, bot alerts) + the Backtest Lab.
  - **Goldmine Pro**: the MT5 software. *Takes them* (TradingView → MT5 autotrade, risk manager, bot, journal). Includes GoldZone Pro.
  - **The Gold Edge System**: the name of the full Goldmine Pro offer on the landing page.

## 2. Why the old funnel leaked
The free indicator did almost everything the paid product promised (grades, backtest card, filters, exits, webhooks), and the paid
product lived on MT5 while the audience lives on TradingView. Nobody had a reason to set up a bridge. Now:
- the free step only *shows* setups (Lite), so it creates the next question instead of answering it;
- each paid step answers exactly one more question;
- the bridge has a reason to exist: it is the thing that turns a TradingView alert into a safe, sized MT5 order.

## 3. The ladder (money model)
| Step | What | Price | Job |
|---|---|---|---|
| Attraction | GoldZone Lite + the Playbook | free, for an email | see the setups |
| Core (low-ticket) | GoldZone Pro | €14/mo · €119/yr | choose the good ones |
| Upsell (main) | Goldmine Pro (incl. GoldZone Pro) | €29/mo (founding €19) · €197/yr | take them, sized and managed |
| Anchor | Goldmine Pro Lifetime | €497 (or 3 × €179) | pay once |
| Downsell | GoldZone Pro, or Lifetime in 3 payments | | when someone says no to Goldmine Pro |
| Continuity | monthly · Discord + weekly review · monthly challenge | | keeps them, brings referrals |
| Add-ons | VPS set-up €49 · strategy review €99 | | after the purchase |

```
Content / ads / TradingView (public GoldZone Lite script) / referrals
        │
        ▼
Landing page (index.html)  →  hero: "Every gold setup, marked on your chart. Free." + the Playbook
        │ email                 exit popup: same offer
        ▼
goldzone.html               →  1. Lite code + 4 steps  2. Playbook  3. "Try it all free for 7 days" · or GoldZone Pro €14
        │
        ▼
7 emails (below)            →  each closes one gap: which · how big · who takes them
        │
        ├──▶ GoldZone Pro (TradingView only)  ──upsell in dashboard──▶  Goldmine Pro
        │
        ▼
Goldmine Pro 7-day trial    →  setup call ("we set it up with you, or it's free") → test alert on paper → autotrade on
```

### The bridge feature (why anyone bothers with MT5)
GoldZone Pro JSON alert → `POST /api/tv/alert/<secret>` on the customer's bridge → checks minimum grade, trades today and daily loss →
lot from risk % → limit order at the zone (or market on the retest) → partial at 1R + stop to break-even once filled.
Off by default, paper first, every alert logged. Set up in the terminal: tab **TV autotrade**.

Friction killers: the setup call guarantee ("working at the end of the call, or your first month is free"), the **Test on paper** button,
a VPS guide, and the €49 done-for-you VPS add-on.

## 4. Delivering GoldZone Pro (invite-only, by hand)
1. A customer buys GoldZone Pro (or Goldmine Pro, or starts the trial) and types their TradingView username in the dashboard.
2. You open **Admin → 📈 TradingView invites**. Rows marked **add access**: on TradingView open GoldZone Pro → *Manage access* → add the username → press **Mark added**.
3. Rows marked **remove access** (plan ended): remove them on TradingView → **Mark removed**. Check it once a day.

## 5. The email sequence for GoldZone leads
Leads are saved by the license server (`/api/leads`, source `tv-c` or `tv-exit-c`), but **no email is sent yet**. Put these in MailerLite, Brevo or ConvertKit as an automation.
Every link: `https://musicwithgomez.github.io/chart/` + `#signup` / `#pricing` / `#autotrade`, with `?utm_source=email&utm_campaign=goldzone&utm_content=e1` etc.

**E1 · instantly · "GoldZone Lite is ready (2-minute install)"**
Your code again: [link to goldzone.html]. Copy, Pine Editor, paste, Add to chart, set the alert.
Your **GoldZone Playbook**: [link to …/ebook/GoldZone-Playbook.pdf]. Read chapters 2–4 first (range, break, zone): 10 minutes.
Tip: start on M15 or H1 gold, not M1.

**E2 · day 1 · "The 3 things Lite can't tell you"**
Lite shows *where*. It can't tell you: 1) which of those setups are worth it, 2) how big to trade, 3) who takes them while you're at work.
Today, number 1. (Playbook chapter 09 shows how to test by hand.)

**E3 · day 2 · "A, B or C?"**
Not every break is equal. GoldZone Pro grades each setup and puts a backtest card on your chart: how A, B and C did, in R. Most people stop trading C the same day.
→ GoldZone Pro, €14/month (or free inside the Goldmine Pro trial).

**E4 · day 3 · "Accounts don't die on bad setups"**
They die on one oversized lot and the revenge trade after it. The lot table for $10k at 0.5% risk. Goldmine does this math on every order and locks the day at your limit.

**E5 · day 5 · "The zone got retested at 03:12"**
You were asleep. TradingView saw it and sent the alert; Goldmine placed it on MT5, sized from your risk, took half at 1R and moved the stop to break-even.
Off by default, paper first, your limits. "We set it up with you, or your first month is free." → [#autotrade]

**E6 · day 6 · "What you get for €19" (the offer)**
The stack with values: GoldZone Pro, autotrade, the terminal, the Lab, the bot, the setup call, the Rulebook, the Discord, the 30-day guarantee.
**{F.left} of 100 founding seats left.**

**E7 · day 8 · "Last call on the founding price"**
Short. Seats left, closing date, "after that it's €29". P.S. Only want the TradingView part? GoldZone Pro, €14.

Then every week: one GoldZone setup breakdown, with a P.S. to the trial.

### Trial users
- **Day 0:** "Book your setup call" + "Type your TradingView username" (for GoldZone Pro).
- **Day 1:** "Send your first test alert to a paper account" (TV autotrade tab → Test on paper).
- **Day 3:** "Switch autotrade on for A setups only, on paper".
- **Day 5:** "2 days left: lock in €19 for life".
- **Day 7:** "Your trial ends today".
- **Exit / cancel:** offer GoldZone Pro (€14) or Lifetime in 3 payments.

### GoldZone Pro customers (the upsell)
- **Week 1:** "Your A setups this week" + how autotrade would have taken them.
- **Week 2:** "Let the trades take themselves": Goldmine Pro, 7 days free. The dashboard shows the same upsell.

## 6. What to measure (one sheet, weekly)
Every button sends a `data-cta` event through `track()` in `index.html`.

| Step | Event / place | Target to beat |
|---|---|---|
| Visit → Lite lead | `lead` (source `tv*`) | 20–35 % |
| Lead → trial or GoldZone Pro | sign-ups / purchases with a lead email | 8–15 % within 14 days |
| GoldZone Pro → Goldmine Pro | plan changes | 15 % within 60 days |
| Trial → paid | billing | 25–40 % |
| Trial → first test alert | TV autotrade events | > 60 % |
| Paid → month 3 | churn | > 70 % still paying |
| Leads per € of ads | ads manager | cost per lead < €2 |

## 7. Pages
- `index.html`: the only landing page (the old versions A and B were removed; `?lp=` no longer does anything).
- `goldzone.html`: the thank-you page.
- Prices live in `saas/license_server.py` (`PLANS`, `FOUNDING`) and, for when the server is down, `OFFLINE_PLANS` in `index.html`. Change both.
