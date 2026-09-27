const DEFAULT_API_URL = 'https://virtuous-trust-production-2bb9.up.railway.app';

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
async function gameToken() {
  const r = await fetch('/api/pub/game-token', { method: 'POST' });
  if (!r.ok) {
    const d = await r.json().catch(()=>({}));
    throw new Error(d.error || ('Ban can dang nhap de choi online (API ' + r.status + ')'));
  }
  return r.json();
}
async function gameSessionStart(game) {
  const r = await fetch('/api/pub/game-session', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game }),
  });
  if (!r.ok) {
    const d = await r.json().catch(()=>({}));
    throw new Error(d.error || ('API ' + r.status));
  }
  return r.json();
}
async function submitGameScore(game, score, sessionToken) {
  const r = await fetch('/api/pub/game-score', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game, score, session_token: sessionToken }),
  });
  if (!r.ok) {
    const d = await r.json().catch(()=>({}));
    throw new Error(d.error || ('API ' + r.status));
  }
  return r.json();
}
async function tttMove(action, index) {
  const r = await fetch('/api/pub/game-ttt', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, index }),
  });
  if (!r.ok) {
    const d = await r.json().catch(()=>({}));
    throw new Error(d.error || ('API ' + r.status));
  }
  return r.json();
}
async function msMove(action, index) {
  const r = await fetch('/api/pub/game-ms', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, index }),
  });
  if (!r.ok) {
    const d = await r.json().catch(()=>({}));
    throw new Error(d.error || ('API ' + r.status));
  }
  return r.json();
}

export const pubApi = {
  status:      ()       => get('/pub/status'),
  wordbank:    (p={})   => get('/pub/wordbank', p),
  rejected:    (p={})   => get('/pub/rejected', p),
  leaderboard: (p={})   => get('/pub/leaderboard', p),
  gameLeaderboard: (p={}) => get('/pub/game/leaderboard', p),
  servers:     ()       => get('/pub/servers'),
  milestones:  ()       => get('/pub/milestones'),
  createRoom:  (body)   => post('/pub/game/create', body),
  gameToken,
  gameSessionStart,
  submitGameScore,
  tttMove,
  msMove,
};
