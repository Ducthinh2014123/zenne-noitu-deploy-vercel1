// Admin API client — dung X-API-Key, lay tu localStorage
function getBase() {
  if (typeof window === 'undefined') return '';
  return (localStorage.getItem('nt_api_url') || '').replace(/\/$/, '');
}
function getKey() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('nt_api_key') || '';
}
async function req(method, path, body) {
  const base = getBase(), key = getKey();
  if (!base) throw new Error('Chua co API URL');
  const opts = { method, headers: { 'X-API-Key': key, 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(base + path, opts);
  if (!r.ok) throw new Error('API ' + r.status);
  return r.json();
}
export const api = {
  pending:     ()           => req('GET',    '/api/pending'),
  review:      (id, action) => req('POST',   '/api/review', { id, action }),
  reviewBulk:  (ids, action)=> req('POST',   '/api/review_bulk', { ids, action }),
  wordbank:    (p={})       => req('GET',    '/api/wordbank?' + new URLSearchParams(p)),
  deleteWord:  (word)       => req('DELETE', '/api/wordbank', { word }),
  leaderboard: (p={})       => req('GET',    '/api/leaderboard?' + new URLSearchParams(p)),
  guilds:      ()           => req('GET',    '/api/guilds'),
  status:      ()           => req('GET',    '/pub/status'),
};
