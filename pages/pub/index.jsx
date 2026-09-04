import { useEffect, useState } from 'react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import {
  IconGlobe, IconUsers, IconBookOpen, IconGamepad, IconTarget, IconTrophy,
  IconHash, IconCheckCircle, IconXCircle, IconLoader, IconAlertTriangle,
} from '../../components/icons';

function Stat({ Icon, label, value, color = 'indigo' }) {
  const clr = { indigo: 'text-indigo-400', green: 'text-green-400', blue: 'text-blue-400', yellow: 'text-yellow-400' }[color];
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 mb-3 ${clr}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className={`text-3xl font-bold ${clr}`}>{value ?? '—'}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}

const QUICK_LINKS = [
  { href: '/pub/leaderboard', Icon: IconTrophy,   label: 'Bảng Xếp Hạng' },
  { href: '/pub/wordbank',    Icon: IconBookOpen, label: 'Kho Từ' },
  { href: '/pub/servers',     Icon: IconGlobe,    label: 'Servers' },
  { href: '/pub/play',        Icon: IconGamepad,  label: 'Chơi Online' },
  { href: '/pub/2048',        Icon: IconHash,     label: '2048' },
];

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
    <PubLayout title="Trang Chủ">
      {err && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
          <IconAlertTriangle className="w-4 h-4 flex-shrink-0" />
          Không kết nối được tới server bot ({err}). Vui lòng thử lại sau.
        </div>
      )}

      {/* Status badge */}
      <div className="flex items-center gap-3 mb-8">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
          s?.online ? 'bg-green-900/40 text-green-400 border-green-700' : 'bg-red-900/40 text-red-400 border-red-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${s?.online ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          {s
            ? (s.online
                ? <><IconCheckCircle className="w-4 h-4" /> Bot Đang Online • {s.latency_ms}ms</>
                : <><IconXCircle className="w-4 h-4" /> Bot Offline</>)
            : <><IconLoader className="w-4 h-4 animate-spin" /> Đang kiểm tra...</>}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat Icon={IconGlobe}    label="Servers"       value={s?.guild_count?.toLocaleString()} color="blue" />
        <Stat Icon={IconUsers}    label="Thành viên"     value={s?.user_count?.toLocaleString()} color="indigo" />
        <Stat Icon={IconBookOpen} label="Từ đã duyệt"   value={s?.stats?.wordbank?.toLocaleString()} color="green" />
        <Stat Icon={IconGamepad}  label="Lượt từ"       value={s?.stats?.total_games_words?.toLocaleString()} color="yellow" />
      </div>

      {/* Milestones reached */}
      {reached.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
            <IconTarget className="w-4 h-4 text-indigo-400" /> Cột Mốc Đã Đạt
          </h2>
          <div className="flex flex-wrap gap-2">
            {reached.map(r => (
              <span key={r.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/50 border border-indigo-700 rounded-full text-sm text-indigo-300">
                <IconCheckCircle className="w-3.5 h-3.5" /> {r.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next milestone */}
      {next && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
              <IconTarget className="w-4 h-4 text-gray-500" /> Tiếp theo: <strong>{next.label}</strong>
            </span>
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
        {QUICK_LINKS.map(l => (
          <a key={l.href} href={l.href}
            className="flex flex-col items-center gap-2.5 p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-500 hover:bg-gray-800 transition-colors text-center">
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600/15 border border-indigo-500/25 text-indigo-400">
              <l.Icon className="w-5 h-5" />
            </span>
            <span className="text-sm font-medium text-gray-300">{l.label}</span>
          </a>
        ))}
      </div>
    </PubLayout>
  );
}
