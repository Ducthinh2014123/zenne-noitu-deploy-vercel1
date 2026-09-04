import { useEffect, useState } from 'react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { IconMedal, IconMessageCircle, IconFlame, IconAlertTriangle } from '../../components/icons';

const MEDAL_COLORS = ['text-yellow-400','text-gray-300','text-orange-400'];

export default function PubLeaderboard() {
  const [data, setData]   = useState([]);
  const [mode, setMode]   = useState('words');
  const [loading, setL]   = useState(true);
  const [err, setErr]     = useState('');

  const load = (m) => {
    setL(true);
    pubApi.leaderboard({ mode: m, limit: 50 })
      .then(r => { setData(r.data || []); setErr(''); })
      .catch(e => setErr(e.message))
      .finally(() => setL(false));
  };

  useEffect(() => { load('words'); }, []);

  const switchMode = (m) => { setMode(m); load(m); };

  return (
    <PubLayout title="Bảng Xếp Hạng">
      {err && <div className="mb-4 flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm"><IconAlertTriangle className="w-4 h-4 flex-shrink-0" /> {err}</div>}
      <div className="flex gap-2 mb-6">
        {[{id:'words',Icon:IconMessageCircle,label:'Số Từ'},{id:'streak',Icon:IconFlame,label:'Streak'}].map(b => (
          <button key={b.id} onClick={() => switchMode(b.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode===b.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}><b.Icon className="w-4 h-4" /> {b.label}</button>
        ))}
      </div>
      {loading
        ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"/></div>
        : (
          <div className="space-y-2">
            {data.map((p, i) => (
              <div key={p.user_id} className={`flex items-center gap-4 p-4 rounded-xl border ${
                i===0 ? 'bg-yellow-900/20 border-yellow-700/50'
                : i===1 ? 'bg-gray-800/60 border-gray-600/50'
                : i===2 ? 'bg-orange-900/20 border-orange-700/50'
                : 'bg-gray-900 border-gray-800'
              }`}>
                <div className="w-8 flex justify-center">{i<3 ? <IconMedal className={`w-5 h-5 ${MEDAL_COLORS[i]}`} /> : <span className="text-gray-500 text-sm">#{i+1}</span>}</div>
                {p.avatar
                  ? <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover"/>
                  : <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center text-white font-bold flex-shrink-0">{(p.name||'?')[0].toUpperCase()}</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{p.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{p.user_id}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-400 text-lg">{(p.total_words||0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">từ • streak {p.max_streak||0}</div>
                </div>
              </div>
            ))}
            {data.length===0 && <div className="text-center py-16 text-gray-500">Chưa có dữ liệu.</div>}
          </div>
        )
      }
    </PubLayout>
  );
}
