// Public API — khong can dang nhap Admin.
// Pterodactyl khong co cho nhap bien moi truong o phia client build, nen URL API
// mac dinh duoc hardcode ngay tai day. Nguoi dung thuong (khong phai Admin) chi
// can vao thang cac trang public / choi online ma KHONG can biet gi ve API Key.
const DEFAULT_API_URL = 'https://odd-flower-1a93.rapid-lab-7844.workers.dev';

function getBase() {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  return (localStorage.getItem('nt_api_url') || DEFAULT_API_URL).replace(/\/$/, '');
}
export function getWsUrl(roomId) {
  const base = getBase();
  if (!base) return null;
  return base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/ws/game/' + roomId;
}
async function get(path, params) {
  const base = getBase();
  const qs = params ? '?' + new URLSearchParams(params) : '';
  const r = await fetch(base + path + qs);
  if (!r.ok) throw new Error('API ' + r.status);
  return r.json();
}
async function post(path, body) {
  const base = getBase();
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
