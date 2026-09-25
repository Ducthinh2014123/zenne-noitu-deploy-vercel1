// POST /api/auth/register/email/verify
// Lop trung gian Next.js: browser goi route nay, KHONG bao gio goi thang BOT_API_URL.
// Server-side moi duoc phep doc process.env.BOT_API_URL.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const email = String((req.body || {}).email || '').trim().toLowerCase();
  const code  = String((req.body || {}).code  || '').trim();

  if (!email || !code) return res.status(400).json({ error: 'Thieu email hoac ma xac minh' });
  if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Ma xac minh phai gom 6 chu so' });

  const BOT_API = (process.env.BOT_API_URL || '').replace(/\/$/, '');
  if (!BOT_API) return res.status(503).json({ error: 'Server chua duoc cau hinh (BOT_API_URL)' });

  try {
    const r = await fetch(BOT_API + '/pub/auth/register/email/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    let data = {};
    try { data = await r.json(); } catch {}
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Khong ket noi duoc den server xac minh.' });
  }
}
