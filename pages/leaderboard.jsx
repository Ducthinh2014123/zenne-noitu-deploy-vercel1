import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { api, isConfigured } from '../lib/api';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const router = useRouter();
  const [rows,   setRows]   = useState([]);
  const [mode,   setMode]   = useState('words');   // words | streak
  const [guild,  setGuild]  = useState('');
  const [loading,setLoading]= useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.leaderboard({ mode, limit: 50, guild_id: guild || undefined });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [mode, guild]);

  useEffect(() => {
    if (!isConfigured()) { router.push('/'); return; }
    load();
  }, [load, router]);

  return (
    <Layout title="Bảng Xếp Hạng">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('words')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'words' ? 'bg-indigo-600 text-white' : 'btn-ghost'
            }`}
          >
            📊 Nhiều từ nhất
          </button>
          <button
            onClick={() => setMode('streak')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'streak' ? 'bg-orange-500 text-white' : 'btn-ghost'
            }`}
          >
            🔥 Streak dài nhất
          </button>
        </div>
        <input
          className="input max-w-[220px]"
          placeholder="Server ID (tùy chọn)"
          value={guild}
          onChange={(e) => setGuild(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table>
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th>User ID</th>
                <th>Server ID</th>
                <th className="text-right">Tổng từ</th>
                <th className="text-right">Max Streak</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">⏳ Đang tải...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Chưa có dữ liệu</td></tr>
              ) : rows.map((row, i) => (
                <tr key={i} className={i < 3 ? 'bg-yellow-50' : ''}>
                  <td className="text-center font-bold text-lg">
                    {MEDALS[i] || <span className="text-gray-400">{i + 1}</span>}
                  </td>
                  <td>
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.user_id}</code>
                  </td>
                  <td>
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.guild_id}</code>
                  </td>
                  <td className="text-right font-semibold text-indigo-700">
                    {row.total_words?.toLocaleString()}
                  </td>
                  <td className="text-right">
                    <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
                      🔥 {row.max_streak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
