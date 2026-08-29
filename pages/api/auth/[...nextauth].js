import NextAuth from 'next-auth';
import GoogleProvider    from 'next-auth/providers/google';
import GitHubProvider    from 'next-auth/providers/github';
import FacebookProvider  from 'next-auth/providers/facebook';
import AzureADProvider   from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';

const BOT_API = (process.env.BOT_API_URL || '').replace(/\/$/, '');
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
    FacebookProvider({
      clientId:     process.env.FACEBOOK_CLIENT_ID     || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    AzureADProvider({
      clientId:     process.env.AZURE_AD_CLIENT_ID     || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId:     process.env.AZURE_AD_TENANT_ID     || 'common',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Mat khau',
      credentials: {
        email:     { label: 'Email',     type: 'email'    },
        password:  { label: 'Mat khau',  type: 'password' },
        totpCode:  { label: 'Ma OTP',    type: 'text'     },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (!BOT_API) return null;
        try {
          // B1: Verify email + password
          const r = await fetch(BOT_API + '/pub/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!r.ok) return null;
          const user = await r.json();
          if (!user?.id) return null;

          // B2: Neu 2FA bat, kiem tra OTP
          if (user.totp_enabled) {
            if (!credentials.totpCode) {
              // Thong bao frontend can nhap OTP
              throw new Error('Needs2FA');
            }
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
          // Re-throw known errors so NextAuth passes them to the login page
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
