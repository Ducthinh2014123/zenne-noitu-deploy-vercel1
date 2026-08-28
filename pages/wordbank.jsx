import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { api, isConfigured } from '../lib/api';

const LIMIT = 100;

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt + 'Z').toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

export default function WordBank() {
  const router = useRouter();
  const [rows,    setRows]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(0);
  const [search,  setSearch]  = useState('');
  const [guild,   setGuild]   = useState('');
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState('');
  const [confirm, setConfirm] = useState(null); // {guild_id, word}

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.wordbank({ limit: LIMIT, offset: page * LIMIT, q: search, guild_id: guild || undefined });
      setRows(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      showToast('❌ Lỗi: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, guild]);

  useEffect(() => {
    if (!isConfigured()) { router.push('/'); return; }
    load();
  }, [load, router]);

  const deleteWord = async (guild_id, word) => {
    try {
      await api.deleteWord(guild_id, word);
      showToast(`🗑️ Đã xóa "${word}"`);
      setConfirm(null);
      load();
    } catch (e) { showToast('❌ ' + e.message); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Layout title="Kho Từ">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2">Xác nhận xóa</h2>
            <p className="text-gray-600 mb-4">
              Xóa từ <span className="font-bold text-red-600">{confirm.word}</span> khỏi kho từ của server <code>{confirm.guild_id}</code>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="btn-ghost">Hủy</button>
              <button onClick={() => deleteWord(confirm.guild_id, confirm.word)} className="btn-danger">🗑️ Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 mb-5 text-sm text-indigo-700">
        📖 Tổng cộng <strong>{total}</strong> từ trong kho
        {guild && <> của server <code>{guild}</code></>}
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
          <input
            className="input max-w-[200px]"
            placeholder="Server ID (tùy chọn)"
            value={guild}
            onChange={(e) => { setGuild(e.target.value); setPage(0); }}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table>
            <thead>
              <tr>
                <th>Từ</th>
                <th>Server ID</th>
                <th>Người thêm</th>
                <th>Admin duyệt</th>
                <th>Ngày thêm</th>
                <th className="text-right">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">⏳ Đang tải...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Kho từ trống</td></tr>
              ) : rows.map((row, i) => (
                <tr key={i}>
                  <td><span className="font-semibold text-indigo-700 text-base">{row.word}</span></td>
                  <td><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.guild_id}</code></td>
                  <td><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.added_by || '—'}</code></td>
                  <td><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.approved_by || '—'}</code></td>
                  <td className="text-gray-500 text-xs">{fmt(row.added_at)}</td>
                  <td className="text-right">
                    <button
                      onClick={() => setConfirm({ guild_id: row.guild_id, word: row.word })}
                      className="btn-danger text-xs px-2 py-1"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost disabled:opacity-40">← Trước</button>
            <span className="text-sm text-gray-500">Trang {page + 1} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-ghost disabled:opacity-40">Sau →</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
