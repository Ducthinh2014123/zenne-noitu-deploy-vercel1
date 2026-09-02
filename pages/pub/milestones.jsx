import { useEffect, useState } from 'react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { IconTarget, IconAlertTriangle, IconGlobe, IconBookOpen, IconGamepad, IconUsers, IconCheck } from '../../components/icons';

export default function PubMilestones() {
  const [d, setD]       = useState(null);
  const [loading, setL] = useState(true);
  const [err, setErr]   = useState('');

  useEffect(() => {
    pubApi.milestones().then(r => { setD(r); setErr(''); }).catch(e => setErr(e.message)).finally(() => setL(false));
  }, []);

  return (
    <PubLayout title="Cột Mốc">
      {err && <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm"><IconAlertTriangle className="w-4 h-4" /> {err}</div>}
      {loading
        ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"/></div>
        : d && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[{l:'Servers',v:d.current?.servers,Icon:IconGlobe},{l:'Từ duyệt',v:d.current?.wordbank,Icon:IconBookOpen},
                {l:'Ván chơi',v:d.current?.games,Icon:IconGamepad},{l:'Người dùng',v:d.current?.users,Icon:IconUsers}]
              .map(s => (
                <div key={s.l} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-1 text-indigo-400"><s.Icon className="w-6 h-6" /></div>
                  <div className="text-2xl font-bold text-white">{s.v?.toLocaleString()??'—'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {d.data.map(m => (
                <div key={m.key} className={`bg-gray-900 border rounded-xl p-5 ${m.reached?'border-indigo-600/60':'border-gray-800'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconTarget className="w-5 h-5 text-indigo-400" />
                      <span className={`font-semibold ${m.reached?'text-indigo-300':'text-gray-300'}`}>{m.label}</span>
                      {m.reached && <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-900/60 border border-indigo-700 rounded-full text-xs text-indigo-400"><IconCheck className="w-3 h-3" /> Đạt!</span>}
                    </div>
                    <span className="text-sm text-gray-500">{m.current?.toLocaleString()} / {m.target?.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${m.reached?'bg-indigo-500':'bg-gray-600'}`} style={{width:m.pct+'%'}}/>
                  </div>
                  <div className="text-right text-xs text-gray-600 mt-1">{m.pct}%</div>
                </div>
              ))}
            </div>
          </>
        )
      }
    </PubLayout>
  );
}
