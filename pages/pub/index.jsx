import { useEffect, useState } from 'react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';

function Stat({ emoji, label, value, color='indigo' }) {
  const clr = { indigo:'text-indigo-400', green:'text-green-400', blue:'text-blue-400', yellow:'text-yellow-400' }[color];
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="text-2xl mb-2">{emoji}</div>
      <div className={`text-3xl font-bold ${clr}`}>{value ?? '—'}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}

export default function PubHome() {
  const [s, setS] = useState(null);
  const [m, setM] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    pubApi.status().then(setS).catch(e => setErr(e.message));
    pubApi.milestones().then(setM).catch(() => {});
    const t = setInterval(() => pubApi.status().then(setS).catch(()=>{}), 30000);
    return () => clearInterval(t);
  }, []);

  const reached = m?.data?.filter(x => x.reached) || [];
  const next    = m?.data?.find(x => !x.reached);

  return (
    <PubLayout title="🏠 Trang Chủ">
      {err && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
          ⚠️ Không kết nối được tới server bot ({err}). Vui lòng thử lại sau.
        </div>
      )}

      {/* Status badge */}
      <div className="flex items-center gap-3 mb-8">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
          s?.online ? 'bg-green-900/40 text-green-400 border-green-700' : 'bg-red-900/40 text-red-400 border-red-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${s?.online ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          {s ? (s.online ? `✅ Bot Đang Online • ${s.latency_ms}ms` : '❌ Bot Offline') : '⏳ Đang kiểm tra...'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat emoji="🌐" label="Servers" value={s?.guild_count?.toLocaleString()} color="blue" />
        <Stat emoji="👥" label="Thành viên" value={s?.user_count?.toLocaleString()} color="indigo" />
        <Stat emoji="📚" label="Từ đã duyệt" value={s?.stats?.wordbank?.toLocaleString()} color="green" />
        <Stat emoji="🎮" label="Lượt từ" value={s?.stats?.total_games_words?.toLocaleString()} color="yellow" />
      </div>

      {/* Milestones reached */}
      {reached.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">🎯 Cột Mốc Đã Đạt</h2>
          <div className="flex flex-wrap gap-2">
            {reached.map(r => (
              <span key={r.key} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-900/50 border border-indigo-700 rounded-full text-sm text-indigo-300">
                {r.emoji} {r.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next milestone */}
      {next && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">{next.emoji} Tiếp theo: <strong>{next.label}</strong></span>
            <span className="text-sm text-gray-500">{next.current?.toLocaleString()} / {next.target?.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: next.pct + '%' }} />
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">{next.pct}%</div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href:'/pub/leaderboard', emoji:'🏆', label:'Bảng Xếp Hạng' },
          { href:'/pub/wordbank',    emoji:'📚', label:'Kho Từ' },
          { href:'/pub/servers',     emoji:'🌐', label:'Servers' },
          { href:'/pub/play',        emoji:'🎮', label:'Chơi Online' },
          { href:'/pub/2048',        emoji:'🔢', label:'2048' },
        ].map(l => (
          <a key={l.href} href={l.href}
            className="flex flex-col items-center gap-2 p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-500 hover:bg-gray-800 transition-colors text-center">
            <span className="text-3xl">{l.emoji}</span>
            <span className="text-sm font-medium text-gray-300">{l.label}</span>
          </a>
        ))}
      </div>
    </PubLayout>
  );
}
