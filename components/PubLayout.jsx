import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useI18n } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import {
  IconHome, IconTrophy, IconBookOpen, IconBan, IconGlobe, IconTarget,
  IconGamepad, IconGrid2x2, IconSettings, IconLogOut, IconLogIn, IconChevronRight,
  IconLink,
} from './icons';

const NAV = [
  { href: '/pub',             Icon: IconHome,     key: 'nav_home' },
  { href: '/pub/leaderboard', Icon: IconTrophy,   key: 'nav_leaderboard' },
  { href: '/pub/wordbank',    Icon: IconBookOpen, key: 'nav_wordbank' },
  { href: '/pub/rejected',    Icon: IconBan,      key: 'nav_rejected' },
  { href: '/pub/servers',     Icon: IconGlobe,    key: 'nav_servers' },
  { href: '/pub/milestones',  Icon: IconTarget,   key: 'nav_milestones' },
  { href: '/pub/play',        Icon: IconGamepad,  key: 'nav_play' },
  { href: '/pub/games',       Icon: IconGrid2x2,  key: 'nav_games' },
];

export default function PubLayout({ children, title }) {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { t } = useI18n();
  const pageTitle = title === undefined ? t('brand') : title;
  const isActive = (href) => href === '/pub' ? router.pathname === '/pub' : router.pathname.startsWith(href);
  return (
    <>
      <Head>
        <title>{pageTitle} — {t('brand')}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-950 flex flex-row">
        {/* Collapsible Sidebar */}
        <aside className="sidebar fixed top-0 left-0 bottom-0 z-50 flex flex-col justify-between py-3 shadow-2xl text-white select-none">
          {/* Top Brand Logo */}
          <div className="px-2.5 py-1 flex items-center h-14 flex-shrink-0">
            <Link href="/pub" className="flex items-center gap-3 w-full group">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 border border-white/30 text-white flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <IconLink className="w-5 h-5" />
              </span>
              <span className="font-bold text-base text-white tracking-wide whitespace-nowrap overflow-hidden transition-opacity">
                {t('brand')}
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll py-2 px-2 space-y-1">
            {NAV.map(({ href, Icon, key, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label ?? t(key)}
                  className={`flex items-center h-11 px-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors group ${
                    active
                      ? 'bg-white/25 text-white font-semibold shadow-inner'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <span className="ml-3 whitespace-nowrap overflow-hidden">
                    {label ?? t(key)}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Settings / Language / Auth */}
          <div className="px-2 pt-2 pb-1 border-t border-white/20 flex flex-col gap-1 flex-shrink-0">
            <LanguageSwitcher inSidebar />

            {authStatus === 'authenticated' && (
              <div className="flex items-center gap-1">
                <Link
                  href="/account"
                  title={t('account')}
                  className={`flex-1 flex items-center h-10 px-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    router.pathname === '/account'
                      ? 'bg-white/25 text-white'
                      : 'text-white/85 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <IconSettings className="w-5 h-5" />
                  </div>
                  <span className="ml-3 truncate max-w-[130px]">
                    {session?.user?.username || session?.user?.name || t('account')}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  title={t('logout')}
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
                >
                  <IconLogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {authStatus === 'unauthenticated' && (
              <Link
                href="/auth/login"
                title={t('login')}
                className="flex items-center h-10 px-2.5 rounded-xl text-sm font-medium whitespace-nowrap bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <IconLogIn className="w-5 h-5" />
                </div>
                <span className="ml-3">{t('login')}</span>
              </Link>
            )}

            <Link
              href="/pending"
              title={t('admin')}
              className="flex items-center h-9 px-2.5 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/15 transition-colors whitespace-nowrap"
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <IconChevronRight className="w-4 h-4" />
              </div>
              <span className="ml-3">{t('admin')}</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0" style={{ paddingLeft: 'var(--sidebar-closed)' }}>
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
            {pageTitle && <h1 className="text-2xl font-bold text-white mb-6">{pageTitle}</h1>}
            {children}
          </main>
          <footer className="border-t border-gray-800 py-4">
            <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-2 text-xs text-gray-600">
              <IconLink className="w-3.5 h-3.5" />
              <span>{t('brand')}</span>
              <span>·</span>
              <Link href="/pub/play" className="hover:text-gray-400">{t('nav_play')}</Link>
              <span>·</span>
              <Link href="/pending" className="hover:text-gray-400">{t('admin')}</Link>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
