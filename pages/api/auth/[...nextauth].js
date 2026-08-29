import NextAuth from 'next-auth';
import GoogleProvider   from 'next-auth/providers/google';
import GitHubProvider   from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import DiscordProvider  from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';

const BOT_API      = (process.env.BOT_API_URL || '').replace(/\/$/, '');
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

async function upsertOAuthUser({ provider, providerAccountId, name, email, image }) {
  if (!BOT_API) return { id: providerAccountId, name, email, image, isAdmin: ADMIN_EMAILS.includes((email||'').toLowerCase()) };
  try {
    const r = await fetch(BOT_API + '/pub/auth/oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, provider_id: providerAccountId, name, email, image }),
    });
    if (r.ok) {
      const d = await r.json();
      d.isAdmin = d.is_admin || ADMIN_EMAILS.includes((email||'').toLowerCase());
      return d;
    }
  } catch (e) { console.error('[auth/oauth]', e); }
  return { id: providerAccountId, name, email, image, isAdmin: ADMIN_EMAILS.includes((email||'').toLowerCase()) };
}

/** Xac thuc Steam one-time token duoc tao boi steam-callback.js */
function verifySteamToken(token) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'fallback';
    const [b64, sig] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', secret).update(b64).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))) return null;
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString());
    if (Date.now() > payload.exp) return null; // het han
    return payload;
  } catch { return null; }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID     || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId:     process.env.GITHUB_ID     || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId:     process.env.FACEBOOK_CLIENT_ID     || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    DiscordProvider({
      clientId:     process.env.DISCORD_CLIENT_ID     || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id:   'credentials',
      name: 'Email & Mat khau',
      credentials: {
        email:      { label: 'Email',     type: 'email'    },
        password:   { label: 'Mat khau',  type: 'password' },
        totpCode:   { label: 'Ma OTP',    type: 'text'     },
        steamToken: { label: 'Steam JWT', type: 'text'     }, // dung cho Steam flow
      },
      async authorize(credentials) {
        // ─── Steam one-time token flow ───
        if (credentials?.steamToken) {
          const payload = verifySteamToken(credentials.steamToken);
          if (!payload) return null;
          return {
            id:       payload.id,
            name:     payload.name,
            email:    payload.email,
            image:    payload.image,
            isAdmin:  payload.isAdmin || ADMIN_EMAILS.includes((payload.email||'').toLowerCase()),
            username: payload.username || payload.name,
            provider: 'steam',
          };
        }

        // ─── Email + password flow ───
        if (!credentials?.email || !credentials?.password) return null;
        if (!BOT_API) return null;
        try {
          const r = await fetch(BOT_API + '/pub/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!r.ok) return null;
          const user = await r.json();
          if (!user?.id) return null;

          // Kiem tra 2FA
          if (user.totp_enabled) {
            if (!credentials.totpCode) throw new Error('Needs2FA');
            const r2 = await fetch(BOT_API + '/pub/auth/verify-2fa', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: user.id, code: credentials.totpCode }),
            });
            if (!r2.ok) throw new Error('Invalid2FA');
          }

          user.isAdmin  = ADMIN_EMAILS.includes((user.email||'').toLowerCase()) || user.is_admin;
          user.username = user.username || user.name;
          return user;
        } catch (e) {
          if (e.message === 'Needs2FA' || e.message === 'Invalid2FA') throw e;
          console.error('[auth/credentials]', e);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn:  '/auth/login',
    error:   '/auth/login',
    signOut: '/auth/login',
  },

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.type === 'oauth') {
        const dbUser = await upsertOAuthUser({
          provider:          account.provider,
          providerAccountId: account.providerAccountId,
          name:  user.name,
          email: user.email,
          image: user.image,
        });
        user.id       = dbUser.id       || user.id;
        user.isAdmin  = dbUser.isAdmin  || ADMIN_EMAILS.includes((user.email||'').toLowerCase());
        user.username = dbUser.username || user.name;
        user.provider = account.provider;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id;
        token.isAdmin  = user.isAdmin  || false;
        token.username = user.username || user.name;
        token.image    = user.image;
        token.provider = user.provider || 'credentials';
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id       = token.id;
      session.user.isAdmin  = token.isAdmin  || false;
      session.user.username = token.username || session.user.name;
      session.user.image    = token.image    || session.user.image;
      session.user.provider = token.provider || 'credentials';
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
