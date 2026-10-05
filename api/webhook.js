/* Telegram webhook (Vercel serverless). Env: BOT_TOKEN, optional WEBHOOK_SECRET.
   Open /api/setup once after deploy to register the webhook. */
const TOKEN = process.env.BOT_TOKEN;
const API = m => `https://api.telegram.org/bot${TOKEN}/${m}`;
const call = (m, body) => fetch(API(m), {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
}).then(r => r.json());

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('ok');
  if (process.env.WEBHOOK_SECRET && req.headers['x-telegram-bot-api-secret-token'] !== process.env.WEBHOOK_SECRET)
    return res.status(401).send('no');
  try {
    const m = req.body && req.body.message;
    const text = m && m.text || '';
    if (m && /^\/(start|play|help)(@\w+)?(\s|$)/i.test(text)) {
      const name = (m.from && m.from.first_name) || 'there';
      await call('sendMessage', {
        chat_id: m.chat.id,
        text: `Hi ${name}! 🎮 Welcome to Games Hub.\n\n9 original games, daily bonus, coins & badges.\nTap below to play!`,
        reply_markup: { inline_keyboard: [[{ text: '🎮 Play now', url: 'https://t.me/TGGAMEHUBBOT/app' }]] },
      });
    }
  } catch (e) { console.error(e); }
  res.status(200).send('ok'); // always 200 so Telegram doesn't retry
};
