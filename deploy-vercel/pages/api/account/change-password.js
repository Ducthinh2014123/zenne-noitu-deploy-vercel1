import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { botApi } from '../../../lib/serverApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Chua dang nhap' });
  const { old_password, new_password } = req.body || {};
  if (!new_password || new_password.length < 6)
    return res.status(400).json({ error: 'Mat khau moi toi thieu 6 ky tu' });
  const { ok, status, data } = await botApi('POST', '/pub/account/change-password', {
    user_id:      session.user.id,
    old_password: old_password || '',
    new_password,
  });
  return res.status(ok ? 200 : status).json(data);
}
