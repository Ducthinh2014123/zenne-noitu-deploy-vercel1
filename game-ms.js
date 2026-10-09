import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { botApi } from '../../../lib/serverApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Ban can dang nhap de choi va ghi diem.' });
  }

  const { action, index } = req.body || {};
  const { ok, status, data } = await botApi('POST', '/pub/game/ms', {
    user_id: -Number(session.user.id),
    action,
    index,
  });

  if (!ok) {
    return res.status(status || 502).json({ error: data?.error || 'Khong thuc hien duoc.' });
  }
  return res.status(200).json(data);
}
