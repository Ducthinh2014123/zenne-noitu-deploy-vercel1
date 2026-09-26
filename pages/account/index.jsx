import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import PubLayout from '../../components/PubLayout';
import { IconUser, IconKey, IconShieldCheck, IconLogOut, IconDot, IconCheckCircle, IconInfo, IconShield, IconEye, IconEyeOff, IconCopy, IconCheck, IconAlertTriangle } from '../../components/icons';

const PROVIDER_BADGE = {
  google:      { label: 'Google',    dot: 'text-blue-400',   cls: 'bg-blue-900/40 text-blue-300 border-blue-700' },
  github:      { label: 'GitHub',    dot: 'text-gray-300',   cls: 'bg-gray-800 text-gray-300 border-gray-600' },
  discord:     { label: 'Discord',   dot: 'text-indigo-400', cls: 'bg-indigo-900/50 text-indigo-300 border-indigo-700' },
  credentials: { label: 'Email',     dot: 'text-yellow-400', cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-700' },
};

const Card = ({ title, Icon, children }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
    <h2 className="flex items-center gap-2 text-base font-bold text-white">{Icon && <Icon className="w-4 h-4 text-indigo-400" />} {title}</h2>
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
  const [backupCodes, setBackupCodes] = useState([]);
  const [copiedBackup, setCopiedBackup] = useState(false);

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
        setPwMsg({ type:'ok', text: 'Đổi mật khẩu thành công!' });
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
        setInfo(prev => ({ ...prev, totp_enabled: true }));
        setTfaCode('');
        setTfaData(null);
        if (d.backup_codes && Array.isArray(d.backup_codes) && d.backup_codes.length > 0) {
          setBackupCodes(d.backup_codes);
          setTfaStep('backup_codes');
          setTfaMsg({ type:'ok', text: 'Bật 2FA thành công! Vui lòng sao chép và lưu trữ các mã dự phòng (Backup Codes) bên dưới.' });
        } else {
          setTfaMsg({ type:'ok', text: '2FA đã được bật!' });
          setTfaStep('idle');
        }
      } else { setTfaMsg({ type:'err', text: d.error || 'Mã OTP sai' }); }
    } catch { setTfaMsg({ type:'err', text: 'Lỗi kết nối' }); }
    setTfaLoad(false);
  };

  const copyBackupCodes = () => {
    if (!backupCodes.length) return;
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2500);
  };

  const downloadBackupCodes = () => {
    if (!backupCodes.length) return;
    const txt = `MÃ KHÔI PHỤC DỰ PHÒNG 2FA (BACKUP CODES) - NỐI TỪ BOT\n` +
      `Tài khoản: ${info?.username || session?.user?.name || 'User'} (${info?.email || session?.user?.email || ''})\n` +
      `Thời gian tạo: ${new Date().toLocaleString('vi-VN')}\n\n` +
      `LƯU Ý QUAN TRỌNG:\n` +
      `• Mỗi mã dưới đây chỉ dùng được 1 LẦN DUY NHẤT.\n` +
      `• Dùng khi bạn bị mất quyền truy cập Google Authenticator / Authy để đăng nhập hoặc đổi mật khẩu.\n` +
      `• Hãy lưu file này ở nơi an toàn, không chia sẻ cho người khác.\n\n` +
      backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nNếu bạn mất toàn bộ mã dự phòng, hãy kết bạn với Admin Discord: toilathangvnxd để được hỗ trợ gỡ 2FA.`;
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noitu-2fa-backup-codes-${info?.username || 'user'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
        setTfaMsg({ type:'ok', text: 'Đã tắt 2FA.' });
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
        <Card title="Hồ sơ" Icon={IconUser}>
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
                <IconDot className={`w-2 h-2 ${badge.dot}`} /> {badge.label}
              </span>
            </div>
          </div>
        </Card>

        {/* Change / Set Password */}
        <Card title={hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu'} Icon={IconKey}>
          {!hasPassword && provider !== 'credentials' && (
            <div className="flex items-start gap-2 p-3 bg-indigo-900/20 border border-indigo-800 rounded-xl text-indigo-300 text-sm">
              <IconInfo className="w-4 h-4 flex-shrink-0 mt-0.5" /> Bạn đăng nhập qua {badge.label}. Đặt mật khẩu để cũng có thể đăng nhập bằng email!
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPw?<IconEyeOff className="w-4 h-4" />:<IconEye className="w-4 h-4" />}</button>
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
        <Card title="Xác thực 2 bước (2FA)" Icon={IconShieldCheck}>
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm text-gray-300 font-medium">
                Trạng thái:{' '}
                {twoFAEnabled
                  ? <span className="flex items-center gap-1 text-green-400"><IconCheckCircle className="w-4 h-4" /> Đang bật</span>
                  : <span className="flex items-center gap-1 text-gray-500"><IconDot className="w-2.5 h-2.5" /> Chưa bật</span>}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Bảo vệ bằng Google Authenticator / Authy.</p>
            </div>
            {twoFAEnabled
              ? <Btn onClick={()=>{setTfaStep('disable');setTfaMsg({type:'',text:''});}} cls="bg-red-900/50 hover:bg-red-800 text-red-300 border border-red-800">Tắt 2FA</Btn>
              : <Btn onClick={handleSetup2FA} disabled={tfaLoad} cls="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white">
                  <IconShield className="w-4 h-4" /> {tfaLoad&&tfaStep==='idle'?'...':'Bật 2FA'}
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
                <p className="text-sm text-gray-300">Nhập mã 6 chự số để xác nhận:</p>
                <div className="flex gap-2">
                  <input value={tfaCode} onChange={e=>setTfaCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="000000" maxLength={6}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-center font-mono text-xl tracking-widest focus:outline-none focus:border-indigo-500"/>
                  <Btn onClick={handleEnable2FA} disabled={tfaCode.length!==6||tfaLoad} cls="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white">
                    <IconCheckCircle className="w-4 h-4" /> {tfaLoad?'...':'Xác nhận'}
                  </Btn>
                </div>
                <button onClick={()=>{setTfaStep('idle');setTfaData(null);setTfaCode('');}} className="text-xs text-gray-500 hover:text-gray-400">Hủy</button>
              </div>
            </div>
          )}

          {tfaStep==='backup_codes' && backupCodes.length > 0 && (
            <div className="space-y-4 mt-2 p-4 bg-indigo-950/40 border border-indigo-700/60 rounded-xl">
              <div className="flex items-start gap-2">
                <IconShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">Mã khôi phục dự phòng (Backup Codes)</h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Hãy lưu trữ 8 mã dự phòng này ở nơi an toàn. Mỗi mã chỉ dùng được <b>1 lần duy nhất</b> để đăng nhập hoặc lấy lại mật khẩu khi bạn mất điện thoại hoặc không mở được ứng dụng xác thực OTP.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-950/80 border border-gray-800 rounded-xl font-mono text-center text-sm font-bold tracking-wider text-indigo-300 select-all">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="p-2 bg-gray-900/90 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition-colors">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Btn onClick={copyBackupCodes} cls="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs">
                  {copiedBackup ? <><IconCheck className="w-3.5 h-3.5 text-green-400" /> Đã sao chép</> : <><IconCopy className="w-3.5 h-3.5" /> Sao chép tất cả</>}
                </Btn>
                <Btn onClick={downloadBackupCodes} cls="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs">
                  Tải file .txt
                </Btn>
                <Btn onClick={() => { setTfaStep('idle'); }} cls="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                  Tôi đã lưu mã dự phòng
                </Btn>
              </div>
            </div>
          )}

          {tfaStep==='disable' && (
            <div className="space-y-3 mt-2 p-4 bg-red-900/10 border border-red-800/50 rounded-xl">
              <p className="text-sm text-red-300">Để tắt 2FA, nhập mã OTP <b>hoặc</b> mật khẩu:</p>
              <Inp placeholder="Mã OTP 6 chự số" maxLength={6}
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
        <Card title="Phiên đăng nhập" Icon={IconLogOut}>
          <p className="text-sm text-gray-400">Đang đăng nhập: <strong className="text-white">{user.username || user.name}</strong></p>
          <Btn onClick={() => signOut({ callbackUrl: '/auth/login' })} cls="flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900/50 hover:border-red-800 text-gray-300 hover:text-red-300 border border-gray-700 w-full">
            <IconLogOut className="w-4 h-4" /> Đăng xuất
          </Btn>
        </Card>

      </div>
    </PubLayout>
  );
}
