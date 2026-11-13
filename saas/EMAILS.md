# Follow-up emails for Risk Rulebook leads

**Where the emails come from:** Admin → download the leads CSV (`/api/admin/leads?token=YOUR_ADMIN_TOKEN`). Import it into MailerLite or Brevo, both free up to 1,000 contacts.

**How to send them:** set up an automation that sends one email per day, starting the day after sign-up. Stop it as soon as the person becomes a customer (the CSV has an `is_customer` column).

**Placeholders:** replace `{{site}}` with your website link, and `{{first_name}}` if your email tool has it.

---

## Day 0: Your Risk Rulebook
**Subject:** Your Risk Rulebook (keep this next to your screen)

Hi,

Your Risk Rulebook is here: {{site}}/rulebook.html

It's built from the numbers you entered: your lot for every stop size, your daily stop, your layer plan, and a 10-second checklist for every trade.

Print it. Seriously. A rule you can see is a rule you follow.

Tomorrow: the one mistake that costs MT5 traders more than bad setups.

## Day 1: The click that costs more than the setup
**Subject:** It wasn't the setup

Most blown days don't start with a bad idea. They start with a click:
- 0.50 typed instead of 0.05
- eight positions closed one by one while price runs
- "one more trade" at −4%

None of those is a strategy problem. They're execution problems. Execution problems can be fixed with tools, not willpower.

Look at rule 4 in your Rulebook: your fat-finger ceiling. Know that number by heart.

## Day 2: See it working (2 minutes, no sign-up)
**Subject:** Close 9 positions in one click (try it)

Open the live demo. It has simulated prices, so nothing is real and nothing is at risk:
{{site}}/terminal.html?demo=1

Try three things:
1. **Layers:** five limit orders, lots sized so the total risk is exactly 1%.
2. **Close & keep:** close everything except your best entry, and keep a small runner.
3. **Partial take profit:** click the chart to place it. It fills even with the page closed.

## Day 3: The day it saves you
**Subject:** The worst day of your month

Everyone has one. The morning goes wrong, and by lunch you're trading to "get it back".

VRS's daily loss limit locks new trades at your number. It stops new trades only: you can still close what's open. Tomorrow you start fresh, with an account that still exists.

That one feature usually pays for a year of the software in a single bad day.

## Day 4: VRS VIP, two ways in
**Subject:** Your rules, enforced on every order

Here's VRS VIP:
- VRS Indicator Pro on TradingView: A / B / C grades and a backtest card on your chart
- VRS Executor next to your MT5: lots from your risk, the daily loss lock, layers, close & keep, TradingView → MT5 autotrade
- the VIP Discord

**Two ways in:**
1. **Free:** open a new account with one of our partner brokers through our link, then type your MT5 account number in your dashboard. We switch VIP on, usually within 24 hours. (We may earn a commission from the broker. Check their conditions and regulation first.)
2. **€29/month:** any broker or prop account, 7 days free first. Founding members pay €19/month for as long as they stay (first 100).

→ {{site}}#vip

## Day 6: Last call
**Subject:** Founding price closes soon

Short one. The founding price for paid VIP (€19/month for life) closes on {{founding_end}}, or earlier if the seats run out. After that it's €29/month.

Or get VIP free through a partner broker: {{site}}#vip

If it's not for you, no problem. Keep the Rulebook, it's yours.
---

**Legal reminder for every email**
- No profit promises.
- No screenshots of P/L presented as results.
- An unsubscribe link (your email tool adds it).
- Your company name and address in the footer.
