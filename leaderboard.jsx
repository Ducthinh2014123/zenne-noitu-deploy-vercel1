import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { IconMedal } from '../components/icons';

const MEDAL_COLORS = ['text-yellow-400','text-gray-300','text-orange-400'];

export default function AdminLeaderboard() {
  const router = useRouter();
  const [data, setData]     = useState([]);
  const [loading, setL]     = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('nt_api_url')) { router.push('/'); return; }
    api.leaderboard({ limit: 50 })
      .then(r => setData(r.data || []))
      .catch(() => router.push('/'))
      .finally(() => setL(false));
  }, [router]);

  return (
    <Layout title="Bang Xep Hang">
      {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"/></div> : (
        <div className="space-y-2">
          {data.map((p, i) => (
            <div key={p.user_id || i} className={`flex items-center gap-4 p-4 rounded-xl border ${
              i===0 ? 'bg-yellow-900/20 border-yellow-700/50' : i===1 ? 'bg-gray-800/60 border-gray-600/50' : i===2 ? 'bg-orange-900/20 border-orange-700/50' : 'bg-gray-900 border-gray-800'
            }`}>
              <div className="w-8 flex justify-center">{i<3 ? <IconMedal className={`w-5 h-5 ${MEDAL_COLORS[i]}`} /> : <span className="text-gray-500 text-sm">#{i+1}</span>}</div>
              <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                {(p.username || p.user_id || '?')[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{p.username || 'User'}</div>
                <div className="text-xs text-gray-500 font-mono">{p.user_id}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-indigo-400 text-lg">{(p.total_words||0).toLocaleString()}</div>
                <div className="text-xs text-gray-500">tu | streak: {p.max_streak||0}</div>
              </div>
            </div>
          ))}
          {data.length===0 && <div className="text-center py-12 text-gray-500">Chua co du lieu.</div>}
        </div>
      )}
    </Layout>
  );
}
