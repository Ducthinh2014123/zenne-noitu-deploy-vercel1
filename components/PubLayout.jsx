import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useI18n } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { IconHome, IconTrophy, IconBookOpen, IconBan, IconGlobe, IconTarget, IconGamepad, IconHash, IconSettings, IconLogOut, IconLogIn } from './icons';

const NAV = [
  { href: '/pub',             Icon: IconHome, key: 'nav_home' },
  { href: '/pub/leaderboard', Icon: IconTrophy, key: 'nav_leaderboard' },
  { href: '/pub/wordbank',    Icon: IconBookOpen, key: 'nav_wordbank' },
  { href: '/pub/rejected',    Icon: IconBan, key: 'nav_rejected' },
  { href: '/pub/servers',     Icon: IconGlobe, key: 'nav_servers' },
  { href: '/pub/milestones',  Icon: IconTarget, key: 'nav_milestones' },
  { href: '/pub/play',        Icon: IconGamepad, key: 'nav_play' },
  { href: '/pub/2048',        Icon: IconHash, label: '2048' },
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
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/pub" className="font-bold text-lg text-white hover:text-indigo-400 flex items-center gap-2">
              <IconHash className="w-5 h-5 text-indigo-400" /> {t('brand')}
            </Link>
            <div className="flex items-center gap-1 overflow-x-auto">
              {NAV.map(n => (
                <Link key={n.href} href={n.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive(n.href) ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}>
                  <n.Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{n.label ?? t(n.key)}</span>
                </Link>
              ))}
              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-gray-800 flex-shrink-0">
                <LanguageSwitcher />
                {authStatus === 'authenticated' && (
                  <>
                    <Link href="/account"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        router.pathname === '/account' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}>
                      <IconSettings className="w-4 h-4" />
                      <span className="hidden md:inline">{session?.user?.username || session?.user?.name || t('account')}</span>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/auth/login' })} title={t('logout')}
                      className="px-2 py-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg">
                      <IconLogOut className="w-4 h-4" />
                    </button>
                  </>
                )}
                {authStatus === 'unauthenticated' && (
                  <Link href="/auth/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-500">
                    <IconLogIn className="w-4 h-4" /> <span className="hidden md:inline">{t('login')}</span>
                  </Link>
                )}
                <Link href="/pending" className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-400 hover:bg-gray-800 rounded-lg whitespace-nowrap">
                  {t('admin')} →
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {pageTitle && <h1 className="text-2xl font-bold text-white mb-6">{pageTitle}</h1>}
          {children}
        </main>
        <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600 flex items-center justify-center gap-1.5">
          <IconHash className="w-3.5 h-3.5" /> {t('brand')} · <Link href="/pub/play" className="hover:text-gray-400">{t('nav_play')}</Link>
          {' · '}<Link href="/pending" className="hover:text-gray-400">{t('admin')}</Link>
        </footer>
      </div>
    </>
  );
}
