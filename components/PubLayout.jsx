import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

const NAV = [
  { href: '/pub',             icon: '🏠', label: 'Trang Chủ' },
  { href: '/pub/leaderboard', icon: '🏆', label: 'BXH' },
  { href: '/pub/wordbank',    icon: '📚', label: 'Kho Từ' },
  { href: '/pub/rejected',    icon: '🚫', label: 'Bị Từ Chối' },
  { href: '/pub/servers',     icon: '🌐', label: 'Servers' },
  { href: '/pub/milestones',  icon: '🎯', label: 'Cột Mốc' },
  { href: '/pub/play',        icon: '🎮', label: 'Chơi Online' },
];

export default function PubLayout({ children, title = 'Nối Từ Bot' }) {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const isActive = (href) => href === '/pub' ? router.pathname === '/pub' : router.pathname.startsWith(href);
  return (
    <>
      <Head>
        <title>{title} — Nối Từ Bot</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/pub" className="font-bold text-lg text-white hover:text-indigo-400 flex items-center gap-2">
              🐟 Nối Từ Bot
            </Link>
            <div className="flex items-center gap-1 overflow-x-auto">
              {NAV.map(n => (
                <Link key={n.href} href={n.href}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive(n.href) ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}>
                  <span>{n.icon}</span>
                  <span className="hidden md:inline">{n.label}</span>
                </Link>
              ))}
              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-gray-800 flex-shrink-0">
                {authStatus === 'authenticated' && (
                  <>
                    <Link href="/account"
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        router.pathname === '/account' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}>
                      <span>⚙️</span>
                      <span className="hidden md:inline">{session?.user?.username || session?.user?.name || 'Tài khoản'}</span>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/auth/login' })} title="Đăng xuất"
                      className="px-2 py-1.5 text-xs text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg">
                      🚪
                    </button>
                  </>
                )}
                {authStatus === 'unauthenticated' && (
                  <Link href="/auth/login"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-500">
                    🔑 <span className="hidden md:inline">Đăng nhập</span>
                  </Link>
                )}
                <Link href="/pending" className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-400 hover:bg-gray-800 rounded-lg whitespace-nowrap">
                  Admin →
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {title && <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>}
          {children}
        </main>
        <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
          🐟 Nối Từ Bot · <Link href="/pub/play" className="hover:text-gray-400">Chơi Online</Link>
          {' · '}<Link href="/pending" className="hover:text-gray-400">Admin</Link>
        </footer>
      </div>
    </>
  );
}
