import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  IconLock, IconMail, IconKey, IconShieldCheck, IconCheckCircle,
  IconAlertTriangle, IconInfo, IconEye, IconEyeOff, IconCopy, IconCheck,
  IconRocket, IconChevronRight, IconLogIn,
} from '../../components/icons';
import { recoveryApi } from '../../lib/recoveryApi';

// Script chạy trong Developer Console của trình duyệt.
// Client KHÔNG tự tạo session cookie -- server la ben duy nhat tao Temporary Reset Session.
const RECOVERY_SCRIPT = `const token = prompt("Nhập Recovery Token:");

if (!token) {
  alert("Bạn chưa nhập Recovery Token.");
} else {
  fetch("/api/auth/recovery/token/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Recovery Token không hợp lệ hoặc đã hết hạn.");
      }
      window.location.reload();
    })
    .catch((error) => {
      alert(error.message);
    });
}`;

function Alert({ type = 'info', children }) {
  const map = {
    info:    { bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300', Icon: IconInfo },
    success: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', Icon: IconCheckCircle },
    error:   { bg: 'bg-red-500/10 border-red-500/30 text-red-300', Icon: IconAlertTriangle },
  };
  const { bg, Icon } = map[type] || map.info;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${bg}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function BackBtn({ onClick, children = 'Quay lại' }) {
  return (
    <button type="button" onClick={onClick}
      className="text-xs text-gray-500 hover:text-gray-300 font-medium mb-4 inline-flex items-center gap-1">
      ← {children}
    </button>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

  // 'choose' | 'email_request' | 'email_verify' | 'token_ready' | 'discord' | 'new_password' | 'done'
  const [step, setStep] = useState('choose');
  const [checkingSession, setCheckingSession] = useState(true);
  const [msg, setMsg] = useState(null); // { type, text }
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [copied, setCopied] = useState(false);

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Sau khi Console Recovery Script chạy xong, trang tự reload rồi hỏi server
  // xem Temporary Reset Session (cookie reset_session) đã sẵn sàng chưa.
  const checkSession = useCallback(async () => {
    setCheckingSession(true);
    try {
      const res = await fetch('/api/auth/recovery/status');
      const data = await res.json();
      if (data && data.canResetPassword) {
        setStep('new_password');
      }
    } catch (_) {
      // Bỏ qua lỗi mạng — người dùng vẫn có thể thử lại thủ công.
    } finally {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAll = () => {
    setMsg(null);
    setEmail('');
    setCode('');
    setRecoveryToken('');
    setCopied(false);
    setPw('');
    setPw2('');
    setStep('choose');
  };

  // ── Bước: gửi email xin mã xác minh
  const submitEmailRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMsg(null);
    const { data } = await recoveryApi('/api/auth/recovery/request', { email: email.trim() });
    setLoading(false);
    // Response luôn generic — không tiết lộ email có tồn tại hay không.
    setMsg({ type: 'success', text: (data && data.message) || 'Nếu tài khoản tồn tại, mã xác minh đã được gửi.' });
    setStep('email_verify');
  };

  // ── Bước: xác minh mã 128 ký tự gửi qua email
  const submitEmailVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setMsg(null);
    const { ok, data } = await recoveryApi('/api/auth/recovery/email/verify', {
      email: email.trim(),
      code: code.trim(),
    });
    setLoading(false);
    if (!ok || !data || !data.success) {
      setMsg({ type: 'error', text: (data && data.error) || 'Mã xác minh không hợp lệ hoặc đã hết hạn.' });
      return;
    }
    setRecoveryToken(data.recovery_token || '');
    setStep('token_ready');
  };

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(RECOVERY_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      /* clipboard có thể bị chặn — người dùng vẫn có thể copy thủ công từ khối code */
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(recoveryToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) { /* noop */ }
  };

  // ── Bước cuối: đặt mật khẩu mới (server lấy user từ Temporary Reset Session, không nhận user_id từ client)
  const submitNewPassword = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 6) {
      setMsg({ type: 'error', text: 'Mật khẩu mới tối thiểu 6 ký tự.' });
      return;
    }
    if (pw !== pw2) {
      setMsg({ type: 'error', text: 'Mật khẩu nhập lại không khớp.' });
      return;
    }
    setLoading(true);
    const { ok, data } = await recoveryApi('/api/auth/recovery/reset-password', { password: pw });
    setLoading(false);
    if (!ok || !data || !data.success) {
      setMsg({ type: 'error', text: (data && data.error) || 'Không thể đặt lại mật khẩu. Vui lòng thử lại từ đầu.' });
      return;
    }
    setStep('done');
  };

  return (
    <>
      <Head><title>Khôi phục tài khoản</title></Head>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <IconLock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Khôi phục tài khoản</h1>
                {step === 'choose' && <p className="text-xs text-gray-500">Chọn phương thức xác minh</p>}
              </div>
            </div>

            {checkingSession && step === 'choose' && (
              <div className="mb-4"><Alert type="info">Đang kiểm tra phiên khôi phục...</Alert></div>
            )}

            {msg && step !== 'choose' && (
              <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert>
              </div>
            )}

            {/* ── Bước chọn phương thức ── */}
            {step === 'choose' && (
              <div className="space-y-3">
                <button onClick={() => { setMsg(null); setStep('email_request'); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 text-gray-200 hover:text-white rounded-xl transition-all font-medium text-sm group">
                  <IconMail className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span className="flex-1 text-left">📧 Xác minh bằng Email</span>
                  <IconChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>
                <button onClick={() => { setMsg(null); setStep('discord'); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 text-gray-200 hover:text-white rounded-xl transition-all font-medium text-sm group">
                  <IconShieldCheck className="w-5 h-5 text-[#5865F2] flex-shrink-0" />
                  <span className="flex-1 text-left">💬 Liên hệ Admin qua Discord</span>
                  <IconChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                </button>
                <p className="text-center text-sm text-gray-500 pt-2">
                  <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">← Quay lại đăng nhập</Link>
                </p>
              </div>
            )}

            {/* ── Email: nhập email ── */}
            {step === 'email_request' && (
              <form onSubmit={submitEmailRequest}>
                <BackBtn onClick={resetAll} />
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email tài khoản</label>
                <div className="relative mb-4">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><IconMail className="w-4 h-4" /></div>
                  <input type="email" required placeholder="ban@email.com" autoComplete="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none text-sm" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <IconMail className="w-4 h-4" />}
                  Gửi mã xác minh
                </button>
              </form>
            )}

            {/* ── Email: nhập mã 128 ký tự ── */}
            {step === 'email_verify' && (
              <form onSubmit={submitEmailVerify}>
                <BackBtn onClick={() => setStep('email_request')} />
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mã xác minh (gửi tới {email})</label>
                <textarea required rows={3} value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="Dán mã xác minh 128 ký tự từ email..."
                  className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 mb-1 text-white placeholder-gray-600 focus:outline-none text-xs font-mono resize-none" />
                <p className="text-xs text-gray-500 mb-4">Mã có hiệu lực trong 10 phút và chỉ dùng được một lần.</p>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <IconKey className="w-4 h-4" />}
                  Xác minh mã
                </button>
              </form>
            )}

            {/* ── Discord: hướng dẫn liên hệ admin ── */}
            {step === 'discord' && (
              <div>
                <BackBtn onClick={resetAll} />
                <Alert type="info">
                  Không truy cập được email? Liên hệ Admin trên Discord server của bot và dùng lệnh dành cho Admin để được cấp <b>Admin Recovery Token</b> cho tài khoản của bạn. Admin sẽ xác minh quyền sở hữu tài khoản trước khi cấp token.
                </Alert>
                <div className="mt-4">
                  <button onClick={() => setStep('token_ready')}
                    className="w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm">
                    Tôi đã có Admin Recovery Token
                  </button>
                </div>
              </div>
            )}

            {/* ── Đã có Recovery Token: hiện Console Recovery Script ── */}
            {step === 'token_ready' && (
              <div>
                {recoveryToken ? (
                  <>
                    <div className="mb-4"><Alert type="success">Xác minh thành công! Recovery Token đã được tạo.</Alert></div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Recovery Token của bạn (chỉ hiện một lần)</label>
                    <div className="relative mb-4">
                      <textarea readOnly rows={2} value={recoveryToken}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-emerald-300 text-xs font-mono resize-none" />
                      <button type="button" onClick={copyToken} title="Sao chép"
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-300">
                        {copied ? <IconCheck className="w-4 h-4 text-emerald-400" /> : <IconCopy className="w-4 h-4" />}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">Dán Recovery Token mà Admin đã gửi cho bạn khi script yêu cầu.</p>
                )}
                <p className="text-sm text-gray-300 mb-2">Mở <b>Developer Console</b> của trình duyệt (phím F12) trên trang này, dán đoạn script bên dưới và nhấn Enter:</p>
                <div className="relative mb-4">
                  <pre className="w-full overflow-x-auto bg-black/60 border border-gray-800 rounded-xl px-4 py-3 text-[11px] leading-5 text-gray-300 font-mono"><code>{RECOVERY_SCRIPT}</code></pre>
                  <button type="button" onClick={copyScript}
                    className="absolute right-2 top-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-2 py-1 flex items-center gap-1">
                    {copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />} Sao chép
                  </button>
                </div>
                <Alert type="info">Script sẽ hỏi Recovery Token, gửi lên server để xác minh, rồi trang sẽ tự tải lại. Trang không tự tạo cookie đăng nhập — server là bên duy nhất tạo phiên khôi phục.</Alert>
                <button onClick={checkSession} disabled={checkingSession}
                  className="w-full mt-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-60 text-gray-200 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm">
                  {checkingSession ? <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" /> : <IconRocket className="w-4 h-4" />}
                  Tôi đã chạy script, kiểm tra lại
                </button>
              </div>
            )}

            {/* ── Form đặt mật khẩu mới ── */}
            {step === 'new_password' && (
              <form onSubmit={submitNewPassword}>
                <div className="mb-4"><Alert type="success">Xác minh thành công. Hãy đặt mật khẩu mới cho tài khoản.</Alert></div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mật khẩu mới</label>
                <div className="relative mb-3">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><IconKey className="w-4 h-4" /></div>
                  <input type={showPw ? 'text' : 'password'} required autoComplete="new-password" value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none text-sm" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPw ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                  </button>
                </div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Nhập lại mật khẩu</label>
                <div className="relative mb-4">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><IconKey className="w-4 h-4" /></div>
                  <input type={showPw ? 'text' : 'password'} required autoComplete="new-password" value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none text-sm" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <IconLock className="w-4 h-4" />}
                  Đặt lại mật khẩu
                </button>
              </form>
            )}

            {/* ── Hoàn tất ── */}
            {step === 'done' && (
              <div>
                <div className="mb-4"><Alert type="success">Đổi mật khẩu thành công! Vui lòng đăng nhập lại bằng email và mật khẩu mới.</Alert></div>
                <button onClick={() => router.push('/auth/login')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                  <IconLogIn className="w-4 h-4" /> Đăng nhập ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
