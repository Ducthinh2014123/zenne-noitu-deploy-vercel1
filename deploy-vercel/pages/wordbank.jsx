import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { IconChevronLeft, IconChevronRight } from '../components/icons';

export default function AdminWordbank() {
  const router = useRouter();
  const [data,  setData]  = useState([]);
  const [total, setTotal] = useState(0);
  const [q,     setQ]     = useState('');
  const [page,  setPage]  = useState(0);
  const [loading, setL]   = useState(true);
  const [msg,   setMsg]   = useState('');
  const LIMIT = 50;

  const load = useCallback((q_, pg) => {
    setL(true);
    api.wordbank({ q: q_, limit: LIMIT, offset: pg * LIMIT })
      .then(r => { setData(r.data||[]); setTotal(r.total||0); })
      .catch(() => router.push('/'))
      .finally(() => setL(false));
  }, [router]);

  useEffect(() => { if (!localStorage.getItem('nt_api_url')) { router.push('/'); return; } load(q, page); }, [load, q, page, router]);

  const del = async (word) => {
    if (!confirm('Xoa tu "' + word + '"?')) return;
    try { await api.deleteWord(word); setMsg('Da xoa ' + word); load(q, page); }
    catch { setMsg('Loi khi xoa!'); }
  };

  const pages = Math.max(1, Math.ceil(total / LIMIT));
  return (
    <Layout title="Kho Tu">
      {msg && <div className="mb-4 p-3 bg-indigo-900/30 border border-indigo-700 rounded-lg text-indigo-300 text-sm">{msg}</div>}
      <div className="flex gap-3 mb-5">
        <input className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          placeholder="Tim tu..." value={q} onChange={e => { setQ(e.target.value); setPage(0); }} />
        <span className="flex items-center px-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm">{total.toLocaleString()} tu</span>
      </div>
      {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"/></div> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-5">
            {data.map((w,i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 group hover:border-red-800">
                <span className="text-white text-sm">{w.word}</span>
                <button onClick={() => del(w.word)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 ml-1 text-xs">×</button>
              </div>
            ))}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-40 hover:bg-gray-700 text-sm"><IconChevronLeft className="w-4 h-4" /></button>
              <span className="px-4 py-2 text-sm text-gray-400">Trang {page+1}/{pages}</span>
              <button onClick={() => setPage(p => Math.min(pages-1,p+1))} disabled={page>=pages-1} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-40 hover:bg-gray-700 text-sm"><IconChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
