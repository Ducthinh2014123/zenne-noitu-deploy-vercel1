// POST /api/auth/recovery/reset-password — Buoc cuoi: dat mat khau moi bang Temporary Reset Session.
// Khong nhan user_id tu client; user duoc xac dinh boi cookie reset_session (server-side only).
import { recoveryApi, readResetSessionCookie, clearResetSessionCookie } from '../../../../lib/recoveryApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = readResetSessionCookie(req);
  if (!session) return res.status(401).json({ error: 'Reset session khong hop le hoac da het han.' });

  const password = String((req.body || {}).password || '');
  if (password.length < 6) return res.status(400).json({ error: 'Mat khau moi toi thieu 6 ky tu' });

  const { ok, status, data } = await recoveryApi('/pub/auth/recovery/reset-password', { session, password });
  if (!ok) return res.status(status).json(data);

  // Ket thuc recovery: xoa cookie reset_session du con hop le hay khong.
  res.setHeader('Set-Cookie', clearResetSessionCookie());
  return res.status(200).json({ success: true });
}
