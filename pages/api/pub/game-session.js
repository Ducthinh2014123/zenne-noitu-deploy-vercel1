import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { botApi } from '../../../lib/serverApi';

const ALLOWED_GAMES = ['snake', '2048'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Ban can dang nhap de choi va ghi diem.' });
  }

  const { game } = req.body || {};
  const g = String(game || '').trim().toLowerCase();
  if (!ALLOWED_GAMES.includes(g)) {
    return res.status(400).json({ error: 'Game khong hop le.' });
  }

  const { ok, status, data } = await botApi('POST', '/pub/game/session/start', {
    user_id: -Number(session.user.id),
    game: g,
  });

  if (!ok) {
    return res.status(status || 502).json({ error: data?.error || 'Khong lay duoc session token.' });
  }
  return res.status(200).json(data);
}
