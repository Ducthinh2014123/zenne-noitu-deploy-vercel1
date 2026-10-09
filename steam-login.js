/**
 * Buoc 1: Chuyen user den Steam de xac thuc
 * Env can: NEXTAUTH_URL, STEAM_API_KEY
 */
export default function handler(req, res) {
  const base = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const returnTo = `${base}/api/auth/steam-callback`;

  const params = new URLSearchParams({
    'openid.mode':       'checkid_setup',
    'openid.ns':         'http://specs.openid.net/auth/2.0',
    'openid.identity':   'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.return_to':  returnTo,
    'openid.realm':      base,
  });

  return res.redirect(`https://steamcommunity.com/openid/login?${params}`);
}
