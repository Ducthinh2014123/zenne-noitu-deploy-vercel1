import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Pending() {
  const router = useRouter();
  const [tab, setTab]       = useState('pending');
  const [data, setData]     = useState([]);
  const [q, setQ]           = useState('');
  const [selected, setSel]  = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.pending().then(r => { setData(r.data || []); setSel(new Set()); setMsg(''); })
      .catch(e => { if (e.message.includes('401') || e.message.includes('403')) router.push('/'); })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { if (!localStorage.getItem('nt_api_url')) { router.push('/'); return; } load(); }, [load, router]);

  const filtered = data.filter(r => {
    const matches = !q || r.word?.toLowerCase().includes(q.toLowerCase());
    if (tab === 'pending')  return r.status === 'pending'  && matches;
    if (tab === 'approved') return r.status === 'approved' && matches;
    if (tab === 'rejected') return r.status === 'rejected' && matches;
    return matches;
  });

  const act = async (id, action) => {
    try { await api.review(id, action); setMsg(action === 'approve' ? '✅ Da duyet!' : '❌ Da tu choi!'); load(); }
    catch { setMsg('⚠️ Loi!'); }
  };

  const bulkAct = async (action) => {
    if (!selected.size) return;
    try { await api.reviewBulk([...selected], action); setMsg(`✅ Da xu ly ${selected.size} tu!`); load(); }
    catch { setMsg('⚠️ Loi!'); }
  };

  const toggle = (id) => setSel(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setSel(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id)));

  const counts = { pending: data.filter(r => r.status==='pending').length, approved: data.filter(r => r.status==='approved').length, rejected: data.filter(r => r.status==='rejected').length };

  return (
    <Layout title="Duyet Tu">
      {msg && <div className="mb-4 p-3 bg-indigo-900/30 border border-indigo-700 rounded-lg text-indigo-300 text-sm">{msg}</div>}
      <div className="flex gap-4 mb-5">
        {[['pending','⏳ Chờ duyệt'],['approved','✅ Đã duyệt'],['rejected','❌ Đã từ chối']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              tab===k ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'
            }`}>{l} <span className="ml-1 bg-gray-800 px-2 py-0.5 rounded-full text-xs">{counts[k]}</span></button>
        ))}
      </div>
      <div className="flex gap-3 mb-5">
        <input className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          placeholder="Tim tu..." value={q} onChange={e => setQ(e.target.value)} />
        {tab==='pending' && selected.size > 0 && (
          <>
            <button onClick={() => bulkAct('approve')} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium">✅ Duyet {selected.size}</button>
            <button onClick={() => bulkAct('reject')}  className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm font-medium">❌ Tu choi {selected.size}</button>
          </>
        )}
      </div>
      {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"/></div> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                {tab==='pending' && <th className="px-4 py-3 w-10"><input type="checkbox" checked={selected.size===filtered.length && filtered.length>0} onChange={toggleAll} className="accent-indigo-500"/></th>}
                <th className="px-4 py-3 text-left">Tu</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Server ID</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Nguoi gui</th>
                <th className="px-4 py-3 text-left">Thoi gian</th>
                <th className="px-4 py-3 text-left">Trang thai</th>
                {tab==='pending' && <th className="px-4 py-3 text-right">Thao tac</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  {tab==='pending' && <td className="px-4 py-3"><input type="checkbox" checked={selected.has(r.id)} onChange={()=>toggle(r.id)} className="accent-indigo-500"/></td>}
                  <td className="px-4 py-3 font-semibold text-white">{r.word}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell font-mono text-xs">{r.guild_id}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell font-mono text-xs">{r.submitted_by}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.submitted_at ? new Date(r.submitted_at).toLocaleString('vi-VN') : ''}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      r.status==='approved' ? 'bg-green-900/50 text-green-400' :
                      r.status==='rejected' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'
                    }`}>{r.status}</span>
                  </td>
                  {tab==='pending' && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={()=>act(r.id,'approve')} className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs mr-2">✅ Duyet</button>
                      <button onClick={()=>act(r.id,'reject')}  className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-xs">❌ Tu choi</button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan="7" className="text-center py-10 text-gray-600">Khong co tu nao.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
