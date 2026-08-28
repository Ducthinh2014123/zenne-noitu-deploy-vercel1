import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { api, isConfigured } from '../lib/api';

const LIMIT = 50;
const TABS = [
  { key: 'pending',  label: '⏳ Đang chờ',    cls: 'badge-pending'  },
  { key: 'approved', label: '✅ Đã duyệt',     cls: 'badge-approved' },
  { key: 'rejected', label: '❌ Đã từ chối',   cls: 'badge-rejected' },
];

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt + 'Z').toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

export default function Pending() {
  const router = useRouter();
  const [tab,    setTab]    = useState('pending');
  const [rows,   setRows]   = useState([]);
  const [total,  setTotal]  = useState(0);
  const [page,   setPage]   = useState(0);
  const [search, setSearch] = useState('');
  const [loading,setLoading]= useState(false);
  const [sel,    setSel]    = useState(new Set());
  const [toast,  setToast]  = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const load = useCallback(async () => {
    setLoading(true);
    setSel(new Set());
    try {
      const res = await api.pending({ status: tab, limit: LIMIT, offset: page * LIMIT, q: search });
      setRows(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      showToast('❌ Lỗi: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [tab, page, search]);

  useEffect(() => {
    if (!isConfigured()) { router.push('/'); return; }
    load();
  }, [load, router]);

  const review = async (id, approve) => {
    try {
      const r = await api.review(id, approve);
      showToast(approve ? `✅ Đã duyệt "${r.word}"` : `❌ Đã từ chối "${r.word}"`);
      load();
    } catch (e) { showToast('❌ ' + e.message); }
  };

  const bulkReview = async (approve) => {
    if (!sel.size) return;
    try {
      const r = await api.reviewBulk([...sel], approve);
      showToast(`${approve ? '✅' : '❌'} Đã xử lý ${r.processed} từ`);
      load();
    } catch (e) { showToast('❌ ' + e.message); }
  };

  const toggleAll = () => {
    if (sel.size === rows.length) setSel(new Set());
    else setSel(new Set(rows.map((r) => r.id)));
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Layout title="Duyệt Từ">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">{total} từ</span>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            className="input max-w-xs"
            placeholder="🔍 Tìm từ..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          {tab === 'pending' && sel.size > 0 && (
            <div className="flex gap-2 ml-auto">
              <span className="self-center text-sm text-gray-500">{sel.size} đã chọn</span>
              <button onClick={() => bulkReview(true)}  className="btn-success">✅ Duyệt tất cả</button>
              <button onClick={() => bulkReview(false)} className="btn-danger" >❌ Từ chối tất cả</button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table>
            <thead>
              <tr>
                {tab === 'pending' && (
                  <th className="w-10">
                    <input type="checkbox" onChange={toggleAll}
                      checked={sel.size === rows.length && rows.length > 0}
                      className="rounded" />
                  </th>
                )}
                <th>Từ</th>
                <th>Server ID</th>
                <th>Người gửi</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                {tab === 'pending' && <th className="text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">⏳ Đang tải...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Không có từ nào</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  {tab === 'pending' && (
                    <td>
                      <input type="checkbox"
                        checked={sel.has(row.id)}
                        onChange={(e) => {
                          const s = new Set(sel);
                          e.target.checked ? s.add(row.id) : s.delete(row.id);
                          setSel(s);
                        }}
                        className="rounded" />
                    </td>
                  )}
                  <td><span className="font-semibold text-indigo-700 text-base">{row.word}</span></td>
                  <td><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.guild_id}</code></td>
                  <td><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.user_id}</code></td>
                  <td className="text-gray-500 text-xs">{fmt(row.submitted_at)}</td>
                  <td><span className={`badge-${row.status}`}>{row.status}</span></td>
                  {tab === 'pending' && (
                    <td className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => review(row.id, true)}  className="btn-success">✅</button>
                        <button onClick={() => review(row.id, false)} className="btn-danger" >❌</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-ghost disabled:opacity-40"
            >
              ← Trước
            </button>
            <span className="text-sm text-gray-500">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-ghost disabled:opacity-40"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
