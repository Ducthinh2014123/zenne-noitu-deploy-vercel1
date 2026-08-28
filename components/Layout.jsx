import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { api, clearConfig, isConfigured } from '../lib/api';

const NAV = [
  { href: '/pending',     icon: '⏳', label: 'Duyệt Từ' },
  { href: '/wordbank',    icon: '📖', label: 'Kho Từ' },
  { href: '/leaderboard', icon: '🏆', label: 'Bảng Xếp Hạng' },
];

export default function Layout({ children, title = '' }) {
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isConfigured()) { router.push('/'); return; }
    api.stats().then(setStats).catch(() => {});
  }, [router]);

  const logout = () => { clearConfig(); router.push('/'); };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-100 flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="px-5 py-5 border-b border-gray-700">
          <div className="text-lg font-bold text-white">🔤 Nối Từ</div>
          <div className="text-xs text-gray-400 mt-0.5">Admin Dashboard</div>
        </div>

        {/* stats mini */}
        {stats && (
          <div className="px-4 py-3 border-b border-gray-700 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">⏳ Chờ duyệt</span>
              <span className="font-bold text-yellow-400">{stats.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">📖 Kho từ</span>
              <span className="font-bold text-green-400">{stats.wordbank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">🌐 Server</span>
              <span className="font-bold text-blue-400">{stats.guilds}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === href
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{icon}</span> {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
