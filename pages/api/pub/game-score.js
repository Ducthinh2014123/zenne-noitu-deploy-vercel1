import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { botApi } from '../../../lib/serverApi';

// Nhan diem mini-game (Snake, 2048, Tic Tac Toe, Minesweeper, ...) tu client
// da dang nhap, roi chuyen tiep xuong bot (kem API key) de ghi vao bang xep
// hang rieng cua tung game. Nguoi chua dang nhap khong the ghi diem len BXH
// chung (van choi duoc, diem chi luu local).
const ALLOWED_GAMES = ['snake', '2048', 'tictactoe', 'minesweeper'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Ban can dang nhap de ghi diem vao bang xep hang.' });
  }

  const { game, score } = req.body || {};
  const g = String(game || '').trim().toLowerCase();
  if (!ALLOWED_GAMES.includes(g)) {
    return res.status(400).json({ error: 'Game khong hop le.' });
  }
  const s = Math.max(0, Math.min(10_000_000, Math.round(Number(score) || 0)));

  const { ok, status, data } = await botApi('POST', '/pub/game/score', {
    user_id: -Number(session.user.id),
    game: g,
    score: s,
  });

  if (!ok) {
    return res.status(status || 502).json({ error: data?.error || 'Khong ghi duoc diem.' });
  }
  return res.status(200).json({ ok: true });
}
