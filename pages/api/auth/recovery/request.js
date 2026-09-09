// POST /api/auth/recovery/request — Buoc 1: user nhap email, xin gui Email Recovery Code.
// Proxy cong khai toi BOT_API, khong dung X-API-Key (giong /api/auth/register).
import { recoveryApi } from '../../../../lib/recoveryApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const email = String((req.body || {}).email || '').trim();
  const { ok, status, data } = await recoveryApi('/pub/auth/recovery/request', { email });
  // Luon tra ve response chung (khong tiet lo email co ton tai hay khong) — cho du BOT_API loi mang,
  // van khong nen tiet lo thong tin qua status/message khac nhau ra ngoai.
  if (!ok && status !== 429) {
    return res.status(200).json({ success: true, message: 'Neu tai khoan ton tai, ma xac minh da duoc gui.' });
  }
  return res.status(status).json(data);
}
