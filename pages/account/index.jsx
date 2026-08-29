import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import PubLayout from '../../components/PubLayout';

const PROVIDER_BADGE = {
  google:      { label: 'Google',    emoji: '🔵', cls: 'bg-blue-900/40 text-blue-300 border-blue-700' },
  github:      { label: 'GitHub',    emoji: '⚫', cls: 'bg-gray-800 text-gray-300 border-gray-600' },
  discord:     { label: 'Discord',   emoji: '🟣', cls: 'bg-indigo-900/50 text-indigo-300 border-indigo-700' },
  credentials: { label: 'Email',     emoji: '📧', cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-700' },
};

const Card = ({ title, children }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
    <h2 className="text-base font-bold text-white">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Inp = (props) => (
  <input {...props} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm" />
);

const Btn = ({ children, cls = '', ...p }) => (
  <button {...p} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${cls}`}>{children}</button>
);

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [info,    setInfo]    = useState(null);
  const [loading, setLoading] = useState(true);

  const [oldPw,  setOldPw]  = useState('');
  const [newPw,  setNewPw]  = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwMsg,  setPwMsg]  = useState({ type:'', text:'' });
  const [pwLoad, setPwLoad] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [tfaStep, setTfaStep] = useState('idle');
  const [tfaData, setTfaData] = useState(null);
  const [tfaCode, setTfaCode] = useState('');
  const [tfaPw,   setTfaPw]   = useState('');
  const [tfaMsg,  setTfaMsg]  = useState({ type:'', text:'' });
  const [tfaLoad, setTfaLoad] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated') loadInfo();
  }, [status, router]);

  const loadInfo = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/account/info');
      if (r.ok) setInfo(await r.json());
      else setInfo(session?.user || {});
    } catch { setInfo(session?.user || {}); }
    setLoading(false);
  };

  const handleChangePw = async (e) => {
    e.preventDefault(); setPwMsg({ type:'', text:'' });
    if (newPw.length < 6) return setPwMsg({ type:'err', text: 'Mật khẩu tối thiểu 6 ký tự' });
    if (newPw !== newPw2) return setPwMsg({ type:'err', text: 'Mật khẩu xác nhận không khớp' });
    setPwLoad(true);
    try {
      const r = await fetch('/api/account/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPw, new_password: newPw }),
      });
      const d = await r.json();
      if (r.ok) {
        setPwMsg({ type:'ok', text: '✅ Đổi mật khẩu thành công!' });
        setOldPw(''); setNewPw(''); setNewPw2('');
        setInfo(prev => ({ ...prev, has_password: true }));
      } else { setPwMsg({ type:'err', text: d.error || 'Thất bại' }); }
    } catch { setPwMsg({ type:'err', text: 'Lỗi kết nối' }); }
    setPwLoad(false);
  };

  const handleSetup2FA = async () => {
    setTfaLoad(true); setTfaMsg({ type:'', text:'' });
    try {
      const r = await fetch('/api/account/setup-2fa', { method: 'POST' });
      const d = await r.json();
      if (r.ok) { setTfaData(d); setTfaStep('setup'); }
      else setTfaMsg({ type:'err', text: d.error || 'Lỗi setup 2FA' });
    } catch { setTfaMsg({ type:'err', text: 'Lỗi kết nối' }); }
    setTfaLoad(false);
  };

  const handleEnable2FA = async () => {
    if (tfaCode.length !== 6) return;
    setTfaLoad(true); setTfaMsg({ type:'', text:'' });
    try {
      const r = await fetch('/api/account/enable-2fa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: tfaCode }),
      });
      const d = await r.json();
      if (r.ok) {
        setTfaMsg({ type:'ok', text: '🔐 2FA đã được bật!' });
        setTfaStep('idle'); setTfaCode(''); setTfaData(null);
        setInfo(prev => ({ ...prev, totp_enabled: true }));
      } else { setTfaMsg({ type:'err', text: d.error || 'Mã OTP sai' }); }
    } catch { setTfaMsg({ type:'err', text: 'Lỗi kết nối' }); }
    setTfaLoad(false);
  };

  const handleDisable2FA = async () => {
    if (!tfaCode && !tfaPw) return;
    setTfaLoad(true); setTfaMsg({ type:'', text:'' });
    try {
      const r = await fetch('/api/account/disable-2fa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: tfaCode, password: tfaPw }),
      });
      const d = await r.json();
      if (r.ok) {
        setTfaMsg({ type:'ok', text: '✅ Đã tắt 2FA.' });
        setTfaStep('idle'); setTfaCode(''); setTfaPw('');
        setInfo(prev => ({ ...prev, totp_enabled: false }));
      } else { setTfaMsg({ type:'err', text: d.error || 'Xác thực thất bại' }); }
    } catch { setTfaMsg({ type:'err', text: 'Lỗi kết nối' }); }
    setTfaLoad(false);
  };

  const Msg = ({ m }) => m.text ? (
    <div className={`p-3 rounded-xl text-sm border ${
      m.type==='ok' ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'
    }`}>{m.text}</div>
  ) : null;

  if (status === 'loading' || loading) return (
    <PubLayout title="Tài khoản">
      <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"/></div>
    </PubLayout>
  );

  const user     = info || session?.user || {};
  const hasPassword  = user.has_password;
  const twoFAEnabled = user.totp_enabled;
  const provider     = user.provider || 'credentials';
  const badge        = PROVIDER_BADGE[provider] || PROVIDER_BADGE.credentials;

  return (
    <PubLayout title="Tài khoản của tôi">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Profile */}
        <Card title="👤 Hồ sơ">
          <div className="flex items-center gap-4">
            {user.image
              ? <img src={user.image} className="w-16 h-16 rounded-full object-cover border-2 border-gray-700" alt="avatar"/>
              : <div className="w-16 h-16 rounded-full bg-indigo-800 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  {(user.username || user.name || '?')[0].toUpperCase()}
                </div>
            }
            <div>
              <div className="text-xl font-bold text-white">{user.username || user.name}</div>
              {user.email && !user.email.includes('@noitu.local') && (
                <div className="text-sm text-gray-400">{user.email}</div>
              )}
              <span className={`inline-flex items-center gap-1.5 mt-1.5 text-xs px-2.5 py-0.5 rounded-full border ${badge.cls}`}>
                {badge.emoji} {badge.label}
              </span>
            </div>
          </div>
        </Card>

        {/* Change / Set Password */}
        <Card title={hasPassword ? '🔑 Đổi mật khẩu' : '🔑 Đặt mật khẩu'}>
          {!hasPassword && provider !== 'credentials' && (
            <div className="p-3 bg-indigo-900/20 border border-indigo-800 rounded-xl text-indigo-300 text-sm">
              ℹ️ Bạn đăng nhập qua {badge.label}. Đặt mật khẩu để cũng có thể đăng nhập bằng email!
            </div>
          )}
          <p className="text-sm text-gray-400">
            {hasPassword ? 'Đổi mật khẩu tài khoản.' : 'Đặt mật khẩu để đăng nhập bằng email bất kỳ lúc nào.'}
          </p>
          <form onSubmit={handleChangePw} className="space-y-3">
            {hasPassword && (
              <Field label="Mật khẩu hiện tại">
                <div className="relative">
                  <Inp type={showPw?'text':'password'} placeholder="Mật khẩu cũ" value={oldPw} onChange={e=>setOldPw(e.target.value)} />
                  <button type="button" onClick={()=>setShowPw(s=>!s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">{showPw?'Ẩn':'Hiện'}</button>
                </div>
              </Field>
            )}
            <Field label="Mật khẩu mới">
              <Inp type="password" placeholder="Tối thiểu 6 ký tự" value={newPw} onChange={e=>setNewPw(e.target.value)} />
            </Field>
            <Field label="Xác nhận mật khẩu mới">
              <Inp type="password" placeholder="Nhập lại mật khẩu mới"
                value={newPw2} onChange={e=>setNewPw2(e.target.value)}
                style={newPw2&&newPw2!==newPw?{borderColor:'#dc2626'}:{}}/>
              {newPw2&&newPw2!==newPw&&<p className="text-xs text-red-400 mt-1">Mật khẩu không khớp</p>}
            </Field>
            <Msg m={pwMsg}/>
            <Btn type="submit" disabled={pwLoad} cls="bg-indigo-600 hover:bg-indigo-500 text-white w-full">
              {pwLoad ? 'Đang lưu...' : (hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu')}
            </Btn>
          </form>
        </Card>

        {/* 2FA */}
        <Card title="🔐 Xác thực 2 bước (2FA)">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300 font-medium">
                Trạng thái:{' '}
                {twoFAEnabled
                  ? <span className="text-green-400">✅ Đang bật</span>
                  : <span className="text-gray-500">⚪ Chưa bật</span>}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Bảo vệ bằng Google Authenticator / Authy.</p>
            </div>
            {twoFAEnabled
              ? <Btn onClick={()=>{setTfaStep('disable');setTfaMsg({type:'',text:''});}} cls="bg-red-900/50 hover:bg-red-800 text-red-300 border border-red-800">Tắt 2FA</Btn>
              : <Btn onClick={handleSetup2FA} disabled={tfaLoad} cls="bg-indigo-600 hover:bg-indigo-500 text-white">
                  {tfaLoad&&tfaStep==='idle'?'...':'🛡️ Bật 2FA'}
                </Btn>
            }
          </div>

          <Msg m={tfaMsg}/>

          {tfaStep==='setup' && tfaData && (
            <div className="space-y-4 mt-2 p-4 bg-gray-800/60 border border-gray-700 rounded-xl">
              <p className="text-sm text-gray-300 font-medium">Quét mã QR bằng Google Authenticator:</p>
              <div className="flex justify-center">
                <img src={tfaData.qr_url} alt="QR Code" className="rounded-lg bg-white p-2" width={200} height={200}/>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Hoặc nhập thủ công secret:</p>
                <code className="text-xs bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg text-indigo-300 break-all">{tfaData.secret}</code>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Nhập mã 6 chữ số để xác nhận:</p>
                <div className="flex gap-2">
                  <input value={tfaCode} onChange={e=>setTfaCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="000000" maxLength={6}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-center font-mono text-xl tracking-widest focus:outline-none focus:border-indigo-500"/>
                  <Btn onClick={handleEnable2FA} disabled={tfaCode.length!==6||tfaLoad} cls="bg-green-700 hover:bg-green-600 text-white">
                    {tfaLoad?'...':'✓ Xác nhận'}
                  </Btn>
                </div>
                <button onClick={()=>{setTfaStep('idle');setTfaData(null);setTfaCode('');}} className="text-xs text-gray-500 hover:text-gray-400">Hủy</button>
              </div>
            </div>
          )}

          {tfaStep==='disable' && (
            <div className="space-y-3 mt-2 p-4 bg-red-900/10 border border-red-800/50 rounded-xl">
              <p className="text-sm text-red-300">Để tắt 2FA, nhập mã OTP <b>hoặc</b> mật khẩu:</p>
              <Inp placeholder="Mã OTP 6 chữ số" maxLength={6}
                value={tfaCode} onChange={e=>setTfaCode(e.target.value.replace(/\D/g,'').slice(0,6))}/>
              <div className="flex items-center gap-2 text-xs text-gray-500"><div className="flex-1 h-px bg-gray-700"/>hoặc<div className="flex-1 h-px bg-gray-700"/></div>
              <Inp type="password" placeholder="Mật khẩu tài khoản" value={tfaPw} onChange={e=>setTfaPw(e.target.value)}/>
              <div className="flex gap-2">
                <Btn onClick={handleDisable2FA} disabled={(!tfaCode&&!tfaPw)||tfaLoad} cls="bg-red-700 hover:bg-red-600 text-white flex-1">
                  {tfaLoad?'...':'Tắt 2FA'}
                </Btn>
                <Btn onClick={()=>{setTfaStep('idle');setTfaCode('');setTfaPw('');}} cls="bg-gray-700 hover:bg-gray-600 text-gray-300">Hủy</Btn>
              </div>
            </div>
          )}
        </Card>

        {/* Logout */}
        <Card title="🚪 Phiên đăng nhập">
          <p className="text-sm text-gray-400">Đang đăng nhập: <strong className="text-white">{user.username || user.name}</strong></p>
          <Btn onClick={() => signOut({ callbackUrl: '/auth/login' })} cls="bg-gray-800 hover:bg-red-900/50 hover:border-red-800 text-gray-300 hover:text-red-300 border border-gray-700 w-full">
            🚪 Đăng xuất
          </Btn>
        </Card>

      </div>
    </PubLayout>
  );
}
