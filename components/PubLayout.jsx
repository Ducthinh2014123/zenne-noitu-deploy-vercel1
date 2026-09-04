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
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <header className="bg-gray-900/95 backdrop-blur border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <Link href="/pub" className="flex items-center gap-2 font-bold text-base text-white hover:text-indigo-400 transition-colors flex-shrink-0">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <IconLink className="w-4 h-4" />
              </span>
              <span className="hidden sm:inline">{t('brand')}</span>
            </Link>
            <nav className="flex items-center gap-0.5 overflow-x-auto">
              {NAV.map(({ href, Icon, key, label }) => (
                <Link key={href} href={href} title={label ?? t(key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive(href) ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">{label ?? t(key)}</span>
                </Link>
              ))}
              <div className="flex items-center gap-0.5 ml-1 pl-1.5 border-l border-gray-800 flex-shrink-0">
                <LanguageSwitcher />
                {authStatus === 'authenticated' && (
                  <>
                    <Link href="/account" title={t('account')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        router.pathname === '/account' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}>
                      <IconSettings className="w-4 h-4" />
                      <span className="hidden md:inline">{session?.user?.username || session?.user?.name || t('account')}</span>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/auth/login' })} title={t('logout')}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg">
                      <IconLogOut className="w-4 h-4" />
                    </button>
                  </>
                )}
                {authStatus === 'unauthenticated' && (
                  <Link href="/auth/login"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
                    <IconLogIn className="w-4 h-4" />
                    <span className="hidden md:inline">{t('login')}</span>
                  </Link>
                )}
                <Link href="/pending" title={t('admin')}
                  className="flex items-center gap-0.5 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-400 hover:bg-gray-800 rounded-lg whitespace-nowrap">
                  <span className="hidden lg:inline">{t('admin')}</span>
                  <IconChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </nav>
          </div>
        </header>
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
    </>
  );
}
