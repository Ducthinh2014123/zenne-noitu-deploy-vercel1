// Public API — khong can xac thuc
function getBase() {
  if (typeof window === 'undefined') return '';
  return (localStorage.getItem('nt_api_url') || '').replace(/\/$/, '');
}
export function getWsUrl(roomId) {
  const base = getBase();
  if (!base) return null;
  return base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/ws/game/' + roomId;
}
async function get(path, params) {
  const base = getBase();
  if (!base) throw new Error('Chua co API URL. Vui long dang nhap trang Admin truoc.');
  const qs = params ? '?' + new URLSearchParams(params) : '';
  const r = await fetch(base + path + qs);
  if (!r.ok) throw new Error('API ' + r.status);
  return r.json();
}
async function post(path, body) {
  const base = getBase();
  if (!base) throw new Error('Chua co API URL.');
  const r = await fetch(base + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('API ' + r.status);
  return r.json();
}
export const pubApi = {
  status:      ()       => get('/pub/status'),
  wordbank:    (p={})   => get('/pub/wordbank', p),
  rejected:    (p={})   => get('/pub/rejected', p),
  leaderboard: (p={})   => get('/pub/leaderboard', p),
  servers:     ()       => get('/pub/servers'),
  milestones:  ()       => get('/pub/milestones'),
  createRoom:  (body)   => post('/pub/game/create', body),
};
