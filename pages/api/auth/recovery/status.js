// GET /api/auth/recovery/status — kiem tra Temporary Reset Session (cookie reset_session) con hop le khong.
import { recoveryApi, readResetSessionCookie } from '../../../../lib/recoveryApi';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = readResetSessionCookie(req);
  if (!session) return res.status(200).json({ canResetPassword: false });

  const { ok, data } = await recoveryApi('/pub/auth/recovery/status', { session });
  if (!ok) return res.status(200).json({ canResetPassword: false });
  return res.status(200).json({ canResetPassword: !!data.canResetPassword });
}
