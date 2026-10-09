// POST /api/auth/register — dang ki bang email
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, email, password } = req.body || {};
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Thieu thong tin' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Mat khau toi thieu 6 ky tu' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Email khong hop le' });

  const BOT_API = (process.env.BOT_API_URL || '').replace(/\/$/, '');
  if (!BOT_API) return res.status(503).json({ error: 'Chua cau hinh BOT_API_URL' });

  try {
    const r = await fetch(BOT_API + '/pub/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Khong ket noi duoc den server' });
  }
}
