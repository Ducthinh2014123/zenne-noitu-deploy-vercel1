import NextAuth from 'next-auth';
import GoogleProvider   from 'next-auth/providers/google';
import GitHubProvider   from 'next-auth/providers/github';
import DiscordProvider  from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';

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
    DiscordProvider({
      clientId:     process.env.DISCORD_CLIENT_ID     || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id:   'credentials',
      name: 'Email & Mat khau',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Mat khau', type: 'password' },
        totpCode: { label: 'Ma OTP',   type: 'text'     },
      },
      async authorize(credentials) {
        // ─── Email + password flow ───
        if (!credentials?.email || !credentials?.password) return null;
        if (!BOT_API) return null;
        try {
          const r = await fetch(BOT_API + '/pub/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          let user = {};
          try { user = await r.json(); } catch {}
          if (!r.ok) {
            if (user?.error === 'EmailNotVerified') throw new Error('EmailNotVerified');
            return null;
          }
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
          if (e.message === 'Needs2FA' || e.message === 'Invalid2FA' || e.message === 'EmailNotVerified') throw e;
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
