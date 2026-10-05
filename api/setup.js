/* Visit https://YOUR-DOMAIN/api/setup once to register the webhook + menu button. */
const TOKEN = process.env.BOT_TOKEN;
const call = (m, body) => fetch(`https://api.telegram.org/bot${TOKEN}/${m}`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
}).then(r => r.json());

module.exports = async (req, res) => {
  if (!TOKEN) return res.status(500).json({ error: 'BOT_TOKEN env var is missing' });
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const hook = { url: `https://${host}/api/webhook`, allowed_updates: ['message'] };
  if (process.env.WEBHOOK_SECRET) hook.secret_token = process.env.WEBHOOK_SECRET;
  const a = await call('setWebhook', hook);
  const b = await call('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Play', web_app: { url: `https://${host}/` } } });
  const c = await call('setMyCommands', { commands: [{ command: 'start', description: 'Open Games Hub' }] });
  res.status(200).json({ webhook: a, menu: b, commands: c });
};
