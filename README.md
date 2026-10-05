# TG Game Hub

Telegram Mini App with 9 games, lives system, daily bonus, shop, badges, and leaderboard (sample players).

## Deploy (Vercel)
No build step. Upload this folder to Git (or `vercel --prod`), framework preset: **Other**, output directory: root.

## Structure
- `index.html` – markup
- `css/app.css` – styles
- `js/core.js` – canvas, audio, particles, shared state
- `js/economy.js` – lives, Adsgram, coins/XP, badges, daily bonus, shop
- `js/leaderboard.js` – sample leaderboard
- `js/registry.js` – game catalogue
- `js/main.js` – menu, loop, input
- `js/games/*.js` – one file per game (orbit, prism, pulse, quest, stack, mem, snake, flap, ttt)

## Notes
- Data is stored in `localStorage` (no database yet).
- `?dev=1` enables a test hook and simulated ads; do not use in production links.
- Adsgram block id is set in `js/economy.js`.
