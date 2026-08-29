import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

const NAV = [
  { href: '/pub',             icon: '🏠', label: 'Trang Chủ' },
  { href: '/pub/leaderboard', icon: '🏆', label: 'BXH' },
  { href: '/pub/wordbank',    icon: '📚', label: 'Kho Từ' },
  { href: '/pub/rejected',    icon: '🚫', label: 'Từ Chối' },
  { href: '/pub/servers',     icon: '🌐', label: 'Servers' },
  { href: '/pub/milestones',  icon: '🎯', label: 'Cột Mốc' },
  { href: '/pub/play',        icon: '🎮', label: 'Chơi' },
];

function UserMenu({ session }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const u = session.user;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-800 transition-colors">
        {u.image
          ? <img src={u.image} alt={u.name} className="w-7 h-7 rounded-full object-cover"/>
          : <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{(u.username||u.name||'U')[0].toUpperCase()}</div>
        }
        <span className="text-sm text-gray-300 hidden sm:block max-w-[100px] truncate">{u.username || u.name}</span>
        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open?'rotate-180':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50 text-sm">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="font-semibold text-white truncate">{u.username || u.name}</p>
            <p className="text-gray-500 text-xs truncate">{u.email}</p>
            {u.isAdmin && <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-yellow-900/60 border border-yellow-700/50 rounded text-yellow-300">⭐ Admin</span>}
          </div>
          {/* Menu items */}
          <div className="py-1">
            <button onClick={() => { setOpen(false); router.push('/account'); }}
              className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2.5">
              <span>⚙️</span> Tài khoản & Bảo mật
            </button>
            {u.isAdmin && (
              <button onClick={() => { setOpen(false); router.push('/pending'); }}
                className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2.5">
                <span>🛡️</span> Admin Dashboard
              </button>
            )}
            <div className="border-t border-gray-800 mt-1 pt-1">
              <button onClick={() => { setOpen(false); signOut({ callbackUrl: '/auth/login' }); }}
                className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-900/30 hover:text-red-300 flex items-center gap-2.5">
                <span>🚪</span> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PubLayout({ children, title = 'Nối Từ Bot' }) {
  const router = useRouter();
  const { data: session } = useSession();
  const active = (href) => href === '/pub' ? router.pathname === '/pub' : router.pathname.startsWith(href);

  return (
    <>
      <Head><title>{title} — Nối Từ Bot</title><meta name="viewport" content="width=device-width,initial-scale=1" /></Head>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <Link href="/pub" className="font-bold text-lg text-white flex items-center gap-2 flex-shrink-0">
              <span>🐟</span><span className="hidden sm:block">Nối Từ Bot</span>
            </Link>

            <div className="flex items-center gap-1 overflow-x-auto flex-1 justify-center">
              {NAV.map(n => (
                <Link key={n.href} href={n.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    active(n.href) ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}>
                  {n.icon} <span className="hidden md:inline">{n.label}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {session
                ? <UserMenu session={session}/>
                : <Link href="/auth/login" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Đăng nhập</Link>
              }
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {title && <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>}
          {children}
        </main>

        <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
          🐟 Nối Từ Bot ·{' '}
          <Link href="/pub/play" className="hover:text-gray-400">Chơi Online</Link> ·{' '}
          {session ? <button onClick={() => signOut({callbackUrl:'/auth/login'})} className="hover:text-gray-400">Đăng xuất</button> : <Link href="/auth/login" className="hover:text-gray-400">Đăng nhập</Link>}
        </footer>
      </div>
    </>
  );
}
