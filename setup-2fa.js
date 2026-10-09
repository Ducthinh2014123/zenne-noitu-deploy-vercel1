import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { botApi } from '../../../lib/serverApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Chua dang nhap' });
  const { ok, status, data } = await botApi('POST', '/pub/account/setup-2fa', {
    user_id: session.user.id,
  });
  return res.status(ok ? 200 : status).json(data);
}
