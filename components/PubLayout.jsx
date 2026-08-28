import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV = [
  { href: '/pub',              icon: '🏠', label: 'Trang Chủ'      },
  { href: '/pub/leaderboard',  icon: '🏆', label: 'Bảng Xếp Hạng' },
  { href: '/pub/wordbank',     icon: '📚', label: 'Kho Từ'         },
  { href: '/pub/rejected',     icon: '🚫', label: 'Từ Bị Từ Chối' },
  { href: '/pub/servers',      icon: '🌐', label: 'Servers'        },
  { href: '/pub/milestones',   icon: '🎯', label: 'Cột Mốc'        },
  { href: '/pub/play',         icon: '🎮', label: 'Chơi Online'    },
];

export default function PubLayout({ children, title = 'Nối Từ Bot' }) {
  const router = useRouter();
  const isActive = (href) =>
    href === '/pub'
      ? router.pathname === '/pub'
      : router.pathname.startsWith(href);

  return (
    <>
      <Head>
        <title>{title} — Nối Từ Bot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Trang thông tin công khai của Nối Từ Bot Discord" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/pub" className="flex items-center gap-2 font-bold text-lg text-white hover:text-indigo-400 transition-colors">
              <span className="text-2xl">🐟</span>
              <span>Nối Từ Bot</span>
            </Link>
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
              {NAV.map(n => (
                <Link key={n.href} href={n.href}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive(n.href)
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}>
                  <span>{n.icon}</span>
                  <span className="hidden sm:inline">{n.label}</span>
                </Link>
              ))}
              <Link href="/" className="ml-2 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-colors whitespace-nowrap">
                Admin →
              </Link>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {title && (
            <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>
          )}
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-600">
          <p>🐟 Nối Từ Bot — Powered by Python + aiohttp + Next.js</p>
          <p className="mt-1">
            <Link href="/pub" className="hover:text-gray-400">Trang Chủ</Link>
            {' · '}
            <Link href="/pub/play" className="hover:text-gray-400">Chơi Online</Link>
            {' · '}
            <Link href="/" className="hover:text-gray-400">Admin Dashboard</Link>
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
