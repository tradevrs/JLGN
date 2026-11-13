# What every file is

**Brand: VRS · Value Research Systems · Advanced Trading Technology.**
- Strategy: **the VRS Strategy** (Value Retest Strategy). **VA1** = Value Area 1, the first range broken in a new direction (CHOCH). **VA2** = Value Area 2, the next one the same way (BOS).
- Offer (since 2026-11-13): **Free** = VRS Indicator Lite + the Playbook + the public Discord. **VRS VIP** (plan key `pro`) = VRS Indicator Pro (invite-only TradingView script) + **VRS Executor** (the MT5 software: terminal, risk manager, bot, TradingView → MT5 autotrade) + the VIP Discord. VIP is free through a partner broker, or €29/month. See FUNNEL.md.
- Logo: a chart line that pulls back into the zone (the gold dot = the entry) and takes off. It is inline SVG in every page.
- Internal code names stay as they were (`TR`, `TRC`, `trScan`, plan key `goldzone`, storage keys), so saved settings and customers' data keep working.

Old links keep working: both servers forward the old names (`terminal_test.html`, `terminal_pro.html`, `backtest.html`, `tv-indicator.html`,
`goldzone.html`, `tradingview/TR1_TR2.pine`, `tradingview/GoldZone-Lite.pine`, `ebook/GoldZone-Playbook.pdf`) to the new ones,
and `terminal_test.html` is a 5-line page that forwards GitHub Pages visitors to `index.html`.

## The website (upload these to GitHub Pages)
| File | What it is |
|---|---|
| `index.html` | **The website.** Your link opens the landing page first. Also sign-up, dashboard, setup, billing, the challenge and admin. |
| `indicator.html` | The page a visitor gets after leaving their email: **VRS Indicator Lite** (a link to the published TradingView script + 4 steps; copy-paste only until `TV_LITE_URL` is set), the Playbook download, the free Discord and the next step (the two ways into VIP). |
| `terminal.html` | **The trading terminal** (also opened from the website and served by every bridge at `/`). |
| `lab.html` | **The Backtest Lab** with the 🤖 Autopilot. Works with MT5 data through the bridge, or with CSV files without a bridge. |
| `journal.html` | The trading journal. |
| `rulebook.html` | The Risk Rulebook (a bonus in the offer, linked from the welcome page). |
| `vrs-icon.png`, `vrs-og.png` | The logo icon (phones) and the link preview image. Upload them with the pages. |
| `gp-shared.js`, `gp-theme.css` | Shared code and colours. `gp-shared.js` holds the ONE copy of the VA1 / VA2 engine (`trScan`) and VA1 Julius (`julScan`), used by the chart, the bot and both backtests. |
| `lp-*.jpg`, `lp-bot.mp4` | Screenshots and the bot recording on the landing page. Re-take with the scripts in `promo_video/`. |
| `ebook/` | **The VRS Playbook**: `vrs-playbook.html` (source) and `VRS-Playbook.pdf` (16 pages). After an edit: `node promo_video/ebook-pdf.cjs` (static server on :8899). `ebook/preview/` = page previews from that script, don't upload. |
| `tradingview/VRS-Indicator-Lite.pine` | The free indicator: zones only (ranges, breaks, zones, new-zone alert). Only needed on the website until Lite is published on TradingView and `TV_LITE_URL` is set in `indicator.html`; then leave it out of the upload. |
| `terminal_test.html` | Old address: forwards to `index.html` (keeps old links, the old PDF and installed bridges working). |

## TradingView (`tradingview/`)
| File | What it is |
|---|---|
| `VRS-Indicator-Pro.annotated.pine` | **Edit this one.** VRS Indicator Pro with every comment. |
| `VRS-Indicator-Pro.pine` | The paste version of Pro (no comments, fits TradingView's paste limit). Publish it as an **invite-only** script. |
| `VRS-Indicator-Lite.pine` | The free version, made from Pro: **zones only**. Publish it as a **public, protected** script and put its link in `TV_LITE_URL` in `indicator.html` (steps in `tradingview/WHICH-FILE-IS-WHAT.txt`). |
| `make_compact.ps1` | Makes `VRS-Indicator-Pro.pine` from the annotated file. |
| `build-lite.cjs` | Makes `VRS-Indicator-Lite.pine` from `VRS-Indicator-Pro.pine`. Lite keeps the ranges, breaks, zones and the new-zone alert. The entry, stop, take profit, R levels, BUY/SELL tags, grades, backtest card, exit plans, the multi-timeframe strip, retest alerts and JSON alerts are **removed from the code** (not switched off), so nobody can turn them back on. The script stops with an error if anything of the trade is left. |

After a change: `powershell -File tradingview\make_compact.ps1 tradingview\VRS-Indicator-Pro.annotated.pine tradingview\VRS-Indicator-Pro.pine`, then `node tradingview\build-lite.cjs`.
If `trScan` in `gp-shared.js` changes, change the Pine script too.

## Your own bridge (runs on your PC)
| File | What it is |
|---|---|
| `start_bridge.bat` | **Double-click this** to start your own bridge. |
| `start_bridge.ps1` | What start_bridge.bat runs (your PC only, never sent to customers). |
| `app.py` | The bridge: talks to MetaTrader 5, places orders, serves the terminal, and takes **TradingView → MT5 autotrade** alerts (`/api/tv/...`, the "TV autotrade" tab in the terminal). |
| `paper.py` | Paper (practice) accounts and price targets. |
| `licensing.py`, `gp_sign.py` | License check for customer bridges (off on your own PC). |
| `requirements.txt` | Python packages the bridge needs. |
| `config.json` | **Private.** Your accounts and private key. Never upload. |
| `config.example.json`, `SETUP_GUIDE.txt` | How to set up config.json by hand (reference). |
| `accounts_extra.json`, `paper_accounts.json`, `copy_settings.json`, `targets.json`, `tv_alerts.json` | **Private.** Saved accounts, paper accounts, copy settings, price targets, and the autotrade settings + webhook secret. Never upload. |
| `gomez-private-key-BACKUP.json` | **Private.** Backup of your key. Never upload. |
| `.venv/` | Python installed for the bridge. Leave it. |

## What customers get (built into their zip automatically)
| File | What it is |
|---|---|
| `start_customer.bat` | Becomes **START VRS.bat** in the customer's zip. |
| `run_bridge.py` | Starts the customer's bridge and opens the setup page. |
| (plus app.py, paper.py, licensing.py, gp_sign.py, requirements.txt, terminal.html, lab.html, journal.html, gp-shared.js, gp-theme.css) | |

## The business side (`saas/`)
| File | What it is |
|---|---|
| `saas/license_server.py` | Sign-ups, payments (Stripe), plans (`pro` = VRS VIP, the only plan on the website; `goldzone`, `elite`, `starter` are hidden and kept for old customers), partner-broker VIP requests, license keys, admin (incl. **Broker VIP** and **TradingView invites**), leads. |
| `saas/.env.example` | All server settings (prices, Stripe keys, founding seats…). |
| `saas/data/` | **Private.** Customer database and owners.txt. Never upload. |
| `saas/selftest/` | The automatic test (`.venv\Scripts\python.exe saas\selftest\selftest.py`). |
| `saas/SELLING_GUIDE.md`, `saas/MARKETING_PLAN.md`, `saas/EMAILS.md` | How to sell, the marketing plan, the follow-up emails. |
| `FUNNEL.md` | The funnel: the 3-step ladder, the emails, what to measure. |

## Promo video and screenshots (`promo_video/`)
| File | What it is |
|---|---|
| `out/…mp4` | **The finished videos.** |
| `src/`, `public/`, `package.json` | The video project (`npm install`, then `npm run render`). |
| `shots-landing.cjs` | **Re-takes every landing-page screenshot** (`node shots-landing.cjs`, or one: `spot trade drag basket tools rules paper limits journal lab`). |
| `rec-bot.cjs` | Re-records the bot video (`lp-bot.mp4` + `lp-bot.jpg`). |
| `shots*.cjs` (others) | Older single-purpose screenshot scripts. |
| `ebook-pdf.cjs`, `ebook-cover.cjs`, `shots-ebook*.cjs` | The Playbook PDF, its cover and its screenshots. |

## The logo (`brand/`)
The VRS logo is **"The Retest V"**: a gold V that drops into the zone, touches it (the white dot) and launches.
| File | What it is |
|---|---|
| `brand/logo.html` | **The master design** (the mark at 512 × 512, `markA`). Change the logo here. |
| `promo_video/brand-render.cjs` | `node brand-render.cjs markA` makes every PNG below from logo.html. |
| `brand/swap-logo.cjs` | `node brand/swap-logo.cjs` (from backend) puts the logo + favicon into every page (index, terminal, lab, journal, rulebook, indicator, legal, the Playbook). A new page: add `<svg viewBox="0 0 32 32"><defs></defs></svg>` where the logo goes and `<link rel="icon" href="data:,">` in `<head>`, then run it. |
| `brand/vrs-avatar.png` | Profile picture for TikTok, Instagram, YouTube, X, Discord, Telegram, TradingView. |
| `brand/vrs-icon.png` | Rounded app icon. A copy sits in backend as `vrs-icon.png` (phone home-screen icon, also in the customer zip). |
| `brand/vrs-og.png` | Link preview (1200 × 630). A copy sits in backend as `vrs-og.png` (`og:image` of the website). |
| `brand/vrs-mark-transparent.png`, `brand/vrs-lockup-*.png` | The mark alone, and logo + "VRS" for dark / light backgrounds. |

After a logo change: render, run swap-logo, copy `vrs-icon.png` + `vrs-og.png` to backend, then re-take the screenshots (`shots-landing.cjs`, `shots-system.cjs`, `rec-bot.cjs`, `ebook-cover.cjs`) and rebuild the PDF (`ebook-pdf.cjs`).

## Not part of the product
- `Gold M15 VA1 Playbook.html`: your own file, left as it is.
- `LAETI/`: your other project, not touched.
