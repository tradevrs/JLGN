/* =====================================================================
   GOLDMINE — shared core for terminal.html and journal.html
   utilities · settings · bridge client · demo broker · time zones · dialogs
   ===================================================================== */
'use strict';

/* ---------- 1. utilities ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Pages under /saas/ are the customer website running inside YOUR bridge for testing. They act like the hosted site:
// own saved settings (never your terminal's key) and they look for the customer's bridge instead of using this one.
const SAAS_PAGE = location.pathname.startsWith('/saas/');
const SP = SAAS_PAGE ? 'gps_' : 'gp_';
const store = {
  get(k, d) { try { const v = localStorage.getItem(SP + k); return v == null ? d : JSON.parse(v) } catch { return d } },
  set(k, v) { try { localStorage.setItem(SP + k, JSON.stringify(v)) } catch {} },
};
const legacy = k => { if (SAAS_PAGE) return ''; try { return localStorage.getItem(k) || '' } catch { return '' } }; // saved by the old terminal.html
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const num = (v, d = 2) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const sum = (a, f = x => x) => a.reduce((s, x) => s + f(x), 0);
const enc = encodeURIComponent;
const pad2 = n => String(n).padStart(2, '0');
const TF_SEC = { M1: 60, M2: 120, M3: 180, M4: 240, M5: 300, M6: 360, M10: 600, M12: 720, M15: 900, M20: 1200, M30: 1800, H1: 3600, H2: 7200, H3: 10800, H4: 14400, H6: 21600, H8: 28800, H12: 43200, D1: 86400, W1: 604800, MN1: 2592000 };
let CURRENCY = 'USD';
const CUR = () => ({ USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$', CHF: 'CHF ' })[CURRENCY] ?? (CURRENCY + ' ');
const money = (v, sign = true) => (v < 0 ? '−' : sign && v > 0 ? '+' : '') + CUR() + num(Math.abs(v));
const cls = v => v > 0 ? 'up' : v < 0 ? 'dn' : '';

/* ---------- 2. settings (shared by both pages) ---------- */
const BRIDGE_ORIGIN = !SAAS_PAGE && (location.port === '8765' || /trycloudflare\.com$/.test(location.hostname)) ? location.origin : '';
const CFG = Object.assign({
  base: legacy('gm_base') || 'http://127.0.0.1:8765', key: legacy('gm_key'), demo: false,
  theme: legacy('gm_theme') === 'dark' ? 'dark' : 'light', tz: 'Europe/Brussels',
  oneClick: false, sound: true, riskPct: 1, maxDailyLoss: 0, maxPositions: 0, welcomed: false, // 0 = no limit: traders set their own
  chartColors: {}, // per theme overrides: { light: { up, down, wick, border, bg, grid } }
}, store.get('cfg', {}));
if (CFG.v !== 2) { CFG.v = 2; if (!['light', 'dark', 'midnight'].includes(CFG.theme)) CFG.theme = 'light' }
// one time: the old built-in limits (−5% a day, 10 positions) were defaults nobody chose -> now off; a value someone typed stays
if (!CFG.limitsV) { CFG.limitsV = 1; if (CFG.maxDailyLoss === 5) CFG.maxDailyLoss = 0; if (CFG.maxPositions === 10) CFG.maxPositions = 0; store.set('cfg', CFG) }
if (BRIDGE_ORIGIN) CFG.base = BRIDGE_ORIGIN;
{ // share links: ?demo=1 opens straight into the live demo, ?theme=dark|light|midnight picks a theme
  const q = new URLSearchParams(location.search);
  if (q.has('demo')) { CFG.demo = q.get('demo') !== '0'; CFG.welcomed = true }
  if (['light', 'dark', 'midnight'].includes(q.get('theme'))) CFG.theme = q.get('theme');
}
const saveCfg = () => store.set('cfg', CFG);
const applyTheme = () => { document.documentElement.dataset.theme = CFG.theme };
applyTheme();

/* ---------- 3. time zones ----------
   MT5 timestamps are broker SERVER time written as if it were UTC.
   GP.off = server time − real UTC (seconds), learned from live ticks.            */
const GP = { off: store.get('off', 0) };
const TZ_LIST = [['broker', 'Broker server time'], ['Europe/Brussels', 'CET / CEST'], ['Europe/London', 'London'], ['America/New_York', 'New York'], ['UTC', 'UTC'], ['local', 'My computer']];
const _fmts = {};
function tzParts(t) {
  const tz = CFG.tz, broker = tz === 'broker', d = new Date((broker ? t : t - GP.off) * 1000);
  const zone = broker ? 'UTC' : tz === 'local' ? undefined : tz, k = zone || 'local';
  const f = _fmts[k] ||= new Intl.DateTimeFormat('en-GB', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short' });
  const o = {}; f.formatToParts(d).forEach(x => o[x.type] = x.value);
  return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, wd: o.weekday };
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDT = t => { if (!t) return ''; const q = tzParts(t); return `${pad2(q.d)} ${MON[q.mo - 1]} ${pad2(q.h)}:${pad2(q.mi)}` };
const fmtDate = t => { const q = tzParts(t); return `${q.wd} ${pad2(q.d)} ${MON[q.mo - 1]} ${q.y}` };
const dayKey = t => { const q = tzParts(t); return `${q.y}-${pad2(q.mo)}-${pad2(q.d)}` };
const fmtDur = s => { s = Math.max(0, Math.round(s)); if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm'; if (s < 86400) return Math.floor(s / 3600) + 'h ' + pad2(Math.floor(s % 3600 / 60)) + 'm'; return (s / 86400).toFixed(1) + 'd' };

/* ---------- 4. bridge client (one code path for real + demo) ---------- */
async function api(path, body) {
  if (CFG.demo) return Demo.call(path, body);
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 30000);
  const opt = { headers: { 'X-Gomez-Key': CFG.key }, signal: ctl.signal };
  if (body) { opt.method = 'POST'; opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body) }
  let r;
  try { r = await fetch(CFG.base.replace(/\/+$/, '') + path, opt) }
  catch (e) { throw new Error(e.name === 'AbortError' ? 'The bridge took too long to answer.' : `Cannot reach the bridge at ${CFG.base}. Is start_bridge.bat running?`) }
  finally { clearTimeout(timer) }
  let j = null; try { j = await r.json() } catch {}
  if (!r.ok) {
    const d = j?.detail;
    if (r.status === 404 && (d === 'Not Found' || !d) && /^\/api\/(journal|paper|accounts\/(add|remove))/.test(path)) throw new Error('Your bridge is older than this page. Close the start_bridge.bat window and start it again so it loads the new app.py.');
    throw new Error(typeof d === 'string' ? d : Array.isArray(d) ? d.map(x => x.msg).join(', ') : `Bridge error ${r.status}`);
  }
  return j;
}

/* ---------- 5. demo broker: random-walk prices, orders, SL/TP, MAE/MFE, full journal ---------- */
const Demo = (() => {
  const SPEC = {
    XAUUSD: { p: 2648.5, d: 2, c: 100, v: .00010, spr: 22, com: 7, path: 'Metals\\Gold' },
    XAGUSD: { p: 31.24, d: 3, c: 5000, v: .00016, spr: 25, com: 7, path: 'Metals\\Silver' },
    EURUSD: { p: 1.08425, d: 5, c: 100000, v: .00004, spr: 8, com: 7, path: 'Forex\\Majors' },
    GBPUSD: { p: 1.27155, d: 5, c: 100000, v: .00005, spr: 10, com: 7, path: 'Forex\\Majors' },
    USDJPY: { p: 151.420, d: 3, c: 100000, v: .00005, spr: 12, com: 7, path: 'Forex\\Majors' },
    BTCUSD: { p: 68250.0, d: 2, c: 1, v: .00024, spr: 2500, com: 0, path: 'Crypto' },
    US30: { p: 42150.0, d: 1, c: 1, v: .00008, spr: 20, com: 0, path: 'Indices\\US' },
    NAS100: { p: 20480.0, d: 1, c: 1, v: .00010, spr: 15, com: 0, path: 'Indices\\US' },
    GER40: { p: 19210.0, d: 1, c: 1, v: .00009, spr: 12, com: 0, path: 'Indices\\EU' },
  };
  const now = () => Math.floor(Date.now() / 1000);
  const gauss = r => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
  const hash = s => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
  const R = Math.random, mids = {}, drift = {}, bars = {}, pull = {}; // pull[symbol] = a price the demo walks towards (scripted recordings only)
  for (const s in SPEC) { mids[s] = SPEC[s].p; drift[s] = 0 }
  const pt = s => Math.pow(10, -SPEC[s].d);
  const quote = s => { const h = SPEC[s].spr * pt(s) / 2, d = SPEC[s].d; return { bid: +(mids[s] - h).toFixed(d), ask: +(mids[s] + h).toFixed(d) } };
  const mpu = (s, px = mids[s]) => s.startsWith('USD') ? SPEC[s].c / px : SPEC[s].c; // money per 1.0 price move per lot

  function history(s, tf, n) {
    const r = rng(hash(s + tf)), tfs = TF_SEC[tf], sig = SPEC[s].v * Math.sqrt(tfs);
    const out = []; let x = 1, mu = 0;
    for (let i = 0; i < n; i++) {
      mu = mu * .9 + gauss(r) * sig * .05 - (x - 1) * .004;
      const o = x; let h = o, l = o;
      for (let k = 0; k < 4; k++) { x *= 1 + mu / 4 + gauss(r) * sig / 2; h = Math.max(h, x); l = Math.min(l, x) }
      out.push({ open: o, high: h, low: l, close: x });
    }
    const f = mids[s] / x, last = Math.floor(now() / tfs) * tfs, d = SPEC[s].d;
    return out.map((b, i) => ({ time: last - (n - 1 - i) * tfs, open: +(b.open * f).toFixed(d), high: +(b.high * f).toFixed(d), low: +(b.low * f).toFixed(d), close: +(b.close * f).toFixed(d) }));
  }
  const series = (s, tf) => bars[s + '|' + tf] ||= history(s, tf, 5000);

  // ~6 months of realistic closed trades with built-in patterns, so every journal statistic has something to say
  function genAccount(label, bal0, seed, n, days) {
    const r = rng(seed), trades = [], cash = [];
    const W = [['XAUUSD', .44], ['EURUSD', .14], ['NAS100', .12], ['GBPUSD', .1], ['BTCUSD', .08], ['US30', .06], ['USDJPY', .06]];
    const pick = () => { let x = r(), a = 0; for (const [s, w] of W) { a += w; if (x <= a) return s } return 'XAUUSD' };
    let t = now() - days * 86400, bal = bal0, pos = 8800000;
    cash.push({ time: t - 3600, type: 'balance', amount: bal0, comment: 'Deposit' });
    for (let i = 0; i < n; i++) {
      t += days * 86400 / n * (.25 + r() * 1.5);
      if (t > now() - 3600) break;
      let dw = new Date(t * 1000).getUTCDay(); if (dw === 6) t += 2 * 86400; if (dw === 0) t += 86400;
      if (i === Math.floor(n * .45)) { cash.push({ time: t - 7200, type: 'balance', amount: 2000, comment: 'Deposit' }); bal += 2000 }
      if (i === Math.floor(n * .8)) { cash.push({ time: t - 7200, type: 'balance', amount: -1500, comment: 'Withdrawal' }); bal -= 1500 }
      const d = new Date(t * 1000), h = d.getUTCHours(), dow = d.getUTCDay();
      const s = pick(), sp = SPEC[s], side = r() < .56 ? 'BUY' : 'SELL', dir = side === 'BUY' ? 1 : -1;
      const hold = Math.exp(Math.log(300) + r() * Math.log(900));
      let wp = h >= 7 && h < 11 ? .63 : h >= 12 && h < 16 ? .55 : h < 7 ? .39 : .45;
      if (dow === 5) wp -= .12; if (side === 'SELL') wp -= .05; if (s === 'BTCUSD') wp -= .1; if (hold > 86400) wp -= .08;
      const win = r() < wp, hasSl = r() < .87;
      const price = sp.p * (1 + gauss(r) * .025), stop = sp.p * sp.v * Math.sqrt(3600) * (.8 + r() * 1.6), m = mpu(s, price);
      const vol = +clamp(Math.round(bal * (.004 + r() * .009) / (stop * m) * 100) / 100, .01, 3).toFixed(2);
      const Rm = win ? (r() < .3 ? 2 : .25 + r() * 2.6) : (hasSl && r() < .72 ? -1 : -(.15 + r() * .8) * (hasSl ? 1 : 1.9));
      const open = +price.toFixed(sp.d), close = +(open + dir * Rm * stop).toFixed(sp.d);
      const profit = +((close - open) * dir * m * vol).toFixed(2), commission = -+(sp.com * vol).toFixed(2), swap = hold > 86400 ? -+(Math.floor(hold / 86400) * vol * 4.2).toFixed(2) : 0;
      const tp0 = hasSl && r() < .7 ? +(open + dir * 2 * stop).toFixed(sp.d) : 0;
      const mfe = Math.max(0, Rm * stop) + r() * stop * (win ? .9 : .55), mae = win ? r() * stop * .85 : Math.abs(Rm * stop) + r() * stop * .08;
      const net = +(profit + commission + swap).toFixed(2); bal += net;
      trades.push({ position: ++pos, symbol: s, side, volume: vol, closed_volume: vol, open_time: Math.floor(t), close_time: Math.floor(t + hold), open_price: open, close_price: close,
        profit, swap, commission, fee: 0, net, exits: r() < .15 ? 2 : 1, magic: r() < .1 ? 20261014 : 20261013, comment: 'Gomez dashboard DEMO', close_comment: '',
        sl_initial: hasSl ? +(open - dir * stop).toFixed(sp.d) : 0, sl: hasSl ? +(open - dir * stop * (win && r() < .4 ? 0 : 1)).toFixed(sp.d) : 0, tp_initial: tp0, tp: tp0,
        reason: win && Rm === 2 && tp0 ? 5 : !win && Rm === -1 ? 4 : 0, money_per_unit: m, digits: sp.d, point: pt(s), mfe, mae });
    }
    return { label, balance: +bal.toFixed(2), positions: [], pending: [], trades, cash };
  }
  const ACC = { 50010001: genAccount('Gold Demo 10K', 10000, 7, 330, 190), 50010002: genAccount('Prop Challenge 100K', 100000, 11, 140, 75) };
  let tk = 7000000;

  const profitOf = (p) => { const q = quote(p.symbol); return ((p.type === 'BUY' ? q.bid - p.price_open : p.price_open - q.ask) * mpu(p.symbol) * p.volume) };
  function closePos(a, p, price, vol = p.volume, reason = 0) {
    const s = p.symbol, dir = p.type === 'BUY' ? 1 : -1, m = mpu(s);
    const pl = +((price - p.price_open) * dir * m * vol).toFixed(2), com = -+(SPEC[s].com * vol).toFixed(2);
    a.balance = +(a.balance + pl + com).toFixed(2);
    a.trades.push({ position: p.ticket, symbol: s, side: p.type, volume: vol, closed_volume: vol, open_time: p.time_epoch, close_time: now(), open_price: p.price_open, close_price: price,
      profit: pl, swap: 0, commission: com, fee: 0, net: +(pl + com).toFixed(2), exits: 1, magic: 20261013, comment: 'Gomez dashboard DEMO', close_comment: '',
      sl_initial: p.sl0 || 0, sl: p.sl, tp_initial: p.tp0 || 0, tp: p.tp, reason, money_per_unit: m, digits: SPEC[s].d, point: pt(s), mfe: p.mfe || 0, mae: p.mae || 0 });
    p.volume = +(p.volume - vol).toFixed(2);
    if (p.volume <= 1e-9) a.positions.splice(a.positions.indexOf(p), 1);
  }
  function step() {
    const t = now();
    for (const s in SPEC) {
      if (pull[s]) { drift[s] = 0; mids[s] += (pull[s] - mids[s]) * .045 + gauss(R) * SPEC[s].v * mids[s] * .35 } // scripted: glide to the target with a little noise
      else { drift[s] = drift[s] * .995 + gauss(R) * SPEC[s].v * .02; mids[s] *= 1 + drift[s] + gauss(R) * SPEC[s].v * .5 }
      const px = +mids[s].toFixed(SPEC[s].d);
      for (const tf in TF_SEC) {
        const B = bars[s + '|' + tf]; if (!B) continue;
        const tfs = TF_SEC[tf], bt = Math.floor(t / tfs) * tfs, last = B[B.length - 1];
        if (bt > last.time) { B.push({ time: bt, open: last.close, high: Math.max(last.close, px), low: Math.min(last.close, px), close: px }); if (B.length > 8000) B.splice(0, 2000) }
        else { last.close = px; last.high = Math.max(last.high, px); last.low = Math.min(last.low, px) }
      }
    }
    for (const a of Object.values(ACC)) {
      for (const o of [...a.pending]) {
        const q = quote(o.symbol), hit = { 2: q.ask <= o.price, 3: q.bid >= o.price, 4: q.ask >= o.price, 5: q.bid <= o.price }[o.type];
        if (hit && marginOf(a, o.symbol, o.volume) > acctOut(a).margin_free) { a.pending.splice(a.pending.indexOf(o), 1); demoEvent(a, `${NAMES[o.type]} #${o.ticket} on ${o.symbol} was cancelled: not enough free margin.`, 'err'); continue }
        if (hit) { a.pending.splice(a.pending.indexOf(o), 1); a.positions.push({ ticket: o.ticket, symbol: o.symbol, type: o.type % 2 === 0 ? 'BUY' : 'SELL', volume: o.volume, price_open: o.type % 2 === 0 ? q.ask : q.bid, sl: o.sl, tp: o.tp, sl0: o.sl, tp0: o.tp, time_epoch: t }) }
      }
      for (const p of [...a.positions]) {
        const q = quote(p.symbol), buy = p.type === 'BUY', px = buy ? q.bid : q.ask, mv = (px - p.price_open) * (buy ? 1 : -1);
        p.mfe = Math.max(p.mfe || 0, mv); p.mae = Math.max(p.mae || 0, -mv);
        if (p.sl && (buy ? px <= p.sl : px >= p.sl)) closePos(a, p, p.sl, p.volume, 4);
        else if (p.tp && (buy ? px >= p.tp : px <= p.tp)) closePos(a, p, p.tp, p.volume, 5);
      }
      // price targets: partial take profit / keep best entry (the bridge does the same with your MT5 prices)
      const T = a.targets ||= [];
      for (const g of [...T]) {
        const open = a.positions.filter(p => g.kind === 'partial' ? p.ticket === g.ticket : p.symbol === g.symbol && p.type === g.side);
        if (!open.length) { T.splice(T.indexOf(g), 1); continue }
        const q = quote(g.symbol), px = g.side === 'BUY' ? q.bid : q.ask;
        if (!(g.dir > 0 ? px >= g.price : px <= g.price)) continue;
        T.splice(T.indexOf(g), 1);
        const msg = g.kind === 'partial' ? demoPartial(a, open[0], g.percent, px, g.be) : demoKeepBest(a, g.symbol, g.side, g.percent, g.be, px);
        demoEvent(a, (g.kind === 'partial' ? `Partial TP ${px.toFixed(SPEC[g.symbol].d)}: ` : `Keep-best ${g.side} ${g.symbol} at ${px.toFixed(SPEC[g.symbol].d)}: `) + msg + '.');
      }
    }
  }
  // like a broker: margin level (equity / margin) at or below 20% closes the biggest loser, again and again; balance never below 0
  const marginOf = (A, s, v) => v * mpu(s) * mids[s] / (A.leverage || 100);
  function stopOut(a) {
    const hit = [];
    for (let i = 0; i < 100 && a.positions.length; i++) {
      const o = acctOut(a); if (o.margin <= 0 || o.equity / o.margin * 100 > 20) break;
      const w = a.positions.reduce((x, y) => profitOf(y) < profitOf(x) ? y : x), q = quote(w.symbol), lvl = o.equity / o.margin * 100;
      const pl = profitOf(w); closePos(a, w, w.type === 'BUY' ? q.bid : q.ask, w.volume, 6); hit.push(`#${w.ticket} ${w.symbol} (${pl.toFixed(2)}) at margin level ${lvl.toFixed(0)}%`);
    }
    if (hit.length) demoEvent(a, 'Stop out: margin level fell to 20% or below. Closed ' + hit.join(', ') + '.', 'err');
    if (a.balance < 0 && !a.positions.length) { demoEvent(a, `The balance went ${a.balance.toFixed(2)}: reset to 0 (negative balance protection).`, 'err'); a.cash.push({ time: now(), type: 'balance', amount: -a.balance, comment: 'Negative balance reset to 0' }); a.balance = 0 }
  }
  setInterval(() => { step(); for (const a of Object.values(ACC)) stopOut(a) }, 250);
  const partVol = (p, pct) => pct >= 99.999 ? p.volume : +(Math.round(p.volume * pct) / 100).toFixed(2);
  function demoEvent(a, text, kind = 'ok') { const E = a.events ||= []; E.push({ id: Date.now() + E.length, time: now(), text, kind }); E.splice(0, E.length - 30) }
  function demoPartial(a, p, pct, px, be) {
    const v = partVol(p, pct); if (v < .01) return `${pct}% of ${p.volume} lot is below 0.01, skipped`;
    closePos(a, p, px, Math.min(v, p.volume), 5);
    if (be && a.positions.includes(p) && (px - p.price_open) * (p.type === 'BUY' ? 1 : -1) > 0) p.sl = p.price_open;
    return `closed ${v} lot of #${p.ticket}` + (a.positions.includes(p) ? `, ${p.volume} lot still open` : '');
  }
  function demoKeepBest(a, s, side, pct, be, px) {
    const ps = a.positions.filter(p => p.symbol === s && p.type === side); if (!ps.length) return 'no open positions';
    const best = ps.reduce((x, y) => side === 'BUY' ? (y.price_open < x.price_open ? y : x) : (y.price_open > x.price_open ? y : x));
    const rest = ps.filter(p => p !== best); rest.forEach(p => closePos(a, p, px));
    let m = rest.length ? `closed ${rest.length}` : 'nothing else to close';
    if (pct) m += '; ' + demoPartial(a, best, pct, px, be); else if (be && (px - best.price_open) * (side === 'BUY' ? 1 : -1) > 0) best.sl = best.price_open;
    return m;
  }

  const err = m => { throw new Error(m) };
  const acc = l => ACC[+l] || err('That account is not configured in the bridge.');
  const sym = s => SPEC[s] ? s : err(`Broker symbol unavailable: ${s}`);
  const vol = v => { v = Math.round(v * 100) / 100; if (v < .01 || v > 1) err('Volume must be between 0.01 and 1.0 lots for this symbol.'); return v };
  const sideCheck = (buy, ref, sl, tp) => {
    if (sl && (buy ? sl >= ref : sl <= ref)) err('Stop loss must be below entry for buys and above entry for sells.');
    if (tp && (buy ? tp <= ref : tp >= ref)) err('Take profit must be above entry for buys and below entry for sells.');
  };
  const NAMES = { 2: 'BUY LIMIT', 3: 'SELL LIMIT', 4: 'BUY STOP', 5: 'SELL STOP' };
  const posOut = a => a.positions.map(({ sl0, tp0, mfe, mae, ...p }) => ({ ...p, profit: +profitOf(p).toFixed(2), price_current: quote(p.symbol)[p.type === 'BUY' ? 'bid' : 'ask'] }));
  const acctOut = A => {
    const fl = sum(A.positions, profitOf), margin = sum(A.positions, x => x.volume * mpu(x.symbol) * mids[x.symbol] / (A.leverage || 100));
    return { balance: A.balance, equity: +(A.balance + fl).toFixed(2), margin: +margin.toFixed(2), margin_free: +(A.balance + fl - margin).toFixed(2), profit: +fl.toFixed(2), currency: 'USD' };
  };

  return {
    SPEC, pull, mid: s => mids[s],
    async call(path, body) {
      await sleep(20 + R() * 40);
      const u = new URL(path, 'http://demo'), q = Object.fromEntries(u.searchParams), p = u.pathname;
      const a = () => acc(body ? body.login : q.login);
      switch (p) {
        case '/api/health': return { ok: true, mode: 'demo', version: 'demo' };
        case '/api/accounts': return { accounts: Object.entries(ACC).map(([l, x]) => ({ login: +l, name: x.label, server: x.paper ? 'Goldmine Paper' : 'Goldmine-Demo', is_demo: true, paper: !!x.paper, leverage: x.leverage || 100 })) };
        case '/api/paper/create': {
          const l = 90000001 + Object.values(ACC).filter(x => x.paper).length, bal = +body.balance || 10000;
          ACC[l] = Object.assign(genAccount(body.name || `Paper ${num(bal, 0)}`, bal, l, 0, 1), { paper: true, leverage: +body.leverage || 500 });
          return { ok: true, account: { login: l, name: ACC[l].label, balance: bal, currency: 'USD', paper: true, leverage: ACC[l].leverage } };
        }
        case '/api/paper/leverage': { const A = a(); A.leverage = +body.leverage || 100; return { ok: true, account: { login: +body.login, leverage: A.leverage } }
        }
        case '/api/paper/reset': { const A = a(); const bal = body.balance || A.cash[0]?.amount || 10000; Object.assign(A, { balance: bal, positions: [], pending: [], trades: [], cash: [{ time: now(), type: 'balance', amount: bal, comment: 'Reset' }] }); return { ok: true } }
        case '/api/paper/deposit': { const A = a(); A.balance = +(A.balance + body.amount).toFixed(2); A.cash.push({ time: now(), type: 'balance', amount: body.amount, comment: body.amount >= 0 ? 'Deposit' : 'Withdrawal' }); return { ok: true } }
        case '/api/paper/delete': { a(); delete ACC[+body.login]; return { ok: true } }
        case '/api/accounts/add': err('In demo mode nothing connects to MT5. Connect your bridge to add a real MT5 demo account.');
        case '/api/symbols': return { symbols: Object.keys(SPEC).sort(), gold: ['XAUUSD'], paths: Object.fromEntries(Object.entries(SPEC).map(([k, v]) => [k, v.path + '\\' + k])) };
        case '/api/candles': { a(); const s = sym(q.symbol), B = series(s, q.timeframe); return { symbol: s, timeframe: q.timeframe, tf_seconds: TF_SEC[q.timeframe], digits: SPEC[s].d, point: pt(s), candles: B.slice(-(+q.count || 500)).map(b => ({ ...b })) } }
        case '/api/live': {
          const A = a(), s = sym(q.symbol), qt = quote(s), B = series(s, q.timeframe);
          return { symbol: s, ...qt, time: now(), digits: SPEC[s].d, point: pt(s), contract: SPEC[s].c, tick_size: pt(s), tick_value: mpu(s) * pt(s), volume_min: .01, volume_step: .01, volume_max: 1,
            bars: B.slice(-2).map(b => ({ ...b })), positions: posOut(A), pending: A.pending.map(o => ({ ...o, name: NAMES[o.type] })), account: acctOut(A),
            targets: (A.targets || []).map(g => ({ ...g })), events: (A.events || []).slice(-10) };
        }
        case '/api/targets/add': {
          const A = a(), b = body, side = String(b.side || '').toUpperCase();
          let s = b.symbol, sd = side;
          if (b.kind === 'partial') { const p = A.positions.find(x => x.ticket === b.ticket) || err('Position not found.'); s = p.symbol; sd = p.type; if (!b.price) err('Enter a price.') }
          else if (!A.positions.some(p => p.symbol === s && p.type === sd)) err(`No open ${sd} positions on ${s}.`);
          const qt = quote(sym(s)), ref = sd === 'BUY' ? qt.bid : qt.ask;
          if (b.kind === 'keepbest' && !b.price) { const m = demoKeepBest(A, s, sd, +b.percent || 0, !!b.be, ref); return { ok: true, message: m[0].toUpperCase() + m.slice(1) + '.' } }
          const price = +(+b.price).toFixed(SPEC[s].d); if (price === ref) err('That price is the current price: pick a level above or below it.');
          const g = { id: ++tk, kind: b.kind, symbol: s, side: sd, price, dir: price > ref ? 1 : -1, percent: +b.percent || 0, ticket: b.ticket || 0, be: !!b.be, created: now() };
          (A.targets ||= []).push(g); return { ok: true, target: g };
        }
        case '/api/targets/remove': { const A = a(), T = A.targets || [], i = T.findIndex(g => g.id === body.id); if (i < 0) err('Target not found (it may just have fired).'); T.splice(i, 1); return { ok: true } }
        case '/api/history': { const A = a(); return { deals: A.trades.slice().sort((x, y) => y.close_time - x.close_time).slice(0, +q.limit || 8).map(t => ({ ticket: t.position, symbol: t.symbol, type: t.side === 'BUY' ? 'SELL' : 'BUY', volume: t.closed_volume, price: t.close_price, profit: t.net, time_epoch: t.close_time, time: new Date(t.close_time * 1000).toISOString().slice(0, 16).replace('T', ' ') })) } }
        case '/api/journal': {
          const A = a(), from = now() - (+q.days || 365) * 86400;
          return { account: { login: +(q.login), name: A.label, owner: 'Demo Trader', server: 'Goldmine-Demo', company: 'Goldmine Demo Broker', currency: 'USD', leverage: A.leverage || 100, ...acctOut(A), is_demo: true },
            trades: A.trades.filter(t => t.close_time >= from).map(t => ({ ...t })), cash: A.cash.filter(c => c.time >= from), open: posOut(A), now: now() };
        }
        case '/api/order': {
          const A = a(), s = sym(body.symbol), v = vol(body.volume), buy = body.side === 'buy', qt = quote(s), px = buy ? qt.ask : qt.bid;
          sideCheck(buy, px, body.sl, body.tp);
          const need = marginOf(A, s, v), free = acctOut(A).margin_free;
          if (need > free + 1e-6) err(`Not enough free margin: this trade needs ${need.toFixed(2)} USD margin, you have ${Math.max(0, free).toFixed(2)} free (1:${A.leverage || 100}). Use a smaller lot.`);
          A.positions.push({ ticket: ++tk, symbol: s, type: buy ? 'BUY' : 'SELL', volume: v, price_open: px, sl: body.sl || 0, tp: body.tp || 0, sl0: body.sl || 0, tp0: body.tp || 0, time_epoch: now() });
          return { ok: true, ticket: tk, message: 'Request executed' };
        }
        case '/api/pending': {
          const A = a(), s = sym(body.symbol), v = vol(body.volume), buy = body.side === 'buy', qt = quote(s), price = +(+body.price).toFixed(SPEC[s].d);
          const type = buy ? (price < qt.ask ? 2 : 4) : (price > qt.bid ? 3 : 5), isLimit = type <= 3;
          if (body.kind === 'limit' && !isLimit) err('A limit order needs the price BELOW market for buys and ABOVE market for sells.');
          if (body.kind === 'stop' && isLimit) err('A stop order needs the price ABOVE market for buys and BELOW market for sells.');
          sideCheck(buy, price, body.sl, body.tp);
          A.pending.push({ ticket: ++tk, symbol: s, type, volume: v, price, sl: body.sl || 0, tp: body.tp || 0 });
          return { ok: true, ticket: tk, type: NAMES[type], message: 'Order placed' };
        }
        case '/api/pending/modify': {
          const A = a(), o = A.pending.find(x => x.ticket === body.ticket) || err('Pending order not found.');
          const price = body.price ?? o.price, sl = body.sl ?? o.sl, tp = body.tp ?? o.tp, qt = quote(o.symbol);
          if (body.price != null && { 2: price >= qt.ask, 3: price <= qt.bid, 4: price <= qt.ask, 5: price >= qt.bid }[o.type]) err(`Invalid price: a ${NAMES[o.type]} must stay ${o.type === 2 || o.type === 5 ? 'below' : 'above'} the current price.`);
          sideCheck(o.type % 2 === 0, price, sl, tp); Object.assign(o, { price, sl, tp });
          return { ok: true, message: 'Pending order updated' };
        }
        case '/api/cancel': { const A = a(), i = A.pending.findIndex(x => x.ticket === body.ticket); if (i < 0) err('Pending order not found.'); A.pending.splice(i, 1); return { ok: true, message: 'Pending order cancelled' } }
        case '/api/modify': {
          const A = a(), x = A.positions.find(y => y.ticket === body.ticket) || err('Position ticket not found.'), qt = quote(x.symbol), buy = x.type === 'BUY';
          if (body.sl && (buy ? body.sl >= qt.bid : body.sl <= qt.ask)) err('SL is on the wrong side of the current market price.');
          if (body.tp && (buy ? body.tp <= qt.bid : body.tp >= qt.ask)) err('TP is on the wrong side of the current market price.');
          if (!x.sl0 && body.sl) x.sl0 = body.sl; if (!x.tp0 && body.tp) x.tp0 = body.tp;
          x.sl = body.sl || 0; x.tp = body.tp || 0; return { ok: true, message: 'SL/TP updated' };
        }
        case '/api/close': {
          const A = a(), x = A.positions.find(y => y.ticket === body.ticket) || err('Position ticket not found'), qt = quote(x.symbol);
          const v = body.percent >= 99.999 ? x.volume : Math.round(x.volume * body.percent) / 100;
          if (v < .01) err('Partial close rounds below broker minimum 0.01 lots');
          closePos(A, x, x.type === 'BUY' ? qt.bid : qt.ask, +v.toFixed(2)); return { ok: true, message: `Close request sent (${body.percent}%).` };
        }
        case '/api/close-all': { const A = a(); let n = 0; for (const x of [...A.positions]) { const qt = quote(x.symbol); closePos(A, x, x.type === 'BUY' ? qt.bid : qt.ask); n++ } return { ok: true, closed: n, failed: 0 } }
        default: err('Copy trading runs inside your MT5 bridge. Connect to your bridge to use it.');
      }
    },
  };
})();

/* ---------- 6. toasts, sound, dialogs, popovers ---------- */
function toast(msg, type = 'info', ms) {
  let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box) }
  const el = document.createElement('div'); el.className = 'toast ' + type; el.textContent = msg;
  box.appendChild(el); setTimeout(() => el.remove(), ms || (type === 'err' ? 6000 : 3000));
  while (box.children.length > 4) box.firstChild.remove();
}
let _ac;
function beep(f = 880, d = .09) {
  if (!CFG.sound) return;
  try { _ac ||= new AudioContext(); const o = _ac.createOscillator(), g = _ac.createGain(); o.frequency.value = f; g.gain.setValueAtTime(.08, _ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, _ac.currentTime + d); o.connect(g).connect(_ac.destination); o.start(); o.stop(_ac.currentTime + d) } catch {}
}
let modalResolve = null;
function modalEl() { let m = $('#modal'); if (!m) { m = document.createElement('div'); m.id = 'modal'; m.className = 'modal'; document.body.appendChild(m); m.addEventListener('pointerdown', e => { if (e.target === m) resolveModal(null) }) } return m }
function openModal(html, wide) { const m = modalEl(); m.className = 'modal on' + (wide ? ' wide' : ''); m.innerHTML = `<div class="mbox">${html}</div>`; return m }
function resolveModal(v) { const r = modalResolve; modalResolve = null; r && r(v); const m = modalEl(); m.className = 'modal'; m.innerHTML = '' } // read the form BEFORE emptying it
const modalOpen = () => modalEl().classList.contains('on');
function confirmBox(title, body, ok = 'Confirm', tone = 'acc') {
  return new Promise(res => {
    openModal(`<h3>${esc(title)}</h3><div class="mbody">${body}</div><div class="mact"><button class="btn ghost" data-m="no">Cancel</button><button class="btn ${tone}" data-m="yes">${esc(ok)}</button></div>`);
    modalResolve = v => res(!!v); setTimeout(() => $('#modal [data-m=yes]')?.focus(), 30);
  });
}
function formBox(title, fields, ok = 'Save', intro = '') {
  return new Promise(res => {
    const f = x => x.type === 'textarea' ? `<textarea data-f="${x.id}" placeholder="${esc(x.ph || '')}">${esc(x.value ?? '')}</textarea>`
      : x.type === 'select' ? `<select data-f="${x.id}">${x.options.map(o => `<option value="${esc(o[0])}" ${String(o[0]) === String(x.value) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
      : `<input data-f="${x.id}" value="${esc(x.value ?? '')}" inputmode="${x.text ? 'text' : 'decimal'}" placeholder="${esc(x.ph || '')}">`;
    openModal(`<h3>${esc(title)}</h3>${intro ? `<p>${intro}</p>` : ''}<div class="mbody">${fields.map(x => `<label>${esc(x.label)}${f(x)}</label>`).join('')}</div><div class="mact"><button class="btn ghost" data-m="no">Cancel</button><button class="btn acc" data-m="yes">${esc(ok)}</button></div>`);
    modalResolve = v => res(v ? Object.fromEntries($$('#modal [data-f]').map(i => [i.dataset.f, i.value.trim()])) : null);
    setTimeout(() => $('#modal [data-f]')?.focus(), 30);
  });
}
let popEl = null;
function popover(anchor, html, cls = '') {
  closePopover(); const r = anchor.getBoundingClientRect();
  popEl = document.createElement('div'); popEl.className = 'pop ' + cls; popEl.innerHTML = html; document.body.appendChild(popEl);
  popEl.style.left = clamp(r.left, 8, innerWidth - popEl.offsetWidth - 8) + 'px';
  const top = r.bottom + 6; popEl.style.top = (top + popEl.offsetHeight > innerHeight - 8 ? Math.max(8, r.top - popEl.offsetHeight - 6) : top) + 'px';
  popEl._a = anchor; return popEl;
}
function closePopover() { popEl?.remove(); popEl = null }
document.addEventListener('pointerdown', e => { if (popEl && !popEl.contains(e.target) && !popEl._a.contains(e.target)) closePopover() }, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b && b.closest('#modal')) resolveModal(b.dataset.m === 'yes') });

/* ---------- 7. TR1 / TR2 engine (ONE copy: the live chart, the auto-trade bot, the quick backtest and lab.html all use this) ----------
   consolidation -> body-close break -> zone -> retest.
   TR1 = the first consolidation broken in a new direction (CHOCH), TR2 = the next one in the SAME direction (BOS).
   Zone = the breaking candle from its body close to its full wick. Retest of the zone = valid signal.
   Entry = body close of the breaking candle, SL beyond the consolidation. */
function trAtrA(C, n = 14) { const a = []; let v = null; for (let i = 0; i < C.length; i++) { const b = C[i], tr = i ? Math.max(b.high - b.low, Math.abs(b.high - C[i - 1].close), Math.abs(b.low - C[i - 1].close)) : b.high - b.low; v = v == null ? tr : (v * (n - 1) + tr) / n; a.push(v) } return a }
function trScan(C, cfg, o = {}) {
  const n = C.length, closed = o.closed ?? n, A = o.A || trAtrA(C), mb = Math.max(3, cfg.minBars | 0), out = [];
  let lastDir = 0, count = 0, i = Math.max(1, o.from || 1), forming = null;
  while (i + mb <= closed) {
    const lim = A[i + mb - 1] * cfg.rangeAtr; let hi = -Infinity, lo = Infinity;
    for (let k = i; k < i + mb; k++) { hi = Math.max(hi, C[k].high); lo = Math.min(lo, C[k].low) }
    if (hi - lo > lim) { i++; continue }
    let j = i + mb, brk = -1, blown = false;
    for (; j < closed; j++) {
      const b = C[j];
      if (b.close > hi || b.close < lo) { brk = j; break }        // a candle BODY closes outside the range
      const nh = Math.max(hi, b.high), nl = Math.min(lo, b.low);
      if (nh - nl > lim * 1.6) { blown = true; break }            // a huge wick: not a clean range anymore
      hi = nh; lo = nl;
    }
    if (brk < 0) { if (!blown) { forming = { from: i, to: closed - 1, hi, lo }; break } i = j; continue }
    const b = C[brk], dir = b.close > hi ? 1 : -1;
    count = dir === lastDir ? count + 1 : 1; lastDir = dir;
    let zl = dir < 0 ? b.close : b.low, zh = dir < 0 ? b.high : b.close;
    const minH = A[brk] * .05; if (zh - zl < minH) { if (dir < 0) zh = zl + minH; else zl = zh - minH }
    const sl = dir < 0 ? Math.max(hi, b.high) + A[brk] * cfg.slBuf : Math.min(lo, b.low) - A[brk] * cfg.slBuf;
    // wk = the candle where price had left the zone (waiting for the retest from then on): lets a backtest derive any shorter "max wait" without scanning again
    const s = { id: (o.id || '') + b.time + dir, tr: count, dir, box: { from: i, to: brk - 1, hi, lo }, brk, zl, zh, entry: b.close, sl, state: cfg.away ? 'away' : 'wait', wk: cfg.away ? -1 : brk, trig: -1, end: -1, maxR: 0, out: '' };
    for (let k = brk + 1; k < n; k++) {
      const q = C[k];
      // fillKill: this candle came back into the zone (a waiting limit order fills) AND closed beyond the stop = a real −1R trade, not just a dead setup
      if (k < closed && (dir < 0 ? q.close > sl : q.close < sl)) { if (s.state === 'wait' && (dir < 0 ? q.high >= zl : q.low <= zh)) s.fillKill = true; s.state = 'invalid'; s.end = k; break }
      if (s.state === 'away') { if (dir < 0 ? q.high < zl : q.low > zh) { s.state = 'wait'; s.wk = k } continue }
      if (dir < 0 ? q.high >= zl : q.low <= zh) { s.state = 'valid'; s.trig = k; break }
      if (k - brk > cfg.maxAge) { s.state = 'expired'; s.end = k; break }
    }
    out.push(s); i = brk + 1;
  }
  // a break the other way cancels zones that were still waiting (the structure changed) — also in hindsight, so history = what you saw live
  for (const s of out) {
    if (!['away', 'wait', 'valid'].includes(s.state)) continue;
    const t = out.find(x => x.brk > s.brk && x.dir !== s.dir);
    if (t && (s.state !== 'valid' || s.trig > t.brk)) { s.state = 'cancelled'; s.end = t.brk; s.trig = -1 }
  }
  // what happened after the entry. Careful (no wishful fills): on the entry candle only the stop counts, a candle that touches both stop and target is a loss.
  for (const s of out) {
    if (s.state !== 'valid') continue;
    const risk = Math.abs(s.entry - s.sl) || 1e-9, d = s.dir; s.risk = risk; s.out = 'open'; s.path = [];
    for (let k = s.trig; k < n && k < s.trig + 600; k++) {
      const q = C[k];
      if (d < 0 ? q.high >= s.sl : q.low <= s.sl) { s.out = 'sl'; s.end = k; break }
      if (k > s.trig) { s.maxR = Math.max(s.maxR, (d < 0 ? s.entry - q.low : q.high - s.entry) / risk); s.path.push(s.maxR) }
    }
  }
  return { setups: out, forming, atr: A[n - 1], lastDir, count };
}

/* ---------- 8. TR1 JULIUS: the TR1 signal + the STS gold checklist ----------
   Required (one missing = no trade): London / New York session · a clear bias on a higher timeframe (HH + HL up, LH + LL down)
   with the CHOCH in that direction · a refinement zone (POI) inside the consolidation: order block (last opposite candle before
   the break), FVG, or the 0.764 fib of the break leg · the POI in the 0–50 % fib of the swing (discount for buys, premium for sells).
   Optional confluence: liquidity swept (Asia / London high-low, equal highs-lows, previous swing) · POC of the range in the POI ·
   an FVG on the break. Entry = limit at the POI, stop = 30 pips (or beyond the range). A POI high in the range = half risk (or skip).
   Same output as trScan (setups with box / zone / entry / sl / state / trig / outcome), so the chart, panel, bot and backtests use it. */
const JUL_DEF = { mode: 'tr', jSess: 'ln', jBiasTf: 'H1', jSwing: 3, jPoi: 'ob', jSl: 'fixed', jSlPips: 30, jHigh: 'half', jNeedSweep: false, jNeedPoc: false, jNeedInt: false, jTr2: false };
const JUL_SESS = { all: () => true, ln: h => h >= 7 && h < 21, lo: h => h >= 7 && h < 16, ny: h => h >= 12 && h < 21 }; // UTC hours
const JUL_SESS_NAME = { ln: 'London / New York', lo: 'London', ny: 'New York', all: 'any session' };
const julSessName = h => h < 7 ? 'Asia' : h < 12 ? 'London' : h < 16 ? 'London + New York' : h < 21 ? 'New York' : 'after New York'; // UTC hour → market session
function trEngine(C, cfg, o) { return cfg && cfg.mode === 'julius' ? julScan(C, cfg, o) : trScan(C, cfg, o) } // the active TR system
function julPoint(C) { let d = 0; for (let i = Math.max(0, C.length - 60); i < C.length; i++) { const s = String(C[i].close), p = s.indexOf('.'); if (p >= 0) d = Math.max(d, s.length - p - 1) } return Math.pow(10, -Math.min(d, 6)) }
function julScan(C, cfg, o = {}) {
  const q = { ...JUL_DEF, ...cfg }, n = C.length, closed = o.closed ?? n, A = o.A || trAtrA(C), off = o.off ?? (typeof GP !== 'undefined' ? GP.off : 0);
  const base = trScan(C, { ...cfg, away: false }, { ...o, A, closed }), out = [];
  if (n < 60) return { ...base, setups: out };
  const gaps = []; for (let i = Math.max(1, n - 80); i < n; i++) gaps.push(C[i].time - C[i - 1].time); gaps.sort((a, b) => a - b);
  const sec = gaps[gaps.length >> 1] || 60, pip = (o.point || julPoint(C)) * 10, uh = t => new Date((t - off) * 1000).getUTCHours(), uday = t => Math.floor((t - off) / 86400);
  // swings on this timeframe (fractals, L candles each side), known L candles after the swing
  const L = Math.max(2, q.jSwing | 0), PH = [], PL = [];
  for (let i = L; i < closed - L; i++) {
    let h = true, l = true; for (let k = 1; k <= L && (h || l); k++) { if (C[i - k].high >= C[i].high || C[i + k].high > C[i].high) h = false; if (C[i - k].low <= C[i].low || C[i + k].low < C[i].low) l = false }
    if (h) PH.push({ i, p: C[i].high, k: i + L }); if (l) PL.push({ i, p: C[i].low, k: i + L });
  }
  const lastBefore = (arr, k, maxI = Infinity) => { let r = null; for (const x of arr) { if (x.k > k) break; if (x.i < maxI) r = x } return r };
  // bias: the same candles regrouped into the bias timeframe, its swings: HH + HL = up, LH + LL = down (only swings known at that time)
  const bsec = Math.max(TF_SEC[q.jBiasTf] || 3600, sec * 3), HB = [];
  for (let i = 0; i < closed; i++) { const c = C[i], t = Math.floor(c.time / bsec) * bsec, h = HB[HB.length - 1]; if (h && h.t === t) { if (c.high > h.high) h.high = c.high; if (c.low < h.low) h.low = c.low } else HB.push({ t, high: c.high, low: c.low }) }
  const HPH = [], HPL = [];
  for (let i = 2; i < HB.length - 2; i++) {
    let h = true, l = true; for (let k = 1; k <= 2; k++) { if (HB[i - k].high >= HB[i].high || HB[i + k].high > HB[i].high) h = false; if (HB[i - k].low <= HB[i].low || HB[i + k].low < HB[i].low) l = false }
    const known = HB[i + 2].t + bsec; if (h) HPH.push({ p: HB[i].high, t: known }); if (l) HPL.push({ p: HB[i].low, t: known });
  }
  const biasAt = t => { const hs = [], ls = []; for (const x of HPH) { if (x.t > t) break; hs.push(x.p) } for (const x of HPL) { if (x.t > t) break; ls.push(x.p) } if (hs.length < 2 || ls.length < 2) return 0; const [h0, h1] = hs.slice(-2), [l0, l1] = ls.slice(-2); return h1 > h0 && l1 > l0 ? 1 : h1 < h0 && l1 < l0 ? -1 : 0 };
  // session ranges per UTC day: Asia 00–07, London 07–16
  const DAY = new Map();
  for (let i = 0; i < closed; i++) {
    const c = C[i], d = uday(c.time), h = uh(c.time); let r = DAY.get(d); if (!r) DAY.set(d, r = { aH: -Infinity, aL: Infinity, aE: -1, lH: -Infinity, lL: Infinity, lE: -1 });
    if (h < 7) { if (c.high > r.aH) r.aH = c.high; if (c.low < r.aL) r.aL = c.low; r.aE = i } else if (h < 16) { if (c.high > r.lH) r.lH = c.high; if (c.low < r.lL) r.lL = c.low; r.lE = i }
  }
  const sweepOf = (s, w0) => { // a liquidity level taken out (wick through) in the run-up to the break, price back on the right side
    const d = s.dir, dk = uday(C[s.brk].time), day = DAY.get(dk), prev = DAY.get(dk - 1), lv = [];
    const asia = day && day.aE >= 0 && day.aE < w0 ? day : prev && prev.aE >= 0 ? prev : null; if (asia) lv.push([d > 0 ? 'Asia low' : 'Asia high', d > 0 ? asia.aL : asia.aH]);
    if (day && day.lE >= 0 && day.lE < w0) lv.push([d > 0 ? 'London low' : 'London high', d > 0 ? day.lL : day.lH]);
    const sw = (d > 0 ? PL : PH).filter(x => x.k <= w0), ps = sw[sw.length - 1]; if (ps) lv.push([d > 0 ? 'previous swing low' : 'previous swing high', ps.p]);
    const l3 = sw.slice(-3); for (let a = 0; a < l3.length; a++) for (let b = a + 1; b < l3.length; b++) if (Math.abs(l3[a].p - l3[b].p) <= A[w0] * .1) lv.push([d > 0 ? 'equal lows' : 'equal highs', d > 0 ? Math.min(l3[a].p, l3[b].p) : Math.max(l3[a].p, l3[b].p)]);
    let ext = d > 0 ? Infinity : -Infinity; for (let k = w0; k <= s.brk; k++) ext = d > 0 ? Math.min(ext, C[k].low) : Math.max(ext, C[k].high);
    const back = C[s.brk].close; for (const [name, p] of lv) if (d > 0 ? ext < p && back > p : ext > p && back < p) return { name, p };
    return null;
  };
  const pocOf = box => { const lo = box.lo, N = 24, w = (box.hi - lo) / N || 1e-9, bins = new Array(N).fill(0); for (let k = box.from; k <= box.to; k++) { const a = Math.max(0, Math.floor((C[k].low - lo) / w)), b = Math.min(N - 1, Math.floor((C[k].high - lo) / w)); for (let j = a; j <= b; j++) bins[j]++ } let m = 0; for (let j = 1; j < N; j++) if (bins[j] > bins[m]) m = j; return lo + (m + .5) * w };
  const poiName = { ob: 'Order block', fvg: 'FVG', fib: '0.764 fib' }[q.jPoi] || 'Order block';
  for (const s of base.setups) {
    if (!(s.tr === 1 || (q.jTr2 && s.tr === 2))) continue;
    const d = s.dir, brk = s.brk, b = C[brk], box = s.box, a = A[brk], w0 = Math.max(0, box.from - 20), checks = [];
    let fvg = null; if (brk + 1 < closed) { if (d > 0 && C[brk - 1].high < C[brk + 1].low) fvg = { lo: C[brk - 1].high, hi: C[brk + 1].low }; if (d < 0 && C[brk - 1].low > C[brk + 1].high) fvg = { lo: C[brk + 1].high, hi: C[brk - 1].low } }
    // the refinement zone (POI) inside the consolidation
    let zone = null;
    if (q.jPoi === 'fvg') zone = fvg && { ...fvg };
    else if (q.jPoi === 'fib') { const ext = d > 0 ? box.lo : box.hi, top = d > 0 ? b.high : b.low, span = Math.abs(top - ext), lvl = top - d * .764 * span; zone = { lo: lvl - span * .03, hi: lvl + span * .03, fib: true, ext } }
    else for (let k = brk - 1; k >= box.from; k--) { const c = C[k]; if (d > 0 ? c.close < c.open : c.close > c.open) { zone = d > 0 ? { lo: c.low, hi: Math.max(c.open, c.close), k } : { lo: Math.min(c.open, c.close), hi: c.high, k }; break } }
    const bias = biasAt(b.time + sec), bh = uh(b.time), sOk = (JUL_SESS[q.jSess] || JUL_SESS.ln)(bh), want = d > 0 ? 'HH + HL (up)' : 'LH + LL (down)';
    // every check: t = what it is, k = short name, need = what was missing (shown when it is ✗)
    checks.push({ k: 'sess', t: `Break during ${JUL_SESS_NAME[q.jSess] || JUL_SESS_NAME.ln}${q.jSess === 'all' ? '' : ` (${julSessName(bh)})`}`, ok: sOk, req: true, need: `the break came in ${julSessName(bh)}, needs ${JUL_SESS_NAME[q.jSess] || JUL_SESS_NAME.ln}` });
    checks.push({ k: 'bias', t: `${q.jBiasTf} bias ${bias > 0 ? 'up (HH + HL)' : bias < 0 ? 'down (LH + LL)' : 'unclear'} · ${s.tr === 1 ? 'CHOCH' : 'BOS'} ${d > 0 ? 'up' : 'down'}`, ok: bias === d, req: true, need: `${q.jBiasTf} bias was ${bias > 0 ? 'up' : bias < 0 ? 'down' : 'unclear'}, a ${d > 0 ? 'buy' : 'sell'} needs ${want}` });
    checks.push({ k: 'poi', t: zone ? `${poiName} as refinement zone (POI)` : `No ${poiName.toLowerCase()} in the range`, ok: !!zone, req: true, need: `no ${poiName.toLowerCase()} in the range to enter from` });
    let fib = null; { const s1 = lastBefore(d > 0 ? PH : PL, box.from), s0 = s1 && lastBefore(d > 0 ? PL : PH, box.from, s1.i); if (s1 && s0) { const hi = d > 0 ? s1.p : s0.p, lo = d > 0 ? s0.p : s1.p; if (hi > lo) fib = { hi, lo, eq: (hi + lo) / 2 } } }
    const disc = !!(zone && fib && (d > 0 ? zone.hi <= fib.eq : zone.lo >= fib.eq));
    checks.push({ k: 'disc', t: fib ? `POI in the ${d > 0 ? 'discount (below' : 'premium (above'} 50 % of the swing)` : 'No clear swing for the fib', ok: disc, req: true, eq: fib && fib.eq,
      need: !fib ? 'no clear swing to measure the 50 % from' : !zone ? 'no POI to measure' : `the POI is ${d > 0 ? 'above' : 'below'} the 50 % line of the swing, needs ${d > 0 ? 'below (discount)' : 'above (premium)'}` });
    const pos = zone ? (d > 0 ? ((zone.lo + zone.hi) / 2 - box.lo) : (box.hi - (zone.lo + zone.hi) / 2)) / ((box.hi - box.lo) || 1) : 0, high = !!zone && pos > .5;
    if (high) checks.push({ k: 'high', t: `POI ${d > 0 ? 'high' : 'low'} in the range (close to the break): ${q.jHigh === 'skip' ? 'no trade' : 'half risk'}`, ok: q.jHigh !== 'skip', req: true, warn: true, need: 'the POI is close to the break (set to “no trade” in ⚙)' });
    // entry = limit in the POI. With the fixed stop: at the near edge, but never so high that the stop would sit inside the POI
    // (a POI taller than the stop gets the limit deeper in, so the stop is just beyond its far edge)
    const D = (+q.jSlPips || 30) * pip, entryOf = (lo, hi) => q.jSl === 'range' ? (d > 0 ? hi : lo) : d > 0 ? Math.min(hi, lo + D * .9) : Math.max(lo, hi - D * .9);
    const entry = zone ? entryOf(zone.lo, zone.hi) : b.close, slOf = e => q.jSl === 'range' ? (d > 0 ? box.lo - a * (+q.slBuf || .1) : box.hi + a * (+q.slBuf || .1)) : e - d * D, sl = slOf(entry);
    checks.push({ k: 'int', t: `Stop beyond the internal ${d > 0 ? 'low' : 'high'}`, ok: d > 0 ? sl < box.lo : sl > box.hi, req: !!q.jNeedInt, opt: !q.jNeedInt, need: `the stop sits inside the range, not beyond its ${d > 0 ? 'low' : 'high'}` });
    const sw = sweepOf(s, w0); checks.push({ k: 'sweep', t: sw ? `Liquidity swept: ${sw.name}` : 'Liquidity sweep', ok: !!sw, req: !!q.jNeedSweep, opt: !q.jNeedSweep, need: 'no Asia / London high-low, equal highs-lows or previous swing was taken before the break' });
    const poc = pocOf(box); checks.push({ k: 'poc', t: 'POC of the range in the POI', ok: !!zone && poc >= zone.lo - a * .25 && poc <= zone.hi + a * .25, req: !!q.jNeedPoc, opt: !q.jNeedPoc, need: 'the POC of the range is not in the POI' });
    if (q.jPoi !== 'fvg') checks.push({ k: 'fvg', t: 'Imbalance (FVG) on the break', ok: !!fvg, req: false, opt: true });
    const pass = checks.every(c => c.ok || !c.req);
    const z = { id: (o.id || '') + 'J' + b.time + d, tr: s.tr, dir: d, box, brk, zl: zone ? zone.lo : b.close, zh: zone ? zone.hi : b.close, entry, sl, state: pass ? 'wait' : 'filtered', wk: brk, trig: -1, end: -1, maxR: 0, out: '',
      jul: { checks, miss: checks.filter(c => c.req && !c.ok), pass, score: checks.filter(c => c.ok).length, of: checks.length, half: high && q.jHigh !== 'skip', poi: q.jPoi, fib, sweep: sw, poc, fvg, bias } };
    out.push(z); if (!zone) continue;
    // follow price for EVERY setup with a POI. One that missed a check keeps state 'filtered' (never traded or backtested);
    // where price is with it goes into z.ghost, so the chart and panel can still show it as "found, but no trade"
    let legTop = d > 0 ? b.high : b.low, st = 'wait', trig = -1, end = -1, kill = false;
    for (let k = brk + 1; k < n; k++) {
      const c = C[k];
      if (zone.fib) { const nt = d > 0 ? Math.max(legTop, c.high) : Math.min(legTop, c.low); if (nt !== legTop) { legTop = nt; const span = Math.abs(legTop - zone.ext), lvl = legTop - d * .764 * span; z.zl = lvl - span * .03; z.zh = lvl + span * .03; z.entry = entryOf(z.zl, z.zh); z.sl = slOf(z.entry); continue } } // the 0.764 level follows a new extreme; no retest on that candle
      const hit = d < 0 ? c.high >= z.entry : c.low <= z.entry; // the limit fills
      if (k < closed && (d < 0 ? c.close > z.sl : c.close < z.sl)) { kill = hit; st = 'invalid'; end = k; break }
      if (hit) { st = 'valid'; trig = k; break }
      if (k - brk > q.maxAge) { st = 'expired'; end = k; break }
    }
    if (pass) { z.state = st; z.trig = trig; z.end = end; if (kill) z.fillKill = true } else { z.ghost = st; z.gTrig = trig; z.gEnd = end }
  }
  // a break the other way before the retest cancels it (the structure changed), like TR
  for (const z of out) {
    const g = z.state === 'filtered', s0 = g ? z.ghost : z.state, tg = g ? z.gTrig : z.trig; if (s0 !== 'wait' && s0 !== 'valid') continue;
    const t = base.setups.find(x => x.brk > z.brk && x.dir !== z.dir); if (!t || (s0 === 'valid' && tg <= t.brk)) continue;
    if (g) { z.ghost = 'cancelled'; z.gEnd = t.brk; z.gTrig = -1 } else { z.state = 'cancelled'; z.end = t.brk; z.trig = -1 }
  }
  // after the fill: the same careful rules as trScan (stop first on the fill candle and on doubtful candles)
  for (const z of out) {
    if (z.state !== 'valid') continue; const risk = Math.abs(z.entry - z.sl) || 1e-9, d = z.dir; z.risk = risk; z.out = 'open'; z.path = [];
    for (let k = z.trig; k < n && k < z.trig + 600; k++) { const c = C[k]; if (d < 0 ? c.high >= z.sl : c.low <= z.sl) { z.out = 'sl'; z.end = k; break } if (k > z.trig) { z.maxR = Math.max(z.maxR, (d < 0 ? z.entry - c.low : c.high - z.entry) / risk); z.path.push(z.maxR) } }
  }
  // live chart only (o.search): what TR1 Julius is looking for RIGHT NOW, step by step: the bias (= the only direction it trades),
  // the session, the range forming, the 50 % line of the swing and the order block that would be the POI if the range broke now
  let search = null;
  if (o.search && closed > 0) {
    const last = C[closed - 1], bnow = biasAt(last.time + sec), nowU = o.now ?? Math.floor(Date.now() / 1000), hNow = new Date(nowU * 1000).getUTCHours(), sf = JUL_SESS[q.jSess] || JUL_SESS.ln, sessOk = sf(hNow);
    let nextIn = 0; if (!sessOk) for (let k = 1; k <= 24; k++) { const t = (Math.floor(nowU / 3600) + k) * 3600; if (sf(new Date(t * 1000).getUTCHours())) { nextIn = t - nowU; break } }
    const f = base.forming, ref = f ? f.from : closed - 1;
    const fibFor = d => { const s1 = lastBefore(d > 0 ? PH : PL, ref), s0 = s1 && lastBefore(d > 0 ? PL : PH, ref, s1.i); if (!s1 || !s0) return null; const hi = d > 0 ? s1.p : s0.p, lo = d > 0 ? s0.p : s1.p; return hi > lo ? { hi, lo, eq: (hi + lo) / 2 } : null };
    const obFor = d => { if (!f || q.jPoi !== 'ob') return null; for (let k = f.to; k >= f.from; k--) { const c = C[k]; if (d > 0 ? c.close < c.open : c.close > c.open) return d > 0 ? { lo: c.low, hi: Math.max(c.open, c.close) } : { lo: Math.min(c.open, c.close), hi: c.high } } return null };
    search = { bias: bnow, biasTf: q.jBiasTf, sessOk, sess: julSessName(hNow), want: JUL_SESS_NAME[q.jSess] || JUL_SESS_NAME.ln, nextIn, forming: f, poiName, fib: { 1: fibFor(1), '-1': fibFor(-1) }, ob: { 1: obFor(1), '-1': obFor(-1) } };
  }
  return { ...base, setups: out, search };
}
