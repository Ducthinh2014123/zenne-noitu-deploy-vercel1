import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import PubLayout from '../../../components/PubLayout';
import { pubApi } from '../../../lib/pubApi';

export default function PlayIndex() {
  const router = useRouter();
  const { status } = useSession();
  const [lang, setLang]     = useState('vi');
  const [sec, setSec]       = useState(30);
  const [joinId, setJoinId] = useState('');
  const [loading, setL]     = useState(false);
  const [err, setErr]       = useState('');

  const create = async () => {
    setL(true); setErr('');
    try {
      const r = await pubApi.createRoom({ lang, time_limit: Number(sec) });
      router.push('/pub/play/' + r.room_id);
    } catch (e) { setErr(e.message); }
    finally { setL(false); }
  };

  const join = (e) => { e.preventDefault(); const id = joinId.trim().toLowerCase(); if (id) router.push('/pub/play/' + id); };

  if (status === 'loading') return (
    <PubLayout title="🎮 Chơi Nối Từ Online">
      <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"/></div>
    </PubLayout>
  );

  if (status !== 'authenticated') return (
    <PubLayout title="🎮 Chơi Nối Từ Online">
      <div className="max-w-sm mx-auto mt-10 bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-lg font-bold text-white mb-2">Cần đăng nhập để chơi</h2>
        <p className="text-gray-500 text-sm mb-6">Đăng nhập để điểm của bạn được ghi vào bảng xếp hạng chung, kể cả khi chơi trên web.</p>
        <button onClick={()=>router.push('/auth/login?callbackUrl=' + encodeURIComponent('/pub/play'))}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg">
          🔑 Đăng nhập
        </button>
      </div>
    </PubLayout>
  );

  return (
    <PubLayout title="🎮 Chơi Nối Từ Online">
      <p className="text-gray-400 mb-8">
        Tạo phòng rồi chia sẻ link — hoặc dùng <code className="bg-gray-800 px-1.5 rounded text-indigo-300">!taoroom</code> trong Discord.
      </p>
      {err && <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">⚠️ {err}</div>}

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Create */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">✨ Tạo Phòng Mới</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">🌐 Ngôn ngữ</label>
              <select value={lang} onChange={e=>setLang(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇺🇸 English</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ja">🇯🇵 日本語</option>
                <option value="ko">🇰🇷 한국어</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">⏱️ Mỗi lượt: <strong className="text-white">{sec}s</strong></label>
              <input type="range" min="10" max="120" step="5" value={sec} onChange={e=>setSec(e.target.value)} className="w-full accent-indigo-500"/>
              <div className="flex justify-between text-xs text-gray-600"><span>10s</span><span>120s</span></div>
            </div>
            <button onClick={create} disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors">
              {loading ? 'Đang tạo...' : '🚀 Tạo phòng & Vào'}
            </button>
          </div>
        </div>

        {/* Join */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">🔗 Tham Gia Phòng Có Sẵn</h2>
          <form onSubmit={join} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Room ID (6 ký tự)</label>
              <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono text-lg tracking-widest uppercase"
                placeholder="abc123" value={joinId} maxLength={6} onChange={e=>setJoinId(e.target.value)}/>
            </div>
            <button type="submit" disabled={joinId.trim().length < 4}
              className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors">
              🚶 Vào phòng
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-600">Lấy Room ID từ link mời hoặc lệnh <code className="text-indigo-400">!taoroom</code>.</p>
        </div>
      </div>

      {/* How to play */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-white mb-3">📖 Cách chơi</h3>
        <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
          <li>Host tạo phòng và chia sẻ link cho bạn bè.</li>
          <li>Mọi người nhập tên và vào phòng.</li>
          <li>Host nhấn <strong>Bắt đầu</strong> khi đủ người.</li>
          <li>Mỗi lượt nhập từ bắt đầu bằng chữ cuối của từ trước.</li>
          <li>Mỗi người có 3 mạng. Hết mạng = bị loại.</li>
          <li>🏆 Người còn lại cuối cùng / nhiều điểm nhất thắng!</li>
        </ol>
      </div>
    </PubLayout>
  );
}
