// POST /api/auth/recovery/email/verify — Buoc 2: xac minh Email Recovery Code, tra ve Recovery Token (mot lan).
// Recovery Token KHONG duoc luu thanh cookie o day — chi hien thi cho user de dan vao Console Recovery Script.
import { recoveryApi } from '../../../../../lib/recoveryApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const email = String((req.body || {}).email || '').trim();
  const code  = String((req.body || {}).code  || '').trim();
  if (!email || !code) return res.status(400).json({ error: 'Thieu thong tin' });

  const { ok, status, data } = await recoveryApi('/pub/auth/recovery/email/verify', { email, code });
  if (!ok) return res.status(status).json(data);
  // data = { success: true, recovery_token: '...' }
  return res.status(200).json(data);
}
