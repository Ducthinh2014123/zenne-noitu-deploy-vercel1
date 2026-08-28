import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [url, setUrl]   = useState('');
  const [key, setKey]   = useState('');
  const [err, setErr]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUrl(localStorage.getItem('nt_api_url') || '');
    setKey(localStorage.getItem('nt_api_key') || '');
  }, []);

  const login = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    const base = url.trim().replace(/\/$/, '');
    try {
      const r = await fetch(base + '/api/pending', { headers: { 'X-API-Key': key.trim() } });
      if (r.status === 403) { setErr('Sai API Key!'); return; }
      if (!r.ok) { setErr('Loi ket noi: ' + r.status); return; }
      localStorage.setItem('nt_api_url', base);
      localStorage.setItem('nt_api_key', key.trim());
      router.push('/pending');
    } catch { setErr('Khong ket noi duoc den API.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Head><title>Dang nhap — Noi Tu Admin</title></Head>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🐟</div>
            <h1 className="text-2xl font-bold text-white">Nối Từ Bot</h1>
            <p className="text-gray-500 text-sm mt-1">Admin Dashboard</p>
          </div>
          <form onSubmit={login} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
            {err && <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">⚠️ {err}</div>}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">API URL</label>
              <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                placeholder="http://nile.hidencloud.com:24702" value={url} onChange={e => setUrl(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">API Key</label>
              <input type="password" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                placeholder="mat-khau-api" value={key} onChange={e => setKey(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors">
              {loading ? 'Dang ket noi...' : '🚀 Dang nhap'}
            </button>
            <div className="text-center pt-2">
              <a href="/pub" className="text-sm text-indigo-400 hover:text-indigo-300">🌍 Xem trang public →</a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
