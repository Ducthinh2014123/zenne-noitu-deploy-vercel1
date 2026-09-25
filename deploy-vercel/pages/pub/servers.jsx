import { useEffect, useState } from 'react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { IconLink, IconUsers, IconAlertTriangle } from '../../components/icons';

export default function PubServers() {
  const [data, setData]   = useState({ data:[], total:0 });
  const [loading, setL]   = useState(true);
  const [err, setErr]     = useState('');

  useEffect(() => {
    pubApi.servers().then(r => { setData(r); setErr(''); }).catch(e => setErr(e.message)).finally(() => setL(false));
  }, []);

  return (
    <PubLayout title="Servers">
      {err && <div className="mb-4 flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm"><IconAlertTriangle className="w-4 h-4 flex-shrink-0" /> {err}</div>}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-4xl font-bold text-indigo-400">{data.total.toLocaleString()}</span>
        <span className="text-gray-400">servers đang dùng bot</span>
      </div>
      {loading
        ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"/></div>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.data.map(g => (
              <div key={g.id} className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-500/50 transition-colors">
                {g.icon
                  ? <img src={g.icon} alt={g.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0"/>
                  : <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-400 flex-shrink-0"><IconLink className="w-5 h-5" /></div>
                }
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{g.name}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-1.5"><IconUsers className="w-3.5 h-3.5" /> {g.member_count?.toLocaleString()} thành viên</div>
                </div>
              </div>
            ))}
            {data.data.length===0 && <div className="col-span-full text-center py-16 text-gray-500">Chưa có server.</div>}
          </div>
        )
      }
      {data.total > 50 && <p className="mt-4 text-center text-xs text-gray-600">Hiển thị 50 server lớn nhất.</p>}
    </PubLayout>
  );
}
