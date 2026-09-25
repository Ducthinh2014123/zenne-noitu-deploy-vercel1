import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { botApi } from '../../../lib/serverApi';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Chua dang nhap' });
  const { ok, data } = await botApi('GET', `/pub/account?user_id=${session.user.id}`);
  if (ok) {
    data.isAdmin  = session.user.isAdmin || data.is_admin || false;
    data.username = data.username || session.user.name;
    data.image    = data.avatar   || session.user.image;
    data.provider = session.user.provider || data.provider;
    return res.status(200).json(data);
  }
  return res.status(200).json({
    ...session.user,
    has_password: false,
    totp_enabled: false,
  });
}
