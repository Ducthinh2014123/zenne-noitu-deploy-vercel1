import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { botApi } from '../../../lib/serverApi';

// Cap token ky rieng (ngan han) cho user dang dang nhap de dung khi vao
// phong choi online (/pub/play). Bot dung token nay de xac thuc nguoi choi
// va ghi diem cua ho vao bang xep hang chung, du ho choi tren web.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Ban can dang nhap de choi online.' });
  }

  const username = session.user.username || session.user.name || 'Nguoi choi';
  const { ok, status, data } = await botApi('POST', '/pub/auth/game-token', {
    user_id: session.user.id,
    username,
  });

  if (!ok) {
    return res.status(status || 502).json({ error: data?.error || 'Khong lay duoc token choi game.' });
  }

  return res.status(200).json(data);
}
