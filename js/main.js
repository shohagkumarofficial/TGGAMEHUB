/* Entry point: menu, game loop, touch + keyboard controls, wiring. */
import { $, W, H, c, cv, S, K, PT, DEV, tg, au, sfx, stepP, drawP, clock } from './core.js';
import { G } from './registry.js';
import { tryPlay, setStarter, regen, lifeUI, pui, dstate, openDaily, reward, toast, LV, P } from './economy.js';
import { openLb } from './leaderboard.js';

/* ---------- Menu ---------- */
let raf = 0, last = 0, ls = 0;
function leave() { if (S.cur && S.cur.leave) S.cur.leave(); }
function menu() {
  cancelAnimationFrame(raf); leave(); S.cur = null;
  $('#play').classList.remove('on'); $('#lb').classList.remove('on'); $('#home').classList.add('on');
  $('#grid').innerHTML = Object.entries(G).map(([k, v], i) =>
    `<button class="gc${i == 0 ? ' hero' : ''}" data-g="${k}" style="animation-delay:${i * 70}ms"><div class="ic" style="background:${v.bg}"><svg viewBox="${v.vb || '0 0 64 64'}">${v.ic}</svg></div><b>${v.n}</b>${v.d ? `<small>${v.d}</small>` : ''}<span>Best: ${S.best[k] || 0}</span></button>`).join('');
}

/* ---------- On-screen controls ---------- */
const arrow = '<svg viewBox="0 0 24 24"><path d="M12 5l8 11H4z"/></svg>';
function buildControls(t) {
  const e = $('#ctl'), a = (k, r) => `<button data-k="${k}" style="--r:${r}deg" aria-label="${k}">${arrow}</button>`;
  e.className = t == 'pads' ? 'dpad' : t;
  e.innerHTML = t == 'quest' ? a('l', -90) + a('r', 90) + '<button class="jmp" data-k="j">Jump</button>'
    : t == 'dpad' || t == 'pads' ? a('u', 0) + a('l', -90) + a('d', 180) + a('r', 90)
    : t == 'orbit' ? '<button class="jmp alt" data-k="i">In</button><button class="jmp" data-k="o">Out</button>'
    : t == 'tap' ? `<button class="jmp" data-k="t">${S.cur.lbl || 'Tap'}</button>` : '';
}

/* ---------- Run lifecycle ---------- */
function start(k) {
  leave();
  S.cid = k; S.cur = G[k].o; S.over = 0; S.score = 0; ls = -1; S.shk = 0;
  K.l = K.r = K.j = 0; Object.keys(held).forEach(i => delete held[i]); PT.length = 0;
  S.cur.init();
  $('#ttl').textContent = G[k].n;
  $('#home').classList.remove('on'); $('#play').classList.add('on'); $('#ov').classList.remove('on');
  buildControls(S.cur.ctl);
  cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop);
}
function loop(t) {
  const dt = Math.min(t - last, 50), f = dt / 16.67; last = t;
  const cur = S.cur; if (!cur) return;
  if (!S.over && cur.tick) cur.tick(f, dt);
  stepP(f);
  c.save(); if (S.shk > 0) c.translate((Math.random() - .5) * S.shk, (Math.random() - .5) * S.shk);
  cur.draw(); c.save(); c.translate(-(cur.cam | 0), 0); drawP(); c.restore(); c.restore();
  if (S.score != ls) {
    ls = S.score; const s = $('#sc'); s.textContent = S.score;
    if (s.animate) s.animate([{ transform: 'scale(1.6)', color: '#ffc83d' }, { transform: 'scale(1)' }], { duration: 220 });
  }
  raf = requestAnimationFrame(loop);
}
setStarter(start);
S.onEnd = (m, w) => {
  $('#orw').textContent = reward(S.cid, S.score, w ? 1 : 0);
  $('#om').textContent = m;
  $('#os').textContent = 'Score ' + S.score + ' · Best ' + (S.best[S.cid] || 0);
};

/* ---------- Buttons ---------- */
$('#grid').onclick = e => { const b = e.target.closest('.gc'); b && tryPlay(b.dataset.g); };
$('#back').onclick = $('#menu').onclick = menu;
$('#again').onclick = () => tryPlay(S.cid);
$('#lbBtn').onclick = openLb;
$('#lbBack').onclick = menu;
$('#share').onclick = () => {
  const u = 'https://t.me/TGGAMEHUBBOT/app', t = 'I scored ' + S.score + ' in ' + G[S.cid].n + ' on Games Hub! Can you beat me?',
    l = 'https://t.me/share/url?url=' + encodeURIComponent(u) + '&text=' + encodeURIComponent(t);
  try { if (tg && tg.openTelegramLink) return tg.openTelegramLink(l); } catch (e) {}
  try { if (navigator.share) return navigator.share({ text: t, url: u }); } catch (e) {}
  window.open(l, '_blank');
};
const mb = $('#mute'), sm = () => mb.classList.toggle('off', S.mute);
sm();
mb.onclick = () => { S.mute = !S.mute; try { localStorage.gm = S.mute ? '1' : '0'; } catch (e) {} sm(); if (!S.mute) sfx('tap'); };

/* ---------- Pointer + keyboard input ---------- */
const D = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }, held = {};
$('#ctl').addEventListener('pointerdown', e => {
  const b = e.target.closest('button'), cur = S.cur; if (!b || !cur) return;
  e.preventDefault(); const k = b.dataset.k;
  if (cur.ctl == 'quest') { K[k] = 1; held[e.pointerId] = k; if (k == 'j') cur.jb = 6; }
  else if (k == 't') cur.tap();
  else if (cur.hop) cur.hop(k == 'o' ? 1 : -1);
  else cur.dir(...D[k]);
});
const rel = e => { const k = held[e.pointerId]; if (k) { K[k] = 0; delete held[e.pointerId]; } };
addEventListener('pointerup', rel); addEventListener('pointercancel', rel);
addEventListener('blur', () => { K.l = K.r = K.j = 0; Object.keys(held).forEach(i => delete held[i]); });
addEventListener('pointerdown', () => { au(); }, true);
let sx, sy;
cv.addEventListener('pointerdown', e => {
  const cur = S.cur; if (!cur) return; sx = e.clientX; sy = e.clientY;
  if (cur.ctl == 'tap') cur.tap();
  if (cur.hop) { const r = cv.getBoundingClientRect(); cur.hop(e.clientX < r.left + r.width / 2 ? -1 : 1); }
  if (cur.click) { const r = cv.getBoundingClientRect(); cur.click((e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height); }
});
cv.addEventListener('pointerup', e => {
  const cur = S.cur; if (!cur || cur.ctl != 'dpad' || sx == null) return;
  const dx = e.clientX - sx, dy = e.clientY - sy;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) Math.abs(dx) > Math.abs(dy) ? cur.dir(dx > 0 ? 1 : -1, 0) : cur.dir(0, dy > 0 ? 1 : -1);
  sx = null;
});
addEventListener('keydown', e => {
  const cur = S.cur; if (!cur || e.repeat) return; const k = e.key;
  if (k == 'ArrowLeft' || k == 'a') { K.l = 1; cur.dir && cur.dir(-1, 0); }
  if (k == 'ArrowRight' || k == 'd') { K.r = 1; cur.dir && cur.dir(1, 0); }
  if (k == 'ArrowUp' || k == 'w' || k == ' ') { K.j = 1; cur.tap && cur.tap(); cur.dir && cur.dir(0, -1); }
  if (k == 'ArrowDown' || k == 's') cur.dir && cur.dir(0, 1);
  if (cur.hop) {
    if (k == 'ArrowLeft' || k == 'a' || k == 'ArrowDown' || k == 's') cur.hop(-1);
    if (k == 'ArrowRight' || k == 'd' || k == 'ArrowUp' || k == 'w' || k == ' ') cur.hop(1);
  }
});
addEventListener('keyup', e => {
  const k = e.key;
  if (k == 'ArrowLeft' || k == 'a') K.l = 0;
  if (k == 'ArrowRight' || k == 'd') K.r = 0;
  if (k == 'ArrowUp' || k == 'w' || k == ' ') K.j = 0;
});

/* ---------- Boot ---------- */
regen(); lifeUI(); pui();
setInterval(() => { regen(); lifeUI(); pui(); }, 1000);
document.addEventListener('visibilitychange', () => { regen(); lifeUI(); });
menu();
setTimeout(() => { if (dstate().can) openDaily(); }, 800);

/* Test hook, only available with ?dev=1 */
if (DEV) window.__gh = { S, K, G, LV, P, clock, start, menu, loop, tryPlay, toast, stop: () => cancelAnimationFrame(raf) };
