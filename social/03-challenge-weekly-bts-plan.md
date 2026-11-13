# The weekly challenge and behind the scenes: the plan

## 1. What's ready to post

| Folder | What | Where |
|---|---|---|
| `ig-03-challenge/` | 5-slide carousel + `caption.txt` (weekly challenge) | Instagram feed, TikTok photo post |
| `ig-03-challenge-stories/` | 3 stories (9:16): "It's on", "Leaderboard · Thursday", "This week's winner" | Stories. Slides 2 and 3 are templates: change the nicknames in `ig-03-challenge-stories.html`, render again |
| `ig-04-behind-the-scenes/` | 5-slide carousel + `caption.txt` | Instagram feed, TikTok photo post, LinkedIn |

Re-render after an edit: `cd promo_video` → `node social-render.cjs <name> --png`

## 2. How the challenge works now (one competition, every week)
- **Monday 00:00 → Sunday 23:59 UTC.** A new challenge every Monday, by itself.
- **Same for everyone:** $10,000 paper, 1:100, live MT5 prices.
- **Rules:** 5% daily loss limit, 10% max drawdown, at least 5 closed trades to be ranked. Equal return → the smaller drawdown wins.
- **One prize:** #1 of the week gets **1 month of VRS Elite**. You check the trades and click Award in Admin → Challenge (it adds 30 days).
- **The free trial is 7 days = exactly one challenge week.** A perfect first taste of Elite.
- **Played last week? Entered again automatically** (same nickname), and the challenge account is made on their PC by itself when they open the challenge page.
- **Hall of fame:** every week's #1 on the challenge page, plus "👑 most weeks won". That gives a longer-term goal without extra prizes.
- **"📸 Share on my story":** a personal story card with nickname, rank and return, plus their invite link. The friend gets 30 days of Elite = 4 weekly challenges, and the member gets a month free when the friend pays.

## 3. How to make people share it (the viral loop)
1. **The story card from the app.** Every share = an invite link with 30 days free. Ask in every post: "post your card, tag us".
2. **Thursday leaderboard story** (story 2): top 3 tagged (ask permission once). People repost when they're tagged, and "3 days left" creates urgency.
3. **Sunday winner story** (story 3) + a short reel: the final leaderboard and the winner's equity line, plus a 10-second voice note from the winner.
4. **"Beat the founder":** you play every week with your score public. Whoever beats you gets a shout-out. Personal and fun, and it makes people try.
5. **Hall of fame + a "🏆 Champion" Discord role.** Status keeps people coming back every Monday.
6. **Comment CHALLENGE:** ManyChat sends the link by DM automatically (more comments → the post is shown to more people).
7. **Monthly "King of the weeks":** whoever won the most weeks gets a post about them. Free content, and a reason to keep going.

## 4. Later (only if needed): a browser replay for cold leads
- If the install is still too much for brand-new people, add a **"Weekly Replay"**: the same past week of gold replayed in the browser, scored in R, with nothing to install.
- About 1–2 days of work. First see how the weekly challenge does with trial members.

## 5. Not on real VT Markets accounts
- A real-money trading competition promoted to EU retail traders runs into the CFD marketing rules (ESMA, and the FSMA in Belgium is strict).
- Keep VT Markets for the free VIP. The challenge stays paper-only and free to enter.

## 6. Behind the scenes: a series ("Building VRS")
Film with your phone at the desk: screen + your hands, voice-over later. 20–40 seconds each.

1. **"17,492 lines"**: scroll through the code fast while the number counts up (a reel version of the carousel).
2. **"The bug that scared me"**: the 35% story. Honest, and people love it.
3. **"Watch 788,000 combinations run"**: screen recording of the Lab running Best overall.
4. **"How a zone is born"**: range → break → zone drawn live on a chart.
5. **"I let the bot trade while I put my daughter to bed"**: phone notifications while you're away. Human and real.
6. **"What €0 vs €59 gets you"**: Lite vs VIP vs Elite side by side on one chart.
7. **"Fixing it live"**: you find a problem, fix it, and show before and after.
8. **"Monday 00:00"**: the empty leaderboard, your first trade of the week.

## 7. The weekly rhythm

| Day | Feed | Stories |
|---|---|---|
| **Mon** | — | "It's on" (story 1) + link sticker · your own story card |
| Tue | Bot day reel / behind the scenes | A clip of your trade |
| Wed | Carousel (challenge, VT Markets or behind the scenes) | Poll: "Who wins this week?" |
| **Thu** | — | **Leaderboard story** (story 2, top 3 tagged) |
| Fri | Bot day reel | Q&A sticker |
| Sat | Behind the scenes | — |
| **Sun night** | Winner reel | **Winner story** (story 3) |

First week: post the challenge carousel (ig-03) on Monday, the VT Markets post (ig-02) on Wednesday, and behind the scenes (ig-04) on Saturday.

## 8. Good to know
- Free to enter, **paper only**. Never require a deposit or a broker account to join.
- Write "paper trading, no real money" on everything about the challenge (already on all slides and the story card).
