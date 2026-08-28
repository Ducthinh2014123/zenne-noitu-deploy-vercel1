import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { isConfigured, saveConfig, api } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [url, setUrl]     = useState('http://nile.hidencloud.com:5055');
  const [key, setKey]     = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConfigured()) router.push('/pending');
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      saveConfig(url, key);
      await api.stats(); // test connection
      router.push('/pending');
    } catch (err) {
      setError('Kết nối thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔤</div>
          <h1 className="text-3xl font-bold text-white">Nối Từ Admin</h1>
          <p className="text-gray-400 mt-2">Đăng nhập để quản lý từ vựng</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              🌐 API Server URL
            </label>
            <input
              className="input"
              type="url"
              placeholder="http://nile.hidencloud.com:5055"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">URL của Flask API chạy trên server bot</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              🔑 API Key
            </label>
            <input
              className="input"
              type="password"
              placeholder="Nhập API_KEY trong file .env"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-3 text-base rounded-lg"
          >
            {loading ? '⏳ Đang kết nối...' : '🚀 Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Dữ liệu được lưu trong trình duyệt — không gửi về Vercel
        </p>
      </div>
    </div>
  );
}
