/* Game catalogue: name, card art (SVG), one-line description and the game object. */
import { orbit } from './games/orbit.js';
import { prism } from './games/prism.js';
import { pulse } from './games/pulse.js';
import { quest } from './games/quest.js';
import { stack } from './games/stack.js';
import { mem } from './games/mem.js';
import { snake } from './games/snake.js';
import { flap } from './games/flap.js';
import { ttt } from './games/ttt.js';

/* The first entry is shown as the large featured card. */
export const G = {
  orbit: { o: orbit, n: 'Lumen Orbit', bg: '#2b1f6b', vb: '0 0 128 64', d: 'Hop between rings, dodge the dark arcs, chase sparks.',
    ic: "<g fill='#fff7e6'><circle cx='10' cy='10' r='1'/><circle cx='30' cy='54' r='1.2'/><circle cx='112' cy='12' r='1'/><circle cx='118' cy='50' r='1.4'/><circle cx='22' cy='30' r='.8'/></g><g fill='none' stroke='#a9a3d9' stroke-opacity='.5' stroke-width='1.5'><circle cx='64' cy='32' r='12'/><circle cx='64' cy='32' r='22'/><circle cx='64' cy='32' r='31'/></g><path d='M43.3 24.5A22 22 0 0 0 43.3 39.5' stroke='#e0407e' stroke-width='5' stroke-linecap='round' fill='none'/><path d='M43.3 24.5A22 22 0 0 0 43.3 39.5' stroke='#150a30' stroke-width='2.6' stroke-linecap='round' fill='none'/><circle cx='64' cy='32' r='9' fill='#ffc83d' opacity='.3'/><circle cx='64' cy='32' r='5' fill='#ffc83d'/><circle cx='64' cy='20' r='6' fill='#ffc83d' opacity='.35'/><circle cx='64' cy='20' r='2.8' fill='#fff7e6'/><path d='M95 27l4 5-4 5-4-5z' fill='#ffc83d'/>" },
  prism: { o: prism, n: 'Prism Path', bg: '#1d2f66',
    ic: '<g fill="#fff7e6"><circle cx="9" cy="10" r="1"/><circle cx="54" cy="52" r="1.2"/><circle cx="50" cy="12" r=".9"/></g><path d="M4 40H30V20" stroke="#5cf0ff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".25"/><path d="M4 40H30V20" stroke="#5cf0ff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 49L39 31" stroke="#e8e4ff" stroke-width="6" stroke-linecap="round"/><path d="M21 49L39 31" stroke="#8a7fd8" stroke-width="2" stroke-linecap="round"/><path d="M30 6l9 11-9 11-9-11z" fill="#ffc83d"/><path d="M30 10l5 7-5 7-5-7z" fill="#fff3b8" opacity=".7"/>' },
  pulse: { o: pulse, n: 'Pulse Rail', bg: '#4a1d5e',
    ic: '<circle cx="32" cy="32" r="22" fill="none" stroke="#fff7e6" stroke-opacity=".15" stroke-width="2"/><path d="M32 4V19M32 45V60M4 32H19M45 32H60" stroke="#a9a3d9" stroke-width="2" stroke-linecap="round" opacity=".55"/><circle cx="32" cy="32" r="13" fill="none" stroke="#fff7e6" stroke-width="3"/><circle cx="32" cy="32" r="5" fill="#ff6b4a"/><circle cx="32" cy="9" r="4.5" fill="#5cc8ff"/><circle cx="55" cy="32" r="4.5" fill="#ff6b4a"/><circle cx="32" cy="55" r="4.5" fill="#3ee0a0"/><circle cx="9" cy="32" r="4.5" fill="#ffc83d"/>' },
  quest: { o: quest, n: 'Jump Quest', bg: '#3a2f8f',
    ic: '<circle cx="32" cy="40" r="13" fill="#ffd2a1"/><path d="M15 36a17 17 0 0134 0z" fill="#7b4dff"/><rect x="13" y="34" width="38" height="6" rx="3" fill="#5a33d6"/><circle cx="32" cy="16" r="5" fill="#ffc83d"/><circle cx="27" cy="45" r="2" fill="#15123b"/><circle cx="37" cy="45" r="2" fill="#15123b"/><path d="M28 50q4 3 8 0" stroke="#15123b" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18 56q14 8 28 0" stroke="#1fb8a6" stroke-width="7" fill="none" stroke-linecap="round"/>' },
  stack: { o: stack, n: 'Stack Tower', bg: '#2f5d8a',
    ic: '<rect x="14" y="44" width="36" height="9" rx="2" fill="#5cc8ff"/><rect x="18" y="34" width="30" height="9" rx="2" fill="#3ee0a0"/><rect x="12" y="24" width="30" height="9" rx="2" fill="#ffc83d"/><rect x="20" y="14" width="26" height="9" rx="2" fill="#ff6b4a"/>' },
  mem: { o: mem, n: 'Memory Match', bg: '#6a2f6f',
    ic: '<rect x="8" y="14" width="22" height="30" rx="5" fill="#fff7e6"/><circle cx="19" cy="29" r="6" fill="#ff6b4a"/><rect x="34" y="20" width="22" height="30" rx="5" fill="#3a2f8f" stroke="#fff7e6" stroke-width="2"/><path d="M45 29l2 4 4 .6-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.6z" fill="#ffc83d"/>' },
  snake: { o: snake, n: 'Snake', bg: '#1c4a52',
    ic: '<path d="M12 50h22a10 10 0 000-20H26a8 8 0 010-16h26" fill="none" stroke="#3ee0a0" stroke-width="9" stroke-linecap="round"/><circle cx="52" cy="14" r="7" fill="#7dffc9"/><circle cx="54" cy="12" r="2" fill="#15123b"/><circle cx="50" cy="52" r="5" fill="#ff6b4a"/>' },
  flap: { o: flap, n: 'Flap Dash', bg: '#a8452e',
    ic: '<ellipse cx="28" cy="34" rx="20" ry="16" fill="#ffc83d"/><path d="M20 36q8 12 18 0" fill="#ff9f1c"/><circle cx="36" cy="28" r="5" fill="#fff"/><circle cx="37" cy="28" r="2.2" fill="#15123b"/><path d="M46 32l12 4-12 5z" fill="#ff6b4a"/>' },
  ttt: { o: ttt, n: 'Tic-Tac-Toe', bg: '#4a2f7a',
    ic: '<path d="M24 8v48M40 8v48M8 24h48M8 40h48" stroke="#a9a3d9" stroke-width="3" stroke-linecap="round"/><path d="M11 11l10 10M21 11L11 21M43 43l10 10M53 43L43 53" stroke="#ff6b4a" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="32" r="5" fill="none" stroke="#5cc8ff" stroke-width="4"/>' },
};
