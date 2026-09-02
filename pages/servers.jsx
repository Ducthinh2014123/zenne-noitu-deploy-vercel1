import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { IconGlobe } from '../components/icons';

export default function Servers() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setL] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('nt_api_url')) { router.push('/'); return; }
    api.guilds().then(r => setData(r.data||[])).catch(() => router.push('/')).finally(() => setL(false));
  }, [router]);

  return (
    <Layout title={`Server (${data.length})`}>
      {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"/></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.map(g => (
            <div key={g.guild_id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="font-semibold text-white">{g.name || g.guild_id}</div>
              <div className="text-xs text-gray-500 mt-1 font-mono">{g.guild_id}</div>
              <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1"><IconGlobe className="w-3.5 h-3.5" /> {g.lang || 'vi'}</div>
            </div>
          ))}
          {data.length===0 && <div className="col-span-full text-center py-12 text-gray-500">Chua co server nao.</div>}
        </div>
      )}
    </Layout>
  );
}
