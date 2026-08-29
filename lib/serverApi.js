/**
 * Server-side helper to call the bot API with admin key.
 * Usage: const { ok, status, data } = await botApi('POST', '/pub/account/...', body);
 */
export async function botApi(method, path, body) {
  const base = (process.env.BOT_API_URL || '').replace(/\/$/, '');
  const key  = process.env.BOT_ADMIN_API_KEY || '';
  if (!base) return { ok: false, status: 503, data: { error: 'BOT_API_URL not configured' } };
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
    };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    const r = await fetch(base + path, opts);
    let data;
    try { data = await r.json(); } catch { data = {}; }
    return { ok: r.ok, status: r.status, data };
  } catch (e) {
    console.error('[serverApi]', path, e);
    return { ok: false, status: 500, data: { error: 'Server error' } };
  }
}
