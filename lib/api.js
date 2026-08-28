// ============================================================
// API client — doc API URL + Key tu localStorage
// ============================================================

export const getConfig = () => {
  if (typeof window === 'undefined') return { url: '', key: '' };
  return {
    url: localStorage.getItem('nt_api_url') || '',
    key: localStorage.getItem('nt_api_key') || '',
  };
};

export const isConfigured = () => {
  const { url, key } = getConfig();
  return Boolean(url && key);
};

export const saveConfig = (url, key) => {
  localStorage.setItem('nt_api_url', url.replace(/\/$/, ''));
  localStorage.setItem('nt_api_key', key);
};

export const clearConfig = () => {
  localStorage.removeItem('nt_api_url');
  localStorage.removeItem('nt_api_key');
};

const req = async (path, options = {}) => {
  const { url, key } = getConfig();
  if (!url || !key) throw new Error('Chua cau hinh API');

  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': key,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
};

const qs = (params) => {
  const p = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );
  return new URLSearchParams(p).toString();
};

export const api = {
  health: () => {
    const { url } = getConfig();
    return fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) }).then((r) => r.json());
  },
  stats: () => req('/api/stats'),

  pending: (params = {}) => req(`/api/pending?${qs(params)}`),
  review: (id, approve, reviewer_id = 0) =>
    req('/api/review', { method: 'POST', body: JSON.stringify({ id, approve, reviewer_id }) }),
  reviewBulk: (ids, approve, reviewer_id = 0) =>
    req('/api/review/bulk', { method: 'POST', body: JSON.stringify({ ids, approve, reviewer_id }) }),

  wordbank: (params = {}) => req(`/api/wordbank?${qs(params)}`),
  deleteWord: (guild_id, word) =>
    req('/api/wordbank', { method: 'DELETE', body: JSON.stringify({ guild_id, word }) }),

  leaderboard: (params = {}) => req(`/api/leaderboard?${qs(params)}`),
  guilds: () => req('/api/guilds'),
};
