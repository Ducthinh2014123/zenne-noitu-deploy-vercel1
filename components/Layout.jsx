import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IconClock, IconBookOpen, IconTrophy, IconGlobe, IconHash, IconLogOut } from './icons';

const NAV = [
  { href: '/pending',    Icon: IconClock, label: 'Duyệt Từ' },
  { href: '/wordbank',   Icon: IconBookOpen, label: 'Kho Từ' },
  { href: '/leaderboard',Icon: IconTrophy, label: 'Bảng Xếp Hạng' },
  { href: '/servers',    Icon: IconGlobe, label: 'Server' },
];

export default function Layout({ children, title = 'Admin' }) {
  const router = useRouter();
  const logout = () => { localStorage.removeItem('nt_api_url'); localStorage.removeItem('nt_api_key'); router.push('/pending'); };
  return (
    <>
      <Head><title>{title} — Nối Từ Admin</title></Head>
      <div className="flex min-h-screen bg-gray-950">
        <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h1 className="font-bold text-white flex items-center gap-2"><IconHash className="w-4 h-4 text-indigo-400" /> Nối Từ</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  router.pathname === n.href
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}>
                <n.Icon className="w-4 h-4" /> {n.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-800 mt-3">
              <Link href="/pub" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-indigo-400 hover:bg-gray-800">
                <IconGlobe className="w-4 h-4" /> Trang Public
              </Link>
            </div>
          </nav>
          <div className="p-3 border-t border-gray-800">
            <button onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-gray-800">
              <IconLogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-auto">
          {title && <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </>
  );
}
