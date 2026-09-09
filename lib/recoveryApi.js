// Helper cho luong Reset Password / Email Verification / Recovery Token.
// KHONG dung __Secure-next-auth.session-token lam Recovery Token hay Reset Session.
// Day la mot public proxy (giong lib/pubApi.js): khong gui X-API-Key ra ngoai frontend.
const BOT_API_URL = process.env.BOT_API_URL;

export async function recoveryApi(path, body) {
  try {
    const r = await fetch(BOT_API_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    let data = {};
    try { data = await r.json(); } catch (e) { data = {}; }
    return { ok: r.ok, status: r.status, data };
  } catch (e) {
    return { ok: false, status: 502, data: { error: 'Khong ket noi duoc den server.' } };
  }
}

// Cookie rieng cho Temporary Reset Session. Hoan toan doc lap voi __Secure-next-auth.session-token.
export const RESET_SESSION_COOKIE = 'reset_session';
export const RESET_SESSION_MAX_AGE = 480; // 8 phut

function isHttps() {
  return String(process.env.NEXTAUTH_URL || '').startsWith('https://');
}

export function buildResetSessionCookie(value, maxAge = RESET_SESSION_MAX_AGE) {
  const parts = [
    `${RESET_SESSION_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (isHttps()) parts.push('Secure');
  return parts.join('; ');
}

export function clearResetSessionCookie() {
  const parts = [
    `${RESET_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isHttps()) parts.push('Secure');
  return parts.join('; ');
}

export function readResetSessionCookie(req) {
  const header = (req.headers && req.headers.cookie) || '';
  const parts = header.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === RESET_SESSION_COOKIE) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}
