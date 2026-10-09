// POST /api/auth/recovery/token/verify — Buoc 3: xac minh Recovery Token (chay tu Console Recovery Script).
// Server (Next.js API route) la ben duy nhat set Set-Cookie cho Temporary Reset Session.
// Client KHONG duoc tu tao document.cookie.
import { recoveryApi, buildResetSessionCookie } from '../../../../../lib/recoveryApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const token = String((req.body || {}).token || '').trim();
  if (!token) return res.status(400).json({ error: 'Thieu Recovery Token' });

  const { ok, status, data } = await recoveryApi('/pub/auth/recovery/token/verify', { token });
  if (!ok || !data.success || !data.reset_session) {
    return res.status(status || 400).json({ error: data.error || 'Recovery Token khong hop le hoac da het han.' });
  }

  // Set-Cookie: reset_session — HttpOnly, khac hoan toan voi __Secure-next-auth.session-token.
  res.setHeader('Set-Cookie', buildResetSessionCookie(data.reset_session));
  return res.status(200).json({ success: true });
}
