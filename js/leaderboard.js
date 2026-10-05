/* Leaderboard. Rankings are SAMPLE data until a database is connected (the screen says so). */
import { $, S, uname } from './core.js';
import { G } from './registry.js';

const NM = ['Alex_92','NinjaRaj','Sara.K','PixelPanda','Tanvir','Mika','LunaPlays','BlazeX','Rafi','Nora','KingArif','Zoe','TurboTom','Anika','Ryu','Maya','ShadowCat','Imran','Chloe','DevJoy','Sakib','Ella','RocketRia','Omar','Lily','ProGamer','Farhan','Ivy','Jack','Tisha','Niloy','Hana','Sumon','Leo','Jannat','Max','Rumi','Kai','Shuvo','Aria','Tahmid','Nadia','Oliver','Sami','Fiona','Riyad','Luca','Mim','Dylan','Priya'];
const PAL = ['#ff6b4a', '#5cc8ff', '#3ee0a0', '#ffc83d', '#b48cff', '#ff8fb8'], HAIR = ['#3b2314', '#15123b', '#a0522d', '#e8372c', '#ffc83d'];
/* [top sample score, step] per game */
const LBC = { orbit: [420, 5], prism: [1400, 25], pulse: [30000, 250], quest: [1900, 10], snake: [950, 10], ttt: [64, 1], flap: [140, 1], stack: [45, 1], mem: [900, 10] };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
let lbg = 'orbit';

function board(g) {
  let s = (g.split('').reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) % 233280) || 1;
  const R = () => (s = (s * 9301 + 49297) % 233280) / 233280, [mx, st] = LBC[g] || [100, 1];
  return NM.map((n, i) => ({ n, i, s: Math.max(st, Math.round(mx * Math.pow(R(), 2.2) / st) * st) }));
}
function av(i) {
  const b = PAL[i % 6], hc = HAIR[i % 5], t = i % 3;
  const hair = t == 0 ? `<path d="M11 17a9 9 0 0118 0z" fill="${hc}"/>`
    : t == 1 ? `<path d="M11 18a9 9 0 0118 0c-4-3-14-3-18 0z" fill="${hc}"/><circle cx="20" cy="8" r="3" fill="${hc}"/>`
    : `<path d="M10 20a10 10 0 0120 0c0-6-4-9-10-9s-10 3-10 9z" fill="${hc}"/>`;
  return `<svg class="av" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="${b}"/><path d="M7 40c0-8 5-11 13-11s13 3 13 11z" fill="#fff7e6" opacity=".9"/><circle cx="20" cy="18" r="9" fill="#ffd2a1"/>${hair}<circle cx="16.5" cy="19" r="1.3" fill="#15123b"/><circle cx="23.5" cy="19" r="1.3" fill="#15123b"/><path d="M17 22.5q3 2.5 6 0" stroke="#15123b" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>`;
}
const nm = o => o.me ? (uname == 'You' ? 'You' : esc(uname) + ' (you)') : o.n;
const row = (o, r) => `<div class="row${r < 4 ? ' r' + r : ''}${o.me ? ' me' : ''}"><span class="rk">${r}</span>${av(o.i)}<span class="nm">${nm(o)}</span><span class="pt">${o.s.toLocaleString('en-US')}</span></div>`;

export function lb(g) {
  if (g) lbg = g;
  $('#tabs').innerHTML = Object.entries(G).map(([k, v]) => `<button class="tab${k == lbg ? ' on' : ''}" data-g="${k}">${v.n}</button>`).join('');
  const a = board(lbg), me = { n: uname, i: 99, s: S.best[lbg] || 0, me: 1 };
  a.push(me); a.sort((x, y) => y.s - x.s || (x.me ? 1 : y.me ? -1 : 0));
  $('#list').innerHTML = a.map((o, i) => row(o, i + 1)).join(''); $('#list').scrollTop = 0;
  $('#mine').innerHTML = row(me, a.indexOf(me) + 1);
}
export function openLb() {
  $('#home').classList.remove('on'); $('#lb').classList.add('on');
  lb(S.cid && G[S.cid] ? S.cid : lbg);
}
$('#tabs').onclick = e => { const b = e.target.closest('.tab'); b && lb(b.dataset.g); };
