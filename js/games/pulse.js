/* Pulse Rail (original): a rhythm game with its own generated music.
   Dots travel down four rails toward the hub. Tap the matching arrow when a dot reaches the ring.
   The music is synthesised live with WebAudio (kick, clap, hats, bass, arpeggio, pad), no audio files. */
import { c, S, hap, burst, end, tone, au, clock, TAU } from '../core.js';

const BPM = 108, SPB = 60 / BPM, E = SPB / 2, BARS = 24;     // E = one eighth note in seconds
const TRAVEL = 1.35, WIN_G = .16, WIN_P = .07;               // dot travel time, "good" and "perfect" windows (s)
const CX = 180, CY = 250, RING = 44, RAIL = 130;
const DIRS = [                                              // 0 up, 1 right, 2 down, 3 left
  { dx: 0, dy: -1, col: '#5cc8ff', f: 659 }, { dx: 1, dy: 0, col: '#ff6b4a', f: 784 },
  { dx: 0, dy: 1, col: '#3ee0a0', f: 523 }, { dx: -1, dy: 0, col: '#ffc83d', f: 587 }];
const ROOT = [110, 87.31, 130.81, 98];                       // Am F C G
const TONES = [[440, 523.25, 659.25], [349.23, 440, 523.25], [523.25, 659.25, 783.99], [392, 493.88, 587.33]];

/* Note chart: deterministic, gets denser as the song goes on. */
function makeNotes() {
  let sd = 20251005; const R = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const out = []; let lastD = -1;
  for (let e = 8; e < BARS * 8 - 4; e++) {
    const bar = Math.floor(e / 8), s = e % 8; let p;
    if (bar < 5) p = (s == 0 || s == 4) ? 1 : 0;
    else if (bar < 11) p = s % 2 == 0 ? 1 : 0;
    else if (bar < 18) p = s % 2 == 0 ? 1 : (R() < .3 ? 1 : 0);
    else p = s % 2 == 0 ? 1 : (R() < .5 ? 1 : 0);
    if (!p) continue;
    let d = Math.floor(R() * 4); if (d == lastD && R() < .6) d = (d + 1 + Math.floor(R() * 3)) % 4;
    lastD = d; out.push({ e, d, hit: 0 });
  }
  return out;
}

/* ---------- Music voices ---------- */
let MG = null, NB = null;
function noise(a) {
  if (!NB) { NB = a.createBuffer(1, a.sampleRate * .5, a.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = a.createBufferSource(); s.buffer = NB; return s;
}
function env(a, at, v, dur, atk) {
  const g = a.createGain();
  g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(v, at + (atk || .004)); g.gain.exponentialRampToValueAtTime(.0001, at + dur);
  return g;
}
function kick(a, at) {
  const o = a.createOscillator(), g = env(a, at, .9, .22); o.type = 'sine';
  o.frequency.setValueAtTime(150, at); o.frequency.exponentialRampToValueAtTime(42, at + .12);
  o.connect(g); g.connect(MG); o.start(at); o.stop(at + .25);
}
function clap(a, at) {
  const n = noise(a), f = a.createBiquadFilter(), g = env(a, at, .32, .16); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = .8;
  n.connect(f); f.connect(g); g.connect(MG); n.start(at, Math.random() * .3); n.stop(at + .18);
}
function hat(a, at, v) {
  const n = noise(a), f = a.createBiquadFilter(), g = env(a, at, v * .22, .05); f.type = 'highpass'; f.frequency.value = 7000;
  n.connect(f); f.connect(g); g.connect(MG); n.start(at, Math.random() * .3); n.stop(at + .07);
}
function voice(a, type, f, at, v, dur, atk) {
  const o = a.createOscillator(), g = env(a, at, v, dur, atk); o.type = type; o.frequency.value = f;
  o.connect(g); g.connect(MG); o.start(at); o.stop(at + dur + .03);
}

export const pulse = {
  ctl: 'pads',
  init() {
    this.notes = makeNotes(); this.t0 = clock.t() + .8;
    this.hp = 100; this.combo = 0; this.maxCombo = 0; this.fb = []; this.pf = [0, 0, 0, 0]; this.firstHit = 0; this.nextE = 0;
    this.endT = this.t0 + this.notes[this.notes.length - 1].e * E + 1;
    this.startMusic();
  },
  /* ----- music ----- */
  startMusic() {
    this.leave();
    const a = au(); if (!a) return;
    MG = a.createGain(); MG.gain.value = .8; MG.connect(a.destination);
    this.timer = setInterval(() => this.sched(), 40); this.sched();
  },
  sched() {
    const a = au(); if (!a || !MG || S.over) return;
    const now = clock.t(), off = a.currentTime - now, ahead = now + .3;
    while (this.nextE <= BARS * 8) {
      const t = this.t0 + this.nextE * E; if (t > ahead) break;
      if (t >= now - .05 && !S.mute) this.play(a, this.nextE, t + off);
      this.nextE++;
    }
  },
  play(a, e, at) {
    const bar = Math.floor(e / 8), s = e % 8, ch = bar % 4;
    if (bar >= 1 && s % 2 == 0) kick(a, at);
    if (bar >= 1 && (s == 2 || s == 6)) clap(a, at);
    if (s % 2 == 1) hat(a, at, .5); else if (bar >= 2) hat(a, at, .2);
    if (bar >= 1 && (s == 0 || s == 3 || s == 6)) voice(a, 'triangle', ROOT[ch], at, .38, E * 1.7, .01);
    if (bar >= 3) { const f = TONES[ch][[0, 1, 2, 1, 0, 1, 2, 1][s]]; voice(a, 'square', f * (bar >= 10 && s % 4 == 0 ? 2 : 1), at, .05, E * .9, .005); }
    if (s == 0) TONES[ch].forEach(f => voice(a, 'sine', f / 2, at, .05, E * 7.5, .12));
  },
  leave() {
    if (this.timer) { clearInterval(this.timer); this.timer = 0; }
    if (MG) {
      const a = au(), g = MG; MG = null;
      try { g.gain.cancelScheduledValues(a.currentTime); g.gain.setTargetAtTime(0, a.currentTime, .08); } catch (e) {}
      setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 600);
    }
  },

  /* ----- play ----- */
  say(d, txt, col) { this.fb.push({ x: CX + DIRS[d].dx * (RING + 34), y: CY + DIRS[d].dy * (RING + 34), txt, col, t: performance.now() }); },
  press(d) {
    if (S.over) return;
    this.pf[d] = 1; const now = clock.t(); let bn = null, bd = 9;
    for (const n of this.notes) {
      if (n.hit || n.d != d) continue;
      const dt = Math.abs(now - (this.t0 + n.e * E)); if (dt <= WIN_G && dt < bd) { bd = dt; bn = n; }
    }
    if (!bn) { this.combo = 0; this.say(d, 'Too early', '#a9a3d9'); return; }
    bn.hit = 1; this.firstHit = 1;
    const perfect = bd <= WIN_P; this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
    const mult = 1 + Math.min(3, Math.floor(this.combo / 10));
    S.score += (perfect ? 100 : 60) * mult; this.hp = Math.min(100, this.hp + (perfect ? 2 : .5));
    tone(DIRS[d].f, .2, 'triangle', .2); tone(DIRS[d].f * 2, .1, 'sine', .06);
    this.say(d, perfect ? 'Perfect' : 'Good', perfect ? '#ffc83d' : '#fff7e6');
    burst(CX + DIRS[d].dx * RING, CY + DIRS[d].dy * RING, [DIRS[d].col, '#fff7e6'], perfect ? 12 : 6, 2.4);
    if (perfect) hap('light');
  },
  dir(x, y) { this.press(x == 0 && y == -1 ? 0 : x == 1 ? 1 : y == 1 ? 2 : 3); },
  click(x, y) { this.press(Math.abs(x - CX) > Math.abs(y - CY) ? (x > CX ? 1 : 3) : (y > CY ? 2 : 0)); },
  miss(n) {
    this.combo = 0; this.hp -= 14; this.say(n.d, 'Miss', '#ff6b4a'); S.shk = 4;
    tone(160, .12, 'triangle', .12, 90);
  },
  tick(f, dt) {
    const now = clock.t();
    for (const n of this.notes) if (!n.hit && now - (this.t0 + n.e * E) > WIN_G) { n.hit = -1; this.miss(n); }
    for (let d = 0; d < 4; d++) this.pf[d] = Math.max(0, this.pf[d] - dt / 160);
    if (this.hp <= 0) { this.hp = 0; return end('Out of energy', false); }
    if (now > this.endT) { S.score += Math.round(this.hp) * 10; return end('Track cleared! 🎉', true); }
  },

  draw() {
    const now = clock.t(), T = performance.now(), b = (now - this.t0) / SPB, bp = ((b % 1) + 1) % 1, playing = now >= this.t0;
    const pulse = playing ? Math.max(0, 1 - bp * 2.4) : 0;
    const g = c.createRadialGradient(CX, CY, 10, CX, CY, 300 + pulse * 30); g.addColorStop(0, '#3d1d66'); g.addColorStop(1, '#110a2b');
    c.fillStyle = g; c.fillRect(0, 0, 360, 480);
    if (playing) { c.strokeStyle = 'rgba(255,247,230,' + (.2 * (1 - bp)) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(CX, CY, RING + bp * 170, 0, TAU); c.stroke(); }
    /* rails and hit markers */
    DIRS.forEach((D, d) => {
      const x0 = CX + D.dx * RING, y0 = CY + D.dy * RING, x1 = CX + D.dx * (RING + RAIL + 18), y1 = CY + D.dy * (RING + RAIL + 18);
      const lg = c.createLinearGradient(x0, y0, x1, y1); lg.addColorStop(0, 'rgba(169,163,217,.5)'); lg.addColorStop(1, 'rgba(169,163,217,0)');
      c.strokeStyle = lg; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      c.beginPath(); c.arc(x0, y0, 15 + this.pf[d] * 4, 0, TAU); c.strokeStyle = D.col; c.lineWidth = 3; c.globalAlpha = .55 + this.pf[d] * .45; c.stroke();
      if (this.pf[d] > 0) { c.fillStyle = D.col; c.globalAlpha = this.pf[d] * .5; c.fill(); }
      c.globalAlpha = 1;
    });
    /* notes */
    for (const n of this.notes) {
      if (n.hit == 1) continue;
      const dtm = this.t0 + n.e * E - now; if (dtm > TRAVEL || dtm < -.5) continue;
      const D = DIRS[n.d], dist = RING + dtm / TRAVEL * RAIL, x = CX + D.dx * dist, y = CY + D.dy * dist;
      c.globalAlpha = n.hit == -1 ? Math.max(0, .5 + dtm) * .6 : Math.min(1, (TRAVEL - dtm) * 3);
      c.save(); c.shadowColor = D.col; c.shadowBlur = 14; c.fillStyle = D.col; c.beginPath(); c.arc(x, y, 11, 0, TAU); c.fill(); c.restore();
      c.fillStyle = '#fff7e6'; c.beginPath(); c.arc(x, y, 4.5, 0, TAU); c.fill(); c.globalAlpha = 1;
    }
    /* hub */
    const hr = RING * (1 + pulse * .07);
    c.strokeStyle = '#fff7e6'; c.lineWidth = 4; c.beginPath(); c.arc(CX, CY, hr, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(255,255,255,' + (.04 + pulse * .08) + ')'; c.fill();
    c.textAlign = 'center';
    if (this.combo >= 2) {
      const mult = 1 + Math.min(3, Math.floor(this.combo / 10));
      c.fillStyle = '#fff7e6'; c.font = '700 28px Fredoka,sans-serif'; c.fillText(this.combo, CX, CY + 6);
      c.font = '600 12px Fredoka,sans-serif'; c.fillStyle = mult > 1 ? '#ffc83d' : '#a9a3d9'; c.fillText(mult > 1 ? 'combo x' + mult : 'combo', CX, CY + 22);
    }
    /* feedback words */
    for (let i = this.fb.length - 1; i >= 0; i--) {
      const q = this.fb[i], a = (T - q.t) / 700; if (a >= 1) { this.fb.splice(i, 1); continue; }
      c.globalAlpha = 1 - a; c.fillStyle = q.col; c.font = '700 16px Fredoka,sans-serif'; c.fillText(q.txt, q.x, q.y - a * 18); c.globalAlpha = 1;
    }
    /* energy + progress */
    c.textAlign = 'left'; c.font = '600 13px Fredoka,sans-serif'; c.fillStyle = '#a9a3d9'; c.fillText('Energy', 25, 24);
    c.fillStyle = '#38308a'; c.beginPath(); c.roundRect(25, 30, 310, 9, 4); c.fill();
    c.fillStyle = this.hp > 35 ? '#3ee0a0' : '#ff6b4a'; c.beginPath(); c.roundRect(25, 30, Math.max(0, 310 * this.hp / 100), 9, 4); c.fill();
    const prog = Math.max(0, Math.min(1, (now - this.t0) / (this.endT - this.t0)));
    c.fillStyle = '#38308a'; c.fillRect(25, 468, 310, 4); c.fillStyle = '#ffc83d'; c.fillRect(25, 468, 310 * prog, 4);
    if (!this.firstHit && now < this.t0 + 6) {
      c.textAlign = 'center'; c.font = '600 15px Fredoka,sans-serif'; c.fillStyle = '#fff7e6'; c.fillText('Tap the matching arrow', CX, 432);
      c.fillStyle = '#ffc83d'; c.fillText('when a dot reaches the ring', CX, 452);
    }
  },
};
