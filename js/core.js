/* Shared foundation: canvas, state, audio, particles. No game logic here. */
export const $ = s => document.querySelector(s);
export const W = 360, H = 480, TAU = Math.PI * 2;
export const cv = $('#cv'), c = cv.getContext('2d');
/* roundRect is missing on older iOS WebViews (before Safari 16): small fallback */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.max(0, Math.min(Array.isArray(r) ? r[0] : r || 0, w / 2, h / 2));
    this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
  };
}

/* ---------- Telegram ---------- */
export const tg = window.Telegram && Telegram.WebApp;
try {
  tg && (tg.ready(), tg.expand(),
    tg.setHeaderColor && tg.setHeaderColor('#15123b'),
    tg.setBackgroundColor && tg.setBackgroundColor('#15123b'),
    tg.disableVerticalSwipes && tg.disableVerticalSwipes());
} catch (e) {}
export const hap = t => { try { tg.HapticFeedback.notificationOccurred(t); } catch (e) {} };
const tu = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
export const uname = tu && tu.first_name ? tu.first_name : 'You';
export const DEV = /[?&]dev=1/.test(location.search);

/* ---------- Shared run state ---------- */
export const S = { score: 0, over: 0, cur: null, cid: '', shk: 0, best: {}, mute: false, onEnd: null };
try { S.best = JSON.parse(localStorage.gh || '{}'); } catch (e) {}
try { S.mute = localStorage.gm == '1'; } catch (e) {}
export const saveBest = () => { try { localStorage.gh = JSON.stringify(S.best); } catch (e) {} };
export const K = { l: 0, r: 0, j: 0 };

/* ---------- Helpers ---------- */
export const rnd = n => Math.floor(Math.random() * n);
export const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export const angd = x => ((x + Math.PI) % TAU + TAU) % TAU - Math.PI;
export const clock = { t: () => performance.now() / 1000 }; // swappable in tests
export const HP = 'M12 21C5 16 2 12.5 2 8.8 2 6 4.1 4 6.6 4c2 0 3.7 1 5.4 3 1.7-2 3.4-3 5.4-3C19.9 4 22 6 22 8.8 22 12.5 19 16 12 21z';
export const cloud = (x, y) => {
  c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath();
  c.ellipse(x, y, 30, 13, 0, 0, 7); c.ellipse(x + 20, y - 8, 20, 13, 0, 0, 7); c.ellipse(x - 18, y - 4, 16, 10, 0, 0, 7); c.fill();
};

/* ---------- Sound (WebAudio, no audio files) ---------- */
let AC = null;
export function au() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (AC && AC.state == 'suspended') AC.resume();
  return AC;
}
export function tone(f, d, ty, v, to, dl) {
  if (S.mute) return;
  const a = au(); if (!a) return;
  const t = a.currentTime + (dl || 0), o = a.createOscillator(), g = a.createGain();
  o.type = ty || 'square'; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(v || .1, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .03);
}
const SFX = {
  jump: () => tone(300, .22, 'square', .09, 760),
  coin: () => { tone(988, .07, 'square', .08); tone(1319, .22, 'square', .08, 0, .07); },
  stomp: () => tone(260, .16, 'square', .12, 70),
  bump: () => tone(160, .08, 'triangle', .14, 90),
  die: () => [392, 330, 262, 196].forEach((f, i) => tone(f, .2, 'triangle', .15, 0, i * .15)),
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .16, 'square', .09, 0, i * .1)),
  eat: () => tone(520, .09, 'square', .09, 1040),
  move: () => tone(220, .04, 'triangle', .06),
  flap: () => tone(360, .12, 'sine', .15, 640),
  point: () => { tone(880, .06, 'square', .07); tone(1175, .14, 'square', .07, 0, .06); },
  tap: () => tone(520, .07, 'triangle', .12, 700),
  ai: () => tone(380, .08, 'triangle', .12, 260),
  rot: () => { tone(300, .05, 'triangle', .12, 520); tone(740, .08, 'sine', .06, 0, .03); },
};
export const sfx = n => { try { SFX[n](); } catch (e) {} };

/* ---------- Particles and screen shake ---------- */
export const PT = [];
export function burst(x, y, col, n, sp) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, s = (.4 + Math.random()) * (sp || 2);
    PT.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, l: 1, c: Array.isArray(col) ? col[rnd(col.length)] : col });
  }
}
export function stepP(f) {
  for (const p of PT) { p.x += p.vx * f; p.y += p.vy * f; p.vy += .12 * f; p.l -= .025 * f; }
  for (let i = PT.length - 1; i >= 0; i--) if (PT[i].l <= 0) PT.splice(i, 1);
  if (S.shk > 0) S.shk = Math.max(0, S.shk - f);
}
export function drawP() {
  for (const p of PT) { c.globalAlpha = Math.max(0, p.l); c.fillStyle = p.c; c.fillRect(p.x - 2, p.y - 2, 4, 4); }
  c.globalAlpha = 1;
}

/* ---------- End of a run ---------- */
export function end(m, win) {
  if (S.over) return;
  S.over = 1;
  const w = win != null ? !!win : !!m && m.includes('win');
  if (w) { sfx('win'); burst(180 + (S.cur && S.cur.cam || 0), 200, ['#ffc83d', '#ff6b4a', '#3ee0a0', '#5cc8ff'], 44, 4.5); }
  else { sfx('die'); S.shk = 14; hap('error'); }
  if (S.score > (S.best[S.cid] || 0)) { S.best[S.cid] = S.score; saveBest(); }
  if (S.cur && S.cur.leave) S.cur.leave();
  S.onEnd && S.onEnd(m || 'Game over', w);
  setTimeout(() => { if (S.over && S.cur) $('#ov').classList.add('on'); }, w ? 900 : 600);
}
