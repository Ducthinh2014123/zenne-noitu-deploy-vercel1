import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import PubLayout from '../../components/PubLayout';

const Section = ({ title, icon, children }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-5">
    <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5">
      <span>{icon}</span>{title}
    </h2>
    {children}
  </div>
);

const Btn = ({ children, variant='primary', loading, ...p }) => {
  const cls = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    danger:  'bg-red-800 hover:bg-red-700 text-white',
    ghost:   'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300',
    success: 'bg-green-700 hover:bg-green-600 text-white',
  }[variant];
  return (
    <button {...p} disabled={loading || p.disabled}
      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50 ${cls} ${p.className||''}`}>
      {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
      {children}
    </button>
  );
};

const Field = ({ label, error, children }) => (
  <div>
    {label && <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>}
    {children}
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

const PwInput = ({ label, ...p }) => {
  const [show, setShow] = useState(false);
  return (
    <Field label={label}>
      <div className="relative">
        <input {...p} type={show ? 'text' : 'password'}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 pr-11 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"/>
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
          {show
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          }
        </button>
      </div>
    </Field>
  );
};

const Toast = ({ msg, onClose }) => {
  useEffect(() => { if (msg) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); } }, [msg, onClose]);
  if (!msg) return null;
  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium ${
      msg.ok ? 'bg-green-900 border-green-600 text-green-200' : 'bg-red-900 border-red-600 text-red-200'
    }`}>
      {msg.ok ? '✅' : '⚠️'} {msg.text}
    </div>
  );
};

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [info, setInfo]   = useState(null);
  const [toast, setToast] = useState(null);
  const notify = (text, ok = true) => setToast({ text, ok });

  // Password form
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwLoading, setPwL] = useState(false);

  // 2FA state
  const [twoFA, set2FA] = useState(null); // { secret, qr_url }
  const [tfaCode, setTfaCode] = useState('');
  const [disCode, setDisCode] = useState('');
  const [disPw, setDisPw]   = useState('');
  const [tfaLoading, setTL] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated') {
      fetch('/api/account/info').then(r => r.json()).then(setInfo).catch(() => setInfo(session?.user));
    }
  }, [status, router, session]);

  if (status === 'loading' || !session) return (
    <PubLayout title="Tài khoản">
      <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"/></div>
    </PubLayout>
  );

  const u = info || session.user;
  const hasPw = info?.has_password;
  const twoFAOn = info?.totp_enabled;

  // ── Đổi / Đặt mật khẩu ──────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw !== newPw2) { notify('Mật khẩu xác nhận không khớp', false); return; }
    if (newPw.length < 6) { notify('Mật khẩu tối thiểu 6 ký tự', false); return; }
    setPwL(true);
    const r = await fetch('/api/account/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_password: oldPw, new_password: newPw }),
    });
    const d = await r.json();
    if (r.ok) { notify('Đổi mật khẩu thành công! ✨'); setOldPw(''); setNewPw(''); setNewPw2(''); setInfo(i => ({ ...i, has_password: true })); }
    else notify(d.error || 'Thất bại', false);
    setPwL(false);
  };

  // ── Setup 2FA ───────────────────────────────────────────────────
  const handleSetup2FA = async () => {
    setTL('setup');
    const r = await fetch('/api/account/setup-2fa', { method: 'POST' });
    const d = await r.json();
    if (r.ok) set2FA(d);
    else notify(d.error || 'Lỗi setup 2FA', false);
    setTL('');
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    if (!tfaCode || tfaCode.length !== 6) { notify('Nhập đúng 6 chữ số', false); return; }
    setTL('enable');
    const r = await fetch('/api/account/enable-2fa', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: tfaCode }),
    });
    const d = await r.json();
    if (r.ok) { notify('2FA đã được bật! 🔐'); set2FA(null); setTfaCode(''); setInfo(i => ({ ...i, totp_enabled: true })); }
    else notify(d.error || 'Mã OTP sai', false);
    setTL('');
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!disCode && !disPw) { notify('Nhập mã OTP hoặc mật khẩu để tắt 2FA', false); return; }
    setTL('disable');
    const r = await fetch('/api/account/disable-2fa', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: disCode, password: disPw }),
    });
    const d = await r.json();
    if (r.ok) { notify('2FA đã tắt'); setDisCode(''); setDisPw(''); setInfo(i => ({ ...i, totp_enabled: false })); }
    else notify(d.error || 'Xác thực thất bại', false);
    setTL('');
  };

  return (
    <PubLayout title="⚙️ Tài khoản">
      <Toast msg={toast} onClose={() => setToast(null)} />

      {/* ── Profile ── */}
      <Section icon="👤" title="Thông tin">
        <div className="flex items-center gap-4">
          {u.image
            ? <img src={u.image} alt={u.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/40"/>
            : <div className="w-16 h-16 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold text-white">{(u.name||u.username||'U')[0].toUpperCase()}</div>
          }
          <div>
            <div className="text-xl font-bold text-white">{u.username || u.name}</div>
            <div className="text-sm text-gray-400">{u.email}</div>
            <div className="mt-1.5 flex gap-2 flex-wrap">
              {u.provider && u.provider !== 'credentials' && (
                <span className="px-2 py-0.5 bg-blue-900/40 border border-blue-700/50 rounded-full text-xs text-blue-300">
                  🔗 {u.provider}
                </span>
              )}
              {hasPw && <span className="px-2 py-0.5 bg-green-900/40 border border-green-700/50 rounded-full text-xs text-green-300">🔑 Mật khẩu</span>}
              {twoFAOn && <span className="px-2 py-0.5 bg-purple-900/40 border border-purple-700/50 rounded-full text-xs text-purple-300">🔐 2FA bật</span>}
              {u.isAdmin && <span className="px-2 py-0.5 bg-yellow-900/40 border border-yellow-700/50 rounded-full text-xs text-yellow-300">⭐ Admin</span>}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Đổi / Đặt mật khẩu ── */}
      <Section icon="🔑" title={hasPw ? 'Đổi mật khẩu' : 'Đặt mật khẩu (chuyển sang đăng nhập email)'}>
        {!hasPw && (
          <div className="mb-4 p-3.5 bg-blue-900/30 border border-blue-700/40 rounded-xl text-sm text-blue-300">
            💡 Bạn đăng nhập qua <strong>{u.provider || 'OAuth'}</strong>. Đặt mật khẩu để có thể đăng nhập bằng email + mật khẩu.
          </div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4">
          {hasPw && <PwInput label="Mật khẩu cũ" placeholder="Nhập mật khẩu hiện tại" value={oldPw} onChange={e => setOldPw(e.target.value)} required={hasPw} />}
          <div className="grid sm:grid-cols-2 gap-4">
            <PwInput label="Mật khẩu mới" placeholder="Tối thiểu 6 ký tự" value={newPw} onChange={e => setNewPw(e.target.value)} required />
            <PwInput label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu mới" value={newPw2} onChange={e => setNewPw2(e.target.value)} required />
          </div>
          {newPw && newPw2 && newPw !== newPw2 && <p className="text-xs text-red-400">Mật khẩu không khớp</p>}
          {newPw && newPw === newPw2 && newPw.length >= 6 && <p className="text-xs text-green-400">✓ Mật khẩu khớp</p>}
          <Btn type="submit" loading={pwLoading}>{hasPw ? '💾 Đổi mật khẩu' : '🔑 Đặt mật khẩu'}</Btn>
        </form>
      </Section>

      {/* ── 2FA ── */}
      <Section icon="🔐" title="Xác thực 2 bước (2FA)">
        {!twoFAOn ? (
          <>
            <p className="text-sm text-gray-400 mb-4">
              Tăng cường bảo mật bằng cách yêu cầu mã OTP từ ứng dụng như <strong className="text-white">Google Authenticator</strong>, <strong className="text-white">Authy</strong> mỗi khi đăng nhập.
            </p>
            {!twoFA ? (
              <Btn onClick={handleSetup2FA} loading={tfaLoading === 'setup'}>🔐 Bật xác thực 2 bước</Btn>
            ) : (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex-shrink-0">
                    <img src={twoFA.qr_url} alt="QR Code 2FA" className="w-44 h-44 rounded-xl border-4 border-white bg-white p-1"/>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300">
                      <strong>1.</strong> Mở <strong className="text-white">Google Authenticator</strong> hoặc <strong className="text-white">Authy</strong>
                    </p>
                    <p className="text-sm text-gray-300"><strong>2.</strong> Quét mã QR bên cạnh</p>
                    <p className="text-sm text-gray-300"><strong>3.</strong> Hoặc nhập thủ công secret:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-indigo-300 font-mono tracking-wider break-all">{twoFA.secret}</code>
                      <button onClick={() => { navigator.clipboard.writeText(twoFA.secret); notify('Đã copy secret!'); }}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Verify */}
                <form onSubmit={handleEnable2FA} className="flex gap-3 items-end">
                  <Field label="Nhập mã OTP từ ứng dụng (6 chữ số)">
                    <input type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={tfaCode}
                      onChange={e => setTfaCode(e.target.value.replace(/\D/g,''))}
                      className="w-40 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:border-indigo-500"/>
                  </Field>
                  <Btn type="submit" variant="success" loading={tfaLoading === 'enable'}>✅ Xác nhận bật 2FA</Btn>
                  <Btn type="button" variant="ghost" onClick={() => { set2FA(null); setTfaCode(''); }}>Hủy</Btn>
                </form>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5 p-3.5 bg-green-900/20 border border-green-700/40 rounded-xl">
              <span className="text-2xl">🔐</span>
              <div>
                <div className="text-sm font-semibold text-green-400">2FA đang bật</div>
                <div className="text-xs text-gray-400">Mỗi lần đăng nhập sẽ yêu cầu mã OTP từ Authenticator app.</div>
              </div>
            </div>
            <div className="border border-red-900/40 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-3">Để tắt 2FA, xác nhận bằng <strong className="text-white">mã OTP</strong> hoặc <strong className="text-white">mật khẩu</strong>:</p>
              <form onSubmit={handleDisable2FA} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Mã OTP (6 chữ số)">
                    <input type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={disCode}
                      onChange={e => setDisCode(e.target.value.replace(/\D/g,''))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-center font-mono tracking-widest focus:outline-none focus:border-red-500 text-lg"/>
                  </Field>
                  {hasPw && <PwInput label="Hoặc mật khẩu" placeholder="Nhập mật khẩu" value={disPw} onChange={e => setDisPw(e.target.value)} />}
                </div>
                <Btn type="submit" variant="danger" loading={tfaLoading === 'disable'}>🔓 Tắt 2FA</Btn>
              </form>
            </div>
          </>
        )}
      </Section>

      {/* ── Đăng xuất ── */}
      <Section icon="🚪" title="Phiên đăng nhập">
        <div className="flex flex-col sm:flex-row gap-3">
          <Btn variant="ghost" onClick={() => signOut({ callbackUrl: '/auth/login' })}>
            🚪 Đăng xuất thiết bị này
          </Btn>
          <Btn variant="danger" onClick={() => { if (confirm('Đăng xuất khỏi tất cả thiết bị?')) signOut({ callbackUrl: '/auth/login' }); }}>
            ⚠️ Đăng xuất tất cả
          </Btn>
        </div>
        <p className="mt-3 text-xs text-gray-600">Đăng nhập lần cuối qua: <span className="text-gray-500">{u.provider || 'credentials'}</span></p>
      </Section>
    </PubLayout>
  );
}
