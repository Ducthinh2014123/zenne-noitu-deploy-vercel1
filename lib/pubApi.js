/**
 * Public API client — khong can xac thuc, chi can API URL trong localStorage.
 * Key: nt_api_url (set tu trang admin dashboard)
 */

function getBase() {
  if (typeof window === 'undefined') return '';
  const raw = localStorage.getItem('nt_api_url') || '';
  return raw.replace(/\/$/, '');
}

/**
 * Lay WebSocket URL cho game room.
 * Chuyen http -> ws, https -> wss tu dong.
 */
export function getWsUrl(roomId) {
  const base = getBase();
  if (!base) return null;
  const wsBase = base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
  return `${wsBase}/ws/game/${roomId}`;
}

async function get(path, params = {}) {
  const base = getBase();
  if (!base) throw new Error('Chua co API URL. Vui long dang nhap Admin Dashboard truoc.');
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${base}${path}${qs ? '?' + qs : ''}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`API loi ${res.status}`);
  return res.json();
}

async function post(path, body = {}) {
  const base = getBase();
  if (!base) throw new Error('Chua co API URL.');
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API loi ${res.status}`);
  return res.json();
}

export const pubApi = {
  /** Bot status: online/offline, guild_count, user_count, stats */
  status:      ()          => get('/pub/status'),

  /** Danh sach tu duoc duyet. params: { q, limit, offset } */
  wordbank:    (p = {})    => get('/pub/wordbank', p),

  /** Tu bi tu choi. params: { q, limit, offset } */
  rejected:    (p = {})    => get('/pub/rejected', p),

  /** Bang xep hang. params: { mode ('words'|'streak'), limit } */
  leaderboard: (p = {})    => get('/pub/leaderboard', p),

  /** Danh sach servers bot dang o (50 server lon nhat). */
  servers:     ()          => get('/pub/servers'),

  /** Cot moc (milestones). */
  milestones:  ()          => get('/pub/milestones'),

  /**
   * Tao phong game moi.
   * @param {{ lang: string, time_limit: number }} body
   * @returns {{ room_id, lang, time_limit, url }}
   */
  createRoom: (body)       => post('/pub/game/create', body),
};
