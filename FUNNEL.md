# VRS: the funnel (Free + VIP)

Updated 2026-11-13: two levels only. The old 3-step ladder (Lite → €14 Indicator Pro → Executor), Lifetime, Starter, Elite,
add-ons and the value stack are gone from the website. Their server code stays (hidden plans) so old customers and the selftest keep working.

## 1. The brand in one line
**TradingView shows you the trade. VRS takes it for you, safely.**
- Colours: navy + gold (on every page).
- Names (one job each):
  - **VRS Indicator Lite**: the free TradingView indicator. **Zones only**: ranges, VA1 / VA2 breaks, the zone, and an alert when a new zone appears.
    No entry, stop, take profit, R levels, BUY/SELL tags, grades, backtest card or retest alerts: that code is removed from Lite by `tradingview/build-lite.cjs`.
  - **The VRS Playbook**: the free 16-page PDF that comes with Lite (teaches the full method by hand).
  - **VRS VIP**: the one paid level (plan key `pro`). Contains:
    - **VRS Indicator Pro**: the invite-only TradingView script. Shows *the trade*: entry, stop, 1R / 2R / 3R, A / B / C grades, backtest card, filters, exit plans, retest + bot alerts.
    - **VRS Executor**: the MT5 software. *Takes them* (TradingView → MT5 autotrade, risk manager, bot, journal, Backtest Lab).
    - **The VIP Discord**.

## 2. The two levels
| Level | What | How you get it |
|---|---|---|
| **Free** | VRS Indicator Lite (zones only) + the Playbook + the public Discord | your email |
| **VIP** | VRS Indicator Pro (the trade: entry, stop, R levels, grades) + VRS Executor + the VIP Discord | **Way 1 (coming soon):** a new account with a partner broker (Vantage, VT Markets, RaiseFX) through our link → free. Until `GP_BROKER_LINKS` holds real links, every page shows this way as "coming soon" (no form, no button). **Way 2:** €29/month (founding €19 while seats last), any broker or prop account, 7 days free first. |

Why two ways: broker partners pay us per client, so the active retail trader gets VIP for free; people at another broker or on a
prop account (no broker income for us) pay. Same product either way.

```
Content / ads / TradingView (public Lite script) / Discord / referrals
        │
        ▼
Landing page (index.html)   5 sections: hero (free lead) · how it works · two ways into VIP · proof · FAQ
        │ email              exit popup: same free offer
        ▼
indicator.html              Lite code + 4 steps · Playbook · free Discord · "See the two ways into VIP"
        │
        ▼
emails (below)              each closes one gap: which · how big · who takes them → VIP
        │
        ├──▶ Way 1: broker link → account opened → sign up → dashboard "VIP free through a partner broker" (broker + MT5 login)
        │           → Admin → 🤝 Broker VIP → check in the broker's partner portal → Approve (VIP, interval "broker", no end date)
        │
        └──▶ Way 2: sign up → 7-day VIP trial → pay €29 (or €19 founding)
```

### Running the broker way (by hand for now)
1. Put your partner links in `GP_BROKER_LINKS` on the server (`vantage=https://…,vtmarkets=https://…,raisefx=https://…`). A broker without a real `https://` link shows "coming soon"; with no real link at all, the whole partner-broker way shows "coming soon". Also remove "· coming soon" next to "Free" in `indicator.html` and the "Coming soon" sentence on Playbook page 14 (`ebook/vrs-playbook.html`, then rebuild the PDF).
2. Customers send broker + MT5 account number in their dashboard (`POST /api/me/broker`, status `pending`).
3. **Admin → 🤝 Broker VIP**: look the account up in that broker's partner (IB) portal. Under you and funded? **Approve**. Not found? **Reject** (they see "not found · check the number").
4. Once a month, check the approved list against the portal. Someone left or closed the account → **Reject** (their VIP ends).
5. Later: the bridge already knows the MT5 login + server of every customer, so this check can be automated against an export from the partner portal.

**Legal first:** get it in writing which broker entity your clients are signed up with, and check with a lawyer that promoting these
brokers to your visitors' countries (and earning per client) is allowed. Every page that shows the brokers says
"we may earn a commission from partner brokers"; keep that line.

### The Discord
- `GP_DISCORD_PUBLIC`: shown on the landing page, indicator.html, the thank-you popup and the dashboard of non-VIP users.
- `GP_DISCORD_VIP`: only shown in the dashboard / welcome page of active VIP members (trial included). Give the VIP role by hand
  (or with a bot later) and remove it when someone's VIP ends (Admin → Customers, filter "Ended / expired").

### The bridge feature (why anyone bothers with MT5)
VRS Indicator Pro JSON alert → `POST /api/tv/alert/<secret>` on the customer's bridge → checks minimum grade, trades today and daily loss →
lot from risk % → limit order at the zone (or market on the retest) → partial at 1R + stop to break-even once filled.
Off by default, paper first, every alert logged. Set up in the terminal: tab **TV autotrade**.

## 3. Delivering VRS Indicator Pro (invite-only, by hand)
1. A VIP member (trial, paid or broker) types their TradingView username in the dashboard.
2. **Admin → 📈 TradingView invites**: rows marked **add access** → on TradingView open VRS Indicator Pro → *Manage access* → add the username → **Mark added**.
3. Rows marked **remove access** (VIP ended): remove them on TradingView → **Mark removed**. Check it once a day.

## 4. The email sequence for Lite leads
Leads are saved by the license server (`/api/leads`, source `tv-c` or `tv-exit-c`), but **no email is sent yet**. Put these in MailerLite, Brevo or ConvertKit as an automation.
Every link: your site + `#vip` / `#how` / `#signup`, with `?utm_source=email&utm_campaign=vip&utm_content=e1` etc.
(Old links `#pricing`, `#offer`, `#ladder`, `#autotrade` still work: they scroll to the new sections.)

**E1 · instantly · "VRS Indicator Lite is ready (2-minute install)"**
Your code again: [link to indicator.html]. Copy, Pine Editor, paste, Add to chart, set the alert: you get a ping on every new zone.
Your **VRS Playbook**: [link to …/ebook/VRS-Playbook.pdf]. Read chapters 2–4 first (range, break, zone): 10 minutes.
The free Discord: [GP_DISCORD_PUBLIC]. Tip: start on M15 or H1 gold, not M1.

**E2 · day 1 · "A zone is not a trade"**
Lite shows the zone. It doesn't tell you when to enter, where the stop goes or how to manage it. That's where most traders lose:
early entries, stops inside the range, no plan at 1R. VRS Indicator Pro (VIP) draws the trade on top of the zone: entry, stop, 1R / 2R / 3R, and alerts you when it's on.
(Playbook chapters 4–6 show how to do it by hand.)

**E3 · day 2 · "A, B or C?"**
Not every zone is worth trading. VRS Indicator Pro grades each setup and puts a backtest card on your chart: how A, B and C did, in R. Most people stop trading C the same day.

**E4 · day 3 · "Accounts don't die on bad setups"**
They die on one oversized lot and the revenge trade after it. The lot table for $10k at 0.5% risk. VRS Executor does this math on every order and locks the day at your limit.

**E5 · day 5 · "The zone got retested at 03:12"**
You were asleep. TradingView saw it and sent the alert; VRS Executor placed it on MT5, sized from your risk, took half at 1R and moved the stop to break-even.
Off by default, paper first, your limits. → [#how]

**E6 · day 6 · "VIP: free, or €29" (the offer)**
What's in VIP (Indicator Pro, Executor, the VIP Discord): €29/month with any broker or prop account, 7 days free.
Once partner links are live: or free with a new account at a partner broker (disclose the commission). Until then: "coming soon".
Founding members pay €19/month for life: **{F.left} of 100 seats left**. → [#vip]

**E7 · day 8 · "Last call on the founding price"**
Short. Seats left, closing date, "after that paid VIP is €29". P.S. VIP stays free through a partner broker. → [#vip]

Then every week: one VRS Indicator setup breakdown (past tense, education, no live calls), with a P.S. to VIP.

### Trial users (Way 2)
- **Day 0:** "Type your TradingView username" (for VRS Indicator Pro) + "Join the VIP Discord".
- **Day 1:** "Send your first test alert to a paper account" (TV autotrade tab → Test on paper).
- **Day 3:** "Switch autotrade on for A setups only, on paper".
- **Day 5:** "2 days left: keep VIP (€19 founding) or get it free through a partner broker".
- **Day 7:** "Your trial ends today".

### Broker users (Way 1)
- **Request sent:** "We're checking your account, usually within 24 hours. Meanwhile: TradingView username + install VRS Executor."
- **Approved:** "VIP is on" + VIP Discord link + setup steps.
- **Rejected:** "We couldn't find the account under our link" + how to check the number, or start the paid trial.

## 5. What to measure (one sheet, weekly)
Every button sends a `data-cta` event through `track()` in `index.html`.

| Step | Event / place | Target to beat |
|---|---|---|
| Visit → Lite lead | `lead` (source `tv*`) | 20–35 % |
| Lead → VIP (trial or broker request) within 14 days | sign-ups + `broker_request` | 8–15 % |
| Broker requests → approved | Admin → Broker VIP | > 70 % |
| Trial → paid | billing | 25–40 % |
| Trial → first test alert | TV autotrade events | > 60 % |
| VIP → still active at month 3 | churn (paid) / approved list still at the broker | > 70 % |
| Leads per € of ads | ads manager | cost per lead < €2 |

## 6. Pages
- `index.html`: the only landing page (5 sections) + sign-up, dashboard, setup, billing, the challenge and admin.
- `indicator.html`: the thank-you page.
- Prices live in `saas/license_server.py` (`PLANS`, `FOUNDING`) and, for when the server is down, `OFFLINE_PLANS` in `index.html`. Change both.
- Broker links and Discord links: `GP_BROKER_LINKS`, `GP_DISCORD_PUBLIC`, `GP_DISCORD_VIP` in the server environment (`saas/.env.example`).
