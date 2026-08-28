import { useEffect, useState, useCallback } from 'react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';

const LIMIT = 50;

export default function PubRejected() {
  const [data, setData]   = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ]         = useState('');
  const [page, setPage]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr]     = useState('');

  const load = useCallback((q_, page_) => {
    setLoading(true);
    pubApi.rejected({ q: q_, limit: LIMIT, offset: page_ * LIMIT })
      .then(r => { setData(r.data); setTotal(r.total); setErr(''); })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(q, page); }, [q, page]);

  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <PubLayout title="🚫 Từ Bị Từ Chối">
      {err && <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">⚠️ {err}</div>}

      <p className="text-gray-500 text-sm mb-4">
        Danh sách các từ đã bị admin từ chối không đưa vào kho.
      </p>

      <div className="flex gap-3 mb-6">
        <input
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          placeholder="🔍 Tìm kiếm..."
          value={q}
          onChange={e => { setQ(e.target.value); setPage(0); }}
        />
        <span className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm whitespace-nowrap">
          🛋️ {total.toLocaleString()} từ
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-6">
            {data.map((w, i) => (
              <div key={i} className="px-3 py-2 bg-gray-900 border border-red-900/40 rounded-lg text-center">
                <div className="font-semibold text-red-300 line-through">{w.word}</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {w.submitted_at ? new Date(w.submitted_at).toLocaleDateString('vi-VN') : ''}
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">Không tìm thấy.</div>
            )}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 text-sm">← Trước</button>
              <span className="px-4 py-2 text-sm text-gray-400">Trang {page+1}/{pages}</span>
              <button onClick={() => setPage(p => Math.min(pages-1, p+1))} disabled={page >= pages-1}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 text-sm">Tiếp →</button>
            </div>
          )}
        </>
      )}
    </PubLayout>
  );
}
