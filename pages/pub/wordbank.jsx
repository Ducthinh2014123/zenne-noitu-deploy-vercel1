import { useEffect, useState, useCallback } from 'react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';

const LIMIT = 60;

export default function PubWordbank() {
  const [data, setData]   = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ]         = useState('');
  const [page, setPage]   = useState(0);
  const [loading, setL]   = useState(true);
  const [err, setErr]     = useState('');

  const load = useCallback((q_, pg) => {
    setL(true);
    pubApi.wordbank({ q: q_, limit: LIMIT, offset: pg * LIMIT })
      .then(r => { setData(r.data||[]); setTotal(r.total||0); setErr(''); })
      .catch(e => setErr(e.message))
      .finally(() => setL(false));
  }, []);

  useEffect(() => { load(q, page); }, [q, page, load]);

  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <PubLayout title="📚 Kho Từ Đã Duyệt">
      {err && <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">⚠️ {err}</div>}
      <div className="flex gap-3 mb-6">
        <input className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          placeholder="🔍 Tìm kiếm từ..." value={q} onChange={e => { setQ(e.target.value); setPage(0); }} />
        <span className="flex items-center px-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm whitespace-nowrap">
          📌 {total.toLocaleString()} từ
        </span>
      </div>
      {loading
        ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"/></div>
        : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
              {data.map((w, i) => (
                <div key={i} className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-center hover:border-indigo-500 transition-colors">
                  <div className="font-semibold text-white">{w.word}</div>
                  <div className="text-xs text-gray-600">{w.added_at ? new Date(w.added_at).toLocaleDateString('vi-VN') : ''}</div>
                </div>
              ))}
              {data.length===0 && <div className="col-span-full text-center py-16 text-gray-500">Không tìm thấy từ nào.</div>}
            </div>
            {pages > 1 && (
              <div className="flex justify-center gap-2">
                <button onClick={() => setPage(p=>Math.max(0,p-1))} disabled={page===0} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 text-sm">← Trước</button>
                <span className="px-4 py-2 text-sm text-gray-400">Trang {page+1}/{pages}</span>
                <button onClick={() => setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 text-sm">Tiếp →</button>
              </div>
            )}
          </>
        )
      }
    </PubLayout>
  );
}
