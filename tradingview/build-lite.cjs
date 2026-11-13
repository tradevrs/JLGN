// Builds VRS-Indicator-Lite.pine (free) from VRS-Indicator-Pro.pine (VIP). Run: node build-lite.cjs
// Lite = ZONES ONLY: ranges, VA1 / VA2 breaks and the zone, plus an alert when a new zone appears.
// Lite has NO entry, stop, take profit, R levels, BUY/SELL signal tags, grades, backtest card, exit plans, filters,
// multi-timeframe strip, retest ("valid") alerts or JSON alerts. That code is REMOVED from the file, not switched off,
// so nobody can turn it back on by editing a setting. Everything else (when to enter, where the stop goes,
// how to manage it) is VRS Indicator Pro, part of VRS VIP.
const fs = require('fs'), path = require('path');
let s = fs.readFileSync(path.join(__dirname, 'VRS-Indicator-Pro.pine'), 'utf8').replace(/\r\n/g, '\n');

// 1 · settings that only make sense in Pro become constants (their input disappears from the settings window)
const fixed = { // input name → the constant Lite uses
  tpModeIn: 'TP_FIXED', tpTfIn: '"The trade\'s own timeframe"', beIn: '"Off"', partIn: '"Off"', filtIn: 'FILT_OFF', sessIn: 'SESS_ALL',
  failIn: '"Dim (small, no alerts)"', trailIn: 'false', mtfOn: 'false', gradeAl: '"All grades"', gradeTag: 'false', statsOn: 'false', statsT: '2.0', alFmt: '"Text"',
  tpR: '0.0', rrIn: 'false', rHitIn: 'R_HIDE', maxRun: '1', histIn: '"Small (arrow + result)"', alValid: 'false', alNear: 'false',
};
let n = 0;
for (const [k, v] of Object.entries(fixed)) {
  const re = new RegExp(`^(\\s*(?:string|bool|float|int)\\s+${k}\\s*=\\s*)input\\.[a-z]+\\(.*$`, 'm');
  if (!re.test(s)) throw new Error('input not found: ' + k);
  s = s.replace(re, `$1${v} // VIP only`); n++;
}
const rep = (a, b) => { if (!s.includes(a)) throw new Error('not found: ' + a.slice(0, 60)); s = s.split(a).join(b) };

// 2 · whole blocks cut out, found by their exact lines (Pine is indentation-based, so lines are matched with their tabs)
function cut(startLine, endLine, insert = []) { // removes [startLine, endLine): endLine is the first exact match after startLine, or null = to the end
  const L = s.split('\n');
  const hits = L.reduce((a, x, i) => (x === startLine ? a.concat(i) : a), []);
  if (hits.length !== 1) throw new Error(`start line found ${hits.length}×: ${JSON.stringify(startLine)}`);
  const a = hits[0], b = endLine === null ? L.length : L.findIndex((x, i) => i > a && x === endLine);
  if (b < 0) throw new Error('end line not found: ' + JSON.stringify(endLine));
  L.splice(a, b - a, ...insert); s = L.join('\n');
}
// alerts: only "new zone", without entry / stop / take profit / grade
cut('alertMsg(Setup s, string ev) =>', 'stepSetup(Setup s, bool closedBar) =>', [
  'alertMsg(Setup s, string ev) =>',
  '\t(s.dir < 0 ? "▼" : "▲") + " New VA" + str.tostring(s.trNum) + " zone on " + syminfo.ticker + " " + timeframe.period + ": " + fmt(s.zl) + " – " + fmt(s.zh)']);
// the exit-plan description (only the Pro panel used it)
cut('exitDesc() =>', 'sessOk(int h) =>');
// the backtest statistics
cut('\t\t\tif res != 0 and shown(s) and s.pass', '\t\t\tif alive and s.state == ST_WAIT and not s.nearSent and shown(s) and s.pass and gradeOk(s)');
// the A / B / C grade score
cut('\t\t\tint   agree = dir > 0 ? htfUp : htfDn', '\t\t\tarray<Setup> keep2 = array.new<Setup>()');
// alert() calls + alertconditions: only the new-zone alert stays
cut('if alValid and validMsg != ""', 'if barstate.islast', [
  'if alZone and zoneMsg != ""',
  '\talert(zoneMsg, alert.freq_once_per_bar_close)',
  'alertcondition(newZone, "VRS new zone", "New VRS zone on {{ticker}} {{interval}}: a candle body closed outside the range")']);
// older setups: no entry dot, no result in R
cut('\t\t\tif z.state == ST_VALID', '\t\t\tcontinue');
// the zone stays; the trade (entry, stop, risk band, TP, R levels, BE / partial lines, BUY / SELL tags) is gone.
// After the retest the zone simply ends where price came back into it.
cut('\t\tif zLive', '\tif rMode == 1', [
  '\t\tif zLive',
  '\t\t\tbox.new(cx(z.brk), z.zh, bi, z.zl, border_color = fade(col, lt ? 0.8 : 0.6), border_width = 1, bgcolor = fade(col, lt ? 0.14 : 0.18), extend = extend.right, text = trS + (z.dir < 0 ? " SELL" : " BUY") + " ZONE", text_size = szC, text_color = fade(col, 0.9), text_halign = text.align_right, text_valign = text.align_center, text_formatting = text.format_bold)',
  '\t\telse if z.state == ST_VALID',
  '\t\t\tbox.new(cx(z.brk), z.zh, cx(z.trig), z.zl, border_color = fade(col, lt ? 0.5 : 0.35), border_width = 1, bgcolor = fade(col, lt ? 0.07 : 0.09))']);
// the panel: never shows a valid trade, an entry, a stop, a limit button, the structure strip or the backtest card
cut('\t\t\t\telse if s.state == ST_VALID and s.outc == OUT_OPEN and s.trig >= n - 15', '\t\tfloat  dist   = 0.0');
cut('\t\tint chSec = timeframe.in_seconds()', null, [
  '\t\tif not panelCol',
  '\t\t\tif not na(liveS)',
  '\t\t\t\tpRow(pnl, r, (almost ? "⚡ " : "⏳ ") + dS + " ZONE · VA" + str.tostring(liveS.trNum), pTxt, "", pMut, lc, pBg, szL, true)',
  '\t\t\t\tr += 1',
  '\t\t\t\tpRow(pnl, r, "Zone " + fmt(liveS.zl) + " – " + fmt(liveS.zh), pTxt, "", pMut, lc, pBg, szS, false)',
  '\t\t\t\tr += 1',
  '\t\t\t\tpRow(pnl, r, liveS.state == ST_AWAY ? "price is moving away from the zone" : dist > 0 ? pt(dist) + " from the zone" : "price is in the zone", pMut, "", pMut, lc, pBg, szS, false)',
  '\t\t\t\tr += 1',
  '\t\t\telse if rMode == 1',
  '\t\t\t\tpRow(pnl, r, "⏳ Range forming", pTxt, "", pMut, pMut, pBg, szL, true)',
  '\t\t\t\tr += 1',
  '\t\t\t\tpRow(pnl, r, str.tostring(fTo - rFrom + 1) + " bars · " + fmt(rLo) + " – " + fmt(rHi), pMut, "", pMut, pMut, pBg, szS, false)',
  '\t\t\t\tr += 1',
  '\t\t\telse',
  '\t\t\t\tpRow(pnl, r, "No range or zone right now", pTxt, "", pMut, pMut, pBg, szL, true)',
  '\t\t\t\tr += 1',
  '\t\t\tpRow(pnl, r, "Entry, stop, R levels, grades & MT5 autotrade: VRS VIP", pMut, "", pMut, pHdr, pHdr, szS, false)',
  '\t\t\tr += 1',
  '']);

// 3 · names, texts and settings
rep('// VRS Indicator Pro · VRS Strategy (VA1 / VA2) by Value Research Systems (paid, invite-only). VRS-Indicator-Lite.pine is generated from this file: node build-lite.cjs',
  '// VRS Indicator Lite · VRS Strategy zones (VA1 / VA2) by Value Research Systems (free). Generated from VRS-Indicator-Pro.pine: do not edit by hand.\n// Lite shows the ranges, the breaks and the zones. Entries, stops, R levels, grades, the backtest card and MT5 autotrade are in VRS VIP.');
rep('\t\tif not na(recS)\n\t\t\tmini  := (recS.dir < 0 ? "▼ VALID SELL VA" : "▲ VALID BUY VA") + str.tostring(recS.trNum) + " @ " + fmt(recS.entry)\n\t\t\tminiC := recS.dir < 0 ? pSell : pBuy\n\t\telse if not na(liveS)',
  '\t\tif not na(liveS)'); // the collapsed panel line: never a valid trade
rep('bool  jsonOn = alFmt == "JSON (webhook)"\n', ''); // no webhook alerts in Lite
rep('G_TR    = "VA1 / VA2 signals"', 'G_TR    = "VA1 / VA2 zones"');
rep('"Stop buffer (× ATR)"', '"Zone dies beyond the range + (× ATR)"');
rep('"Max candles to wait for the retest"', '"Max candles a zone stays on the chart"');
rep('indicator("VRS Indicator Pro · VRS trades (VA1 / VA2): entry, stop, grades", shorttitle = "VRS Indicator Pro",', 'indicator("VRS Indicator Lite · VRS zones (VA1 / VA2)", shorttitle = "VRS Indicator Lite",');
rep('(gradeTag ? " · " + z.grade : ""), color = color(na), style = label.style_label_lower_left, textcolor = col, size = szC, text_formatting = text.format_bold, tooltip = z.gWhy)',
  '"", color = color(na), style = label.style_label_lower_left, textcolor = col, size = szC, text_formatting = text.format_bold)');
s = s.replace(/^(\s*bool\s+alZone\s*=\s*)input\.bool\((?:true|false),/m, '$1input.bool(true,'); // Lite: the new-zone alert is on by default

// 4 · safety net: nothing of the trade may survive in Lite
for (const bad of ['"SL "', '"TP "', 'R ✓', '"BUY" :', 'Set " + dS + " limit', 'VALID BUY', 'BACKTEST', 'JSON', '\\"entry\\"', 'alert(validMsg', 'alert(nearMsg'])
  if (s.includes(bad)) throw new Error('Lite still contains: ' + bad);
fs.writeFileSync(path.join(__dirname, 'VRS-Indicator-Lite.pine'), s);
console.log(`VRS-Indicator-Lite.pine written: zones only · ${n} VIP settings fixed · ${s.split('\n').length} lines`);
