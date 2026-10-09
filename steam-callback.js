/**
 * Buoc 2: Steam redirect ve day, validate OpenID va tao session
 * Env can: NEXTAUTH_URL, NEXTAUTH_SECRET, STEAM_API_KEY, BOT_API_URL, BOT_ADMIN_API_KEY
 */
import crypto from 'crypto';

const STEAM_OPENID = 'https://steamcommunity.com/openid/login';

async function verifySteamOpenId(query) {
  // Gui lai Steam de xac nhan
  const verifyParams = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (k.startsWith('openid.')) verifyParams.set(k, v);
  }
  verifyParams.set('openid.mode', 'check_authentication');

  const r = await fetch(STEAM_OPENID, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: verifyParams.toString(),
  });
  const text = await r.text();
  return text.includes('is_valid:true');
}

async function fetchSteamProfile(steamId) {
  const key = process.env.STEAM_API_KEY || '';
  if (!key) {
    // Khong co API key, tra ve thong tin toi gian
    return { steamId, name: `Steam:${steamId}`, avatar: null, email: null };
  }
  try {
    const r = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamId}`
    );
    const d = await r.json();
    const p = d?.response?.players?.[0];
    if (!p) return { steamId, name: `Steam:${steamId}`, avatar: null, email: null };
    return {
      steamId:  p.steamid,
      name:     p.personaname,
      avatar:   p.avatarfull,
      email:    null, // Steam khong cung cap email
      profileUrl: p.profileurl,
    };
  } catch {
    return { steamId, name: `Steam:${steamId}`, avatar: null, email: null };
  }
}

async function upsertSteamUser(profile) {
  const base = (process.env.BOT_API_URL || '').replace(/\/$/, '');
  const key  = process.env.BOT_ADMIN_API_KEY || '';
  if (!base) return null;
  try {
    const r = await fetch(base + '/pub/auth/oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify({
        provider:    'steam',
        provider_id: profile.steamId,
        name:        profile.name,
        email:       profile.email || `steam_${profile.steamId}@noitu.local`,
        image:       profile.avatar,
      }),
    });
    if (r.ok) return await r.json();
  } catch (e) { console.error('[steam-callback/upsert]', e); }
  return null;
}

function signToken(payload) {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback';
  const b64    = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig    = crypto.createHmac('sha256', secret).update(b64).digest('hex');
  return `${b64}.${sig}`;
}

export default async function handler(req, res) {
  const base = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const errRedirect = (msg) => res.redirect(`${base}/auth/login?error=SteamError&steam_msg=${encodeURIComponent(msg)}`);

  const claimedId = req.query['openid.claimed_id'] || '';
  if (!claimedId) return errRedirect('Khong co claimed_id');

  // Lay Steam ID tu URL: https://steamcommunity.com/openid/id/76561198xxxxxx
  const steamId = claimedId.split('/').pop();
  if (!/^\d{17}$/.test(steamId)) return errRedirect('Steam ID khong hop le');

  // Xac thuc voi Steam
  const valid = await verifySteamOpenId(req.query);
  if (!valid) return errRedirect('Steam xac thuc that bai');

  // Lay profile
  const profile = await fetchSteamProfile(steamId);

  // Upsert vao DB cua bot
  const dbUser = await upsertSteamUser(profile);

  // Tao signed token de truyen ve frontend
  const tokenPayload = {
    id:       dbUser?.id       || steamId,
    name:     profile.name,
    email:    dbUser?.email    || `steam_${steamId}@noitu.local`,
    image:    profile.avatar,
    isAdmin:  dbUser?.is_admin || false,
    username: profile.name,
    provider: 'steam',
    exp:      Date.now() + 60_000, // 60 giay
  };
  const steamToken = signToken(tokenPayload);

  return res.redirect(`${base}/auth/login?steam_token=${encodeURIComponent(steamToken)}`);
}
