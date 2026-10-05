/* Lives, coins, XP, daily bonus, badges, shop, ads, toasts and modals. */
import { $, S, sfx, hap, uname, DEV } from './core.js';

/* ---------- Toasts (queued) ---------- */
const TQ = []; let tb = 0;
export function toast(m) { TQ.push(m); if (!tb) nextToast(); }
function nextToast() {
  const m = TQ.shift(), t = $('#toast');
  if (!m) { tb = 0; t.classList.remove('on'); return; }
  tb = 1; t.textContent = m; t.classList.add('on'); setTimeout(nextToast, 2300);
}

/* ---------- Lives ---------- */
const MAXF = 3, REG = 30 * 60 * 1000, LK = 'gh_lives';
const HEART = 'M12 21C5 16 2 12.5 2 8.8 2 6 4.1 4 6.6 4c2 0 3.7 1 5.4 3 1.7-2 3.4-3 5.4-3C19.9 4 22 6 22 8.8 22 12.5 19 16 12 21z';
export let LV = { n: MAXF, t: 0 };
let pend = null, adBusy = 0, AD = null, starter = null;
try { const s = JSON.parse(localStorage[LK]); if (s && typeof s.n == 'number' && s.n >= 0) LV = { n: Math.floor(s.n), t: +s.t || 0 }; } catch (e) {}
const saveL = () => { try { localStorage[LK] = JSON.stringify(LV); } catch (e) {} };
const norm = () => { if (LV.n >= MAXF) LV.t = 0; else if (!LV.t) LV.t = Date.now(); };
export function regen() {
  const now = Date.now(); if (LV.t > now) LV.t = now;
  if (LV.n < MAXF && LV.t) {
    const k = Math.floor((now - LV.t) / REG);
    if (k > 0) { LV.n = Math.min(MAXF, LV.n + k); LV.t += k * REG; norm(); saveL(); }
  }
}
export function useLife() { regen(); if (LV.n < 1) return false; LV.n--; norm(); saveL(); lifeUI(); return true; }
export function addLife() { regen(); LV.n++; norm(); saveL(); lifeUI(); }
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const nextIn = () => LV.t ? mmss(LV.t + REG - Date.now()) : '';
export function lifeUI() {
  let h = '';
  for (let i = 0; i < MAXF; i++) h += `<svg viewBox="0 0 24 24" class="${i < LV.n ? '' : 'e'}"><path d="${HEART}"/></svg>`;
  $('#hearts').innerHTML = h + (LV.n > MAXF ? `<span class="ex">+${LV.n - MAXF}</span>` : '');
  $('#lvs').textContent = LV.n >= MAXF ? (LV.n > MAXF ? LV.n + ' lives · 1 per game' : 'Full · 1 life per game') : 'Next life in ' + nextIn();
  $('#nlt').textContent = LV.t ? 'Next free life in ' + nextIn() : '';
  $('#oc').textContent = LV.n ? LV.n + (LV.n == 1 ? ' life left' : ' lives left') : 'No lives left';
}
export const openNL = () => { $('#nl').classList.add('on'); lifeUI(); };
export const closeNL = () => $('#nl').classList.remove('on');
export const setStarter = f => { starter = f; };
/* Start a game if the player can pay a life; otherwise show the "out of lives" sheet. */
export function tryPlay(k) {
  if (!useLife()) { pend = k; openNL(); sfx('bump'); return; }
  starter(k);
}
/* For in-game restarts (e.g. a new Tic-Tac-Toe round). */
export function spendLife() {
  if (useLife()) return true;
  pend = S.cid; openNL(); return false;
}
function gain() {
  P.st.ads++; saveP(); chk(); addLife(); sfx('coin'); hap('success'); toast('+1 life');
  if (pend) { const k = pend; pend = null; closeNL(); tryPlay(k); }
}
function watchAd() {
  if (adBusy) return;
  if (!AD && window.Adsgram) { try { AD = window.Adsgram.init({ blockId: 'int-38036' }); } catch (e) {} }
  if (!AD) {
    if (DEV) { adBusy = 1; toast('Dev mode: simulating an ad…'); setTimeout(() => { adBusy = 0; gain(); }, 1500); }
    else toast('Ads are not available right now. Try again soon.');
    return;
  }
  adBusy = 1;
  AD.show().then(r => { adBusy = 0; if (r && r.done) gain(); else toast('Ad was not completed. No life added.'); })
    .catch(() => { adBusy = 0; toast('No ad available. Try again soon.'); });
}
$('#adBtn').onclick = $('#nlAd').onclick = watchAd;
$('#nlX').onclick = () => { pend = null; closeNL(); };

/* ---------- Profile: coins, XP, daily bonus, badges, shop ---------- */
const PK = 'gh_profile';
const DR = [{ c: 20 }, { c: 30 }, { c: 40 }, { c: 50 }, { c: 60 }, { c: 80 }, { c: 100, l: 1 }];
/* coins earned per score point (capped at 40 per game) */
const RM = { orbit: .08, prism: .1, pulse: .002, quest: .04, snake: .1, flap: 2, stack: 2, mem: .04 };
export let P = { coins: 0, xp: 0, lvl: 1, dd: '', ds: 0, st: {}, ach: {} };
try { const s = JSON.parse(localStorage[PK]); if (s && typeof s == 'object') P = Object.assign(P, s); } catch (e) {}
P.st = Object.assign({ games: 0, ads: 0, tw: 0, mw: 0 }, P.st); P.ach = P.ach || {};
const saveP = () => { try { localStorage[PK] = JSON.stringify(P); } catch (e) {} };
const need = l => 60 + 40 * (l - 1);
export const dk = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
const COIN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffc83d"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#b88a00" stroke-width="2"/></svg>';
const B = k => S.best[k] || 0;
export const ACH = [
  { id: 'g1', n: 'First steps', d: 'Play your first game', r: 10, t: 1, v: () => P.st.games },
  { id: 'g10', n: 'Warming up', d: 'Play 10 games', r: 30, t: 10, v: () => P.st.games },
  { id: 'g50', n: 'Regular', d: 'Play 50 games', r: 100, t: 50, v: () => P.st.games },
  { id: 'or', n: 'Star keeper', d: 'Score 300 in Lumen Orbit', r: 40, t: 300, v: () => B('orbit') },
  { id: 'pr', n: 'Light bender', d: 'Score 800 in Prism Path', r: 40, t: 800, v: () => B('prism') },
  { id: 'pu', n: 'On the beat', d: 'Score 10000 in Pulse Rail', r: 50, t: 10000, v: () => B('pulse') },
  { id: 'qu', n: 'Runner', d: 'Score 500 in Jump Quest', r: 40, t: 500, v: () => B('quest') },
  { id: 'sn', n: 'Long snake', d: 'Score 150 in Snake', r: 40, t: 150, v: () => B('snake') },
  { id: 'fl', n: 'Sky dash', d: 'Pass 10 pipes in Flap Dash', r: 40, t: 10, v: () => B('flap') },
  { id: 'st', n: 'Skyscraper', d: 'Stack 15 layers', r: 40, t: 15, v: () => B('stack') },
  { id: 'me', n: 'Sharp memory', d: 'Win Memory Match', r: 40, t: 1, v: () => P.st.mw },
  { id: 'tt', n: 'Strategist', d: 'Win 3 Tic-Tac-Toe rounds', r: 40, t: 3, v: () => P.st.tw },
  { id: 'ds', n: 'Regular visitor', d: 'Reach a 3-day daily streak', r: 50, t: 3, v: () => P.ds },
  { id: 'l5', n: 'Rising star', d: 'Reach level 5', r: 60, t: 5, v: () => P.lvl },
  { id: 'ad', n: 'Supporter', d: 'Watch 5 ads', r: 30, t: 5, v: () => P.st.ads },
];
export function dstate() {
  const n = new Date(), td = dk(n);
  if (P.dd == td) return { can: 0, day: ((P.ds - 1) % 7) + 1 };
  const y = new Date(n.getFullYear(), n.getMonth(), n.getDate() - 1), ns = P.dd == dk(y) ? P.ds + 1 : 1;
  return { can: 1, ns, day: ((ns - 1) % 7) + 1 };
}
export function pui() {
  $('#lvb').textContent = P.lvl; $('#pfn').textContent = uname;
  $('#xpf').style.width = Math.min(100, P.xp / need(P.lvl) * 100) + '%';
  $('#xpt').textContent = P.xp + ' / ' + need(P.lvl) + ' XP';
  $('#coins').textContent = P.coins.toLocaleString('en-US');
  $('#dDot').classList.toggle('on', !!dstate().can);
}
export function chk() {
  for (const a of ACH) if (!P.ach[a.id] && a.v() >= a.t) {
    P.ach[a.id] = 1; P.coins += a.r; toast('Badge unlocked: ' + a.n + ' · +' + a.r + ' coins'); sfx('coin');
  }
  saveP(); pui();
}
function addXP(n) {
  P.xp += n; let up = 0;
  while (P.xp >= need(P.lvl)) { P.xp -= need(P.lvl); P.lvl++; up++; P.coins += 30; }
  saveP(); pui();
  if (up) { sfx('win'); toast('Level up! You are level ' + P.lvl + ' · +' + 30 * up + ' coins'); }
}
/* Called at the end of every run (and every Tic-Tac-Toe round). Returns the text shown to the player. */
export function reward(g, sc, res) {
  let co;
  if (g == 'ttt') co = res == 1 ? 10 : res == 3 ? 3 : 1;
  else co = Math.min(40, Math.floor(sc * (RM[g] || 0)));
  P.st.games++; if (g == 'ttt' && res == 1) P.st.tw++; if (g == 'mem' && res == 1) P.st.mw++;
  P.coins += co; saveP(); addXP(10 + co); chk();
  return (co ? '+' + co + ' coins · ' : '') + '+' + (10 + co) + ' XP';
}

/* ---------- Modals ---------- */
const openM = h => { $('#mdb').innerHTML = h; $('#md').classList.add('on'); };
const closeM = () => { $('#md').classList.remove('on'); pend = null; };
export function openDaily() {
  const s = dstate(); let t = '';
  DR.forEach((r, i) => {
    const d = i + 1, cl = s.can ? (d < s.day ? 'done' : d == s.day ? 'now' : '') : (d <= s.day ? 'done' : '');
    t += `<div class="dt ${cl}"><span>Day ${d}</span><b>+${r.c}</b><span>${r.l ? '+1 life' : 'coins'}</span></div>`;
  });
  openM(COIN + `<h3>Daily bonus</h3><p>${s.can ? 'Claim your day ' + s.day + ' reward' : 'Claimed today. Come back tomorrow!'}</p><div class="dg">${t}</div>
 <button class="btn${s.can ? '' : ' dis'}" data-a="${s.can ? 'claim' : 'x'}">${s.can ? 'Claim' : 'Done for today'}</button>${s.can ? '<button class="btn g" data-a="x">Later</button>' : ''}`);
}
function claimDaily() {
  const s = dstate(); if (!s.can) return;
  const r = DR[s.day - 1]; P.dd = dk(new Date()); P.ds = s.ns; P.coins += r.c; saveP(); if (r.l) addLife();
  sfx('win'); toast('+' + r.c + ' coins' + (r.l ? ' · +1 life' : '')); chk(); closeM();
}
function openBadges() {
  const n = Object.keys(P.ach).length; let t = '';
  for (const a of ACH) {
    const v = Math.min(a.v(), a.t), ok = P.ach[a.id];
    t += `<div class="ar${ok ? ' ok' : ''}"><span class="ai">${ok ? '✓' : ''}</span><div class="at"><b>${a.n}</b><small>${a.d}</small><div class="pb"><i style="width:${v / a.t * 100}%"></i></div></div><em>+${a.r}</em></div>`;
  }
  openM(`<h3>Badges</h3><p>${n} of ${ACH.length} unlocked</p><div class="al">${t}</div><button class="btn g" data-a="x">Close</button>`);
}
export function openShop() {
  openM(COIN + `<h3>Shop</h3><p>You have ${P.coins.toLocaleString('en-US')} coins</p>
 <button class="btn${P.coins < 120 ? ' dis' : ''}" data-a="b1">1 life · 120 coins</button>
 <button class="btn${P.coins < 330 ? ' dis' : ''}" data-a="b3">3 lives · 330 coins</button>
 <p class="sm">Earn coins by playing games and from the daily bonus.</p><button class="btn g" data-a="x">Close</button>`);
}
function buy(n, cost) {
  if (P.coins < cost) return;
  P.coins -= cost; saveP(); for (let i = 0; i < n; i++) addLife();
  sfx('coin'); toast('+' + n + (n > 1 ? ' lives' : ' life')); pui();
  const k = pend; pend = null;
  if (k) { $('#md').classList.remove('on'); tryPlay(k); } else openShop();
}
function openHelp() {
  const r = [
    ['Lives', 'Each game uses 1 life. You start with 3. One free life comes back every 30 minutes (up to 3). Watching an ad gives +1 life with no limit.'],
    ['Coins and XP', 'Every game earns XP and coins based on your score. Level-ups give bonus coins. Spend coins in the Shop on extra lives.'],
    ['Daily bonus', 'Open the app every day to build a 7-day streak. Day 7 also gives a free life.'],
    ['Badges', ACH.length + ' badges to unlock, each with a coin reward.'],
    ['Leaderboard', 'Your best score is saved on this device. Other players shown are samples until real rankings launch.'],
  ];
  openM('<h3>How it works</h3><div class="al">' + r.map(x => `<div class="hp"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('') + '</div><button class="btn g" data-a="x">Close</button>');
}
$('#mdb').onclick = e => {
  const b = e.target.closest('[data-a]'); if (!b) return;
  const a = b.dataset.a; if (a == 'x') return closeM();
  if (b.classList.contains('dis')) return;
  if (a == 'claim') claimDaily(); else if (a == 'b1') buy(1, 120); else if (a == 'b3') buy(3, 330);
};
$('#bHelp').onclick = openHelp;
$('#bDaily').onclick = openDaily; $('#bBadge').onclick = openBadges; $('#bShop').onclick = openShop;
$('#nlShop').onclick = () => { closeNL(); openShop(); };
