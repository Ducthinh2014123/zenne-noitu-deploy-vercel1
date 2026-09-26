import { useState, useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { IconLink, IconLogIn, IconSparkles, IconCheckCircle, IconInfo, IconAlertTriangle, IconShieldCheck, IconRocket, IconLock, IconLogOut, IconChevronRight, IconChevronLeft, IconEye, IconEyeOff, IconMail, IconKey, IconUser, IconCheck, IconRefresh, IconClock, IconShield, IconCopy } from '../../components/icons';
import PasswordStrengthInput from '../../components/PasswordStrengthInput';

// ── Icons
const GoogleIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>);
const GithubIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>);
const DiscordIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.031.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>);

const OAuthBtn = ({ icon, label, onClick, loading, disabled }) => (
  <button onClick={onClick} disabled={disabled || loading}
    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-gray-200 hover:text-white rounded-xl transition-all font-medium text-sm disabled:opacity-50 group">
    <span className="flex-shrink-0">{loading ? <div className="w-5 h-5 border-2 border-gray-500 border-t-white rounded-full animate-spin"/> : icon}</span>
    <span className="flex-1 text-left">{label}</span>
    <IconChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
  </button>
);
const Divider = ({ text }) => (<div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-gray-700"/><span className="text-xs text-gray-500">{text}</span><div className="flex-1 h-px bg-gray-700"/></div>);
const PwStrength = ({ pw }) => { const n=[/.{8,}/,/[A-Z]/,/[0-9]/,/[^A-Za-z0-9]/].filter(r=>r.test(pw)).length; const c=['','bg-red-500','bg-orange-400','bg-yellow-400','bg-green-500'][n]; return pw?(<div className="flex items-center gap-1 mt-1.5">{[0,1,2,3].map(i=><div key={i} className={`h-1 flex-1 rounded-full ${i<n?c:'bg-gray-700'}`}/>)}<span className="text-xs text-gray-500 ml-1">{['','Yếu','TB','Tốt','Mạnh'][n]}</span></div>):null; };

export default function AuthLogin() {
  const router = useRouter();
  const { status } = useSession();
  const { callbackUrl, error: qError, tab: qTab } = router.query;

  const [tab,       setTab]       = useState('login');
  const [loading,   setLoading]   = useState('');
  const [msg,       setMsg]       = useState({ type:'', text:'' });
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (qTab === 'register') setTab('register');
    else if (qTab === 'login') setTab('login');
  }, [qTab]);

  // Email login
  const [lEmail,  setLEmail]  = useState('');
  const [lPw,     setLPw]     = useState('');
  const [showLPw, setShowLPw] = useState(false);
  const [lErr,    setLErr]    = useState({});

  // 2FA step
  const [step2FA,   setStep2FA]   = useState(false);
  const [pending,   setPending]   = useState({ email:'', pw:'' });
  const [totpCode,  setTotpCode]  = useState('');
  const [tfaMode,   setTfaMode]   = useState('totp'); // 'totp' | 'choices' | 'backup' | 'admin_help'
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const [copiedAdminDiscord, setCopiedAdminDiscord] = useState(false);

  // Register
  const [rName,  setRName]  = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPw,    setRPw]    = useState('');
  const [rPw2,   setRPw2]   = useState('');
  const [showRPw,setShowRPw]= useState(false);
  const [rErr,   setRErr]   = useState({});

  // ── Xac minh email khi dang ky (OTP 6 so) ──
  const [stepVerify,   setStepVerify]   = useState(false);
  const [verifyCtx,    setVerifyCtx]    = useState({ email:'', pw:'' });
  const [otp,          setOtp]          = useState(['','','','','','']);
  const [otpErr,       setOtpErr]       = useState('');
  const [otpMsg,       setOtpMsg]       = useState({ type:'', text:'' });
  const [otpLoading,   setOtpLoading]   = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [resendAt,     setResendAt]     = useState(0);
  const [nowTick,      setNowTick]      = useState(Date.now());
  const otpRefs = useRef([]);

  // Admin key
  const [aUrl,     setAUrl]     = useState('');
  const [aKey,     setAKey]     = useState('');
  const [aErr,     setAErr]     = useState('');
  const [aLoading, setALoading] = useState(false);

  useEffect(() => { setAUrl(localStorage.getItem('nt_api_url')||''); setAKey(localStorage.getItem('nt_api_key')||''); }, []);

  useEffect(() => {
    if (status === 'authenticated') router.push(callbackUrl||'/pub');
  }, [status, router, callbackUrl]);

  useEffect(() => {
    if (!stepVerify) return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [stepVerify]);

  useEffect(() => {
    if (!router.isReady) return;
    if (qError === 'Needs2FA') { setStep2FA(true); return; }
    const errMap = {
      Invalid2FA: 'Mã OTP sai.',
      OAuthSignin: 'Lỗi OAuth.', OAuthCallback: 'Lỗi OAuth.',
      OAuthAccountNotLinked: 'Email đã dùng với phương thức khác.',
      CredentialsSignin: 'Email hoặc mật khẩu không đúng.',
      Default: 'Đã xảy ra lỗi.',
    };
    if (qError) setMsg({ type:'error', text: errMap[qError]||errMap.Default });
  }, [router.isReady, qError]);

  const oAuth = async (p) => { setLoading(p); setMsg({type:'',text:''}); await signIn(p, { callbackUrl: callbackUrl||'/pub' }); };

  const maskEmail = (addr) => {
    const s = String(addr||'');
    const at = s.indexOf('@');
    if (at <= 0) return s;
    const user = s.slice(0, at), domain = s.slice(at);
    const visible = user.length <= 2 ? user.slice(0,1) : user.slice(0,2);
    return `${visible}${'*'.repeat(Math.max(1, user.length - visible.length))}${domain}`;
  };

  const openVerifyStep = (email, pw, expiresInSec) => {
    setVerifyCtx({ email, pw: pw||'' });
    setOtp(['','','','','','']);
    setOtpErr('');
    setOtpMsg({ type:'', text:'' });
    setOtpExpiresAt(Date.now() + (Number(expiresInSec)||600) * 1000);
    setResendAt(Date.now() + 60*1000);
    setStepVerify(true);
    setTimeout(() => otpRefs.current?.[0]?.focus(), 50);
  };

  const doLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!lEmail) errs.email = 'Nhập email';
    if (!lPw)    errs.pw    = 'Nhập mật khẩu';
    if (Object.keys(errs).length) { setLErr(errs); return; }
    setLErr({}); setLoading('creds'); setMsg({type:'',text:''});
    const res = await signIn('credentials', { email:lEmail, password:lPw, redirect:false });
    setLoading('');
    if (res?.error === 'Needs2FA') { setPending({ email:lEmail, pw:lPw }); setStep2FA(true); }
    else if (res?.error === 'Invalid2FA') { setMsg({ type:'error', text:'Mã OTP sai.' }); }
    else if (res?.error === 'EmailNotVerified') {
      setMsg({ type:'info', text:'Tài khoản chưa xác minh email. Đang gửi lại mã xác minh...' });
      try {
        const r = await fetch('/api/auth/register/email/resend', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:lEmail }) });
        const d = await r.json();
        openVerifyStep(lEmail, lPw, d.expires_in);
      } catch { openVerifyStep(lEmail, lPw, 600); }
    }
    else if (res?.error) { setMsg({ type:'error', text:'Email hoặc mật khẩu không đúng.' }); }
  };

  const do2FA = async (e) => {
    e.preventDefault();
    if (totpCode.length !== 6) { setMsg({ type:'error', text:'Nhập đúng 6 chữ số' }); return; }
    setLoading('totp'); setMsg({type:'',text:''});
    const res = await signIn('credentials', { email:pending.email, password:pending.pw, totpCode, redirect:false });
    setLoading('');
    if (res?.error === 'Invalid2FA') setMsg({ type:'error', text:'Mã OTP sai, thử lại.' });
    else if (res?.error)             setMsg({ type:'error', text:'Xác thực thất bại.' });
  };

  const doBackup2FA = async (e) => {
    e.preventDefault();
    const clean = backupCodeInput.trim().toUpperCase();
    if (!clean) { setMsg({ type:'error', text:'Vui lòng nhập mã Backup Code.' }); return; }
    setLoading('totp'); setMsg({type:'',text:''});
    const res = await signIn('credentials', { email:pending.email, password:pending.pw, totpCode: clean, redirect:false });
    setLoading('');
    if (res?.error === 'Invalid2FA') setMsg({ type:'error', text:'Mã Backup Code không đúng hoặc đã được sử dụng.' });
    else if (res?.error)             setMsg({ type:'error', text:'Xác thực thất bại.' });
  };

  const doRegister = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!rName||rName.length<3)              errs.name  = 'Tối thiểu 3 ký tự';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rEmail)) errs.email = 'Email không hợp lệ';
    if (!rPw||rPw.length<6)                  errs.pw    = 'Tối thiểu 6 ký tự';
    if (rPw!==rPw2)                          errs.pw2   = 'Mật khẩu không khớp';
    if (Object.keys(errs).length) { setRErr(errs); return; }
    setRErr({}); setLoading('reg'); setMsg({type:'',text:''});
    try {
      const r = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:rName,email:rEmail,password:rPw}) });
      const d = await r.json();
      if (!r.ok) { setMsg({type:'error',text:d.error||'Đăng ký thất bại'}); setLoading(''); return; }
      setMsg({type:'',text:''});
      openVerifyStep(rEmail, rPw, d.expires_in);
    } catch { setMsg({type:'error',text:'Lỗi kết nối server.'}); }
    setLoading('');
  };

  // ── OTP box handlers ──
  const focusOtp = (i) => otpRefs.current?.[i]?.focus();

  const handleOtpChange = (i, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setOtp(prev => { const next = [...prev]; next[i] = digit; return next; });
    setOtpErr('');
    if (digit && i < 5) focusOtp(i + 1);
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (!otp[i] && i > 0) {
        e.preventDefault();
        setOtp(prev => { const next = [...prev]; next[i-1] = ''; return next; });
        focusOtp(i - 1);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) { focusOtp(i - 1); }
    else if (e.key === 'ArrowRight' && i < 5) { focusOtp(i + 1); }
    else if (e.key === 'Enter') { e.preventDefault(); doVerifyOtp(); }
  };

  const handleOtpPaste = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const digits = String(text).replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    const next = ['','','','','',''];
    for (let k = 0; k < digits.length; k++) next[k] = digits[k];
    setOtp(next);
    setOtpErr('');
    focusOtp(Math.min(digits.length, 5));
  };

  const doVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6 || otpLoading) { if (code.length !== 6) setOtpErr('Nhập đủ 6 chữ số.'); return; }
    setOtpLoading('verify'); setOtpErr(''); setOtpMsg({type:'',text:''});
    try {
      const r = await fetch('/api/auth/register/email/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email: verifyCtx.email, code }) });
      const d = await r.json();
      if (!r.ok) {
        setOtpErr(d.error || 'Mã xác minh không đúng.');
        setOtp(['','','','','','']);
        focusOtp(0);
        setOtpLoading('');
        return;
      }
      setOtpMsg({ type:'success', text:'Xác minh thành công! Đang đăng nhập...' });
      if (verifyCtx.pw) {
        await signIn('credentials', { email: verifyCtx.email, password: verifyCtx.pw, redirect:false });
      } else {
        setStepVerify(false);
        setTab('login');
        setLEmail(verifyCtx.email);
        setMsg({ type:'success', text:'Xác minh thành công! Vui lòng đăng nhập.' });
      }
    } catch {
      setOtpErr('Lỗi kết nối server.');
    }
    setOtpLoading('');
  };

  const doResendOtp = async () => {
    if (otpLoading || nowTick < resendAt) return;
    setOtpLoading('resend'); setOtpErr(''); setOtpMsg({type:'',text:''});
    try {
      const r = await fetch('/api/auth/register/email/resend', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email: verifyCtx.email }) });
      const d = await r.json();
      if (!r.ok) {
        setOtpErr(d.error || 'Không thể gửi lại mã lúc này.');
        setResendAt(Date.now() + 60*1000);
      } else {
        setOtp(['','','','','','']);
        setOtpExpiresAt(Date.now() + (Number(d.expires_in)||600) * 1000);
        setResendAt(Date.now() + 60*1000);
        setOtpMsg({ type:'success', text:'Đã gửi lại mã xác minh tới email của bạn.' });
        focusOtp(0);
      }
    } catch {
      setOtpErr('Lỗi kết nối server.');
    }
    setOtpLoading('');
  };

  const doAdminLogin = async (e) => {
    e.preventDefault(); setAErr(''); setALoading(true);
    const base = aUrl.trim().replace(/\/$/,'');
    try {
      const r = await fetch(base+'/api/pending',{headers:{'X-API-Key':aKey.trim()}});
      if (r.status===403||r.status===401){setAErr('Sai API Key!');setALoading(false);return;}
      if (!r.ok){setAErr('Lỗi kết nối: '+r.status);setALoading(false);return;}
      localStorage.setItem('nt_api_url',base); localStorage.setItem('nt_api_key',aKey.trim());
      router.push('/pending');
    } catch { setAErr('Không kết nối được.'); }
    setALoading(false);
  };

  const any = loading !== '';

  if (status === 'loading') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"/>
    </div>
  );

  // ═══ 2FA STEP ═══
  if (step2FA) return (
    <>
      <Head><title>Xác thực 2 bước — Nối Từ Bot</title></Head>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4"
        style={{backgroundImage:'radial-gradient(ellipse at top,rgba(99,102,241,.1) 0%,transparent 55%)'}}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-7">
            <IconShieldCheck className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white">Xác thực 2 bước</h1>
            <p className="text-gray-400 text-sm mt-1">{pending.email}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            {msg.text && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-400 text-sm">
                <IconAlertTriangle className="w-4 h-4 flex-shrink-0" /> {msg.text}
              </div>
            )}

            {/* Chế độ 1: Nhập OTP 6 số từ Google Authenticator / Authy */}
            {tfaMode === 'totp' && (
              <div>
                <p className="text-sm text-gray-400 mb-5">
                  Mở <b className="text-white">Google Authenticator</b> / <b className="text-white">Authy</b> và nhập mã 6 chữ số:
                </p>
                <form onSubmit={do2FA} className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    autoFocus
                    autoComplete="one-time-code"
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white text-center text-3xl font-mono tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={any || totpCode.length !== 6}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    {loading === 'totp' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xác nhận...
                      </>
                    ) : (
                      <>
                        <IconCheckCircle className="w-4 h-4" /> Xác nhận
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => { setTfaMode('choices'); setMsg({ type:'', text:'' }); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      Bạn không có mã One-Time Code?
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep2FA(false);
                      setTfaMode('totp');
                      setPending({ email: '', pw: '' });
                      setTotpCode('');
                      setBackupCodeInput('');
                      setMsg({ type: '', text: '' });
                    }}
                    className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm"
                  >
                    ← Quay lại đăng nhập
                  </button>
                </form>
              </div>
            )}

            {/* Màn hình lựa chọn khi không có OTP */}
            {tfaMode === 'choices' && (
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <h3 className="text-base font-semibold text-white">Bạn không có mã OTP?</h3>
                  <p className="text-xs text-gray-400 mt-1">Chọn một trong 2 phương án khôi phục dưới đây:</p>
                </div>

                <button
                  type="button"
                  onClick={() => { setTfaMode('backup'); setMsg({ type:'', text:'' }); }}
                  className="w-full text-left p-3.5 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-indigo-500 rounded-xl transition-all group flex items-start gap-3"
                >
                  <div className="p-2 bg-indigo-900/40 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <IconKey className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      1. Nhập Backup Code 2FA
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Sử dụng 1 trong 8 mã dự phòng bạn đã nhận khi kích hoạt 2FA
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setTfaMode('admin_help'); setMsg({ type:'', text:'' }); }}
                  className="w-full text-left p-3.5 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-amber-500 rounded-xl transition-all group flex items-start gap-3"
                >
                  <div className="p-2 bg-amber-900/40 text-amber-400 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <IconShield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                      2. Liên hệ Admin để xóa 2FA
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Kết bạn Admin qua Discord để xác minh chủ tài khoản và gỡ 2FA
                    </div>
                  </div>
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => { setTfaMode('totp'); setMsg({ type:'', text:'' }); }}
                    className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-200"
                  >
                    ← Quay lại nhập mã OTP
                  </button>
                </div>
              </div>
            )}

            {/* Chế độ 2: Nhập Backup Code */}
            {tfaMode === 'backup' && (
              <div>
                <p className="text-sm text-gray-300 mb-1 font-medium">Nhập mã Backup Code:</p>
                <p className="text-xs text-gray-500 mb-4">
                  Mã dự phòng có dạng <code className="text-indigo-300">XXXX-XXXX</code>. Mỗi mã chỉ sử dụng được 1 lần.
                </p>
                <form onSubmit={doBackup2FA} className="space-y-4">
                  <input
                    type="text"
                    placeholder="VD: ABCD-1234"
                    autoFocus
                    maxLength={12}
                    value={backupCodeInput}
                    onChange={e => setBackupCodeInput(e.target.value.toUpperCase())}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-xl font-mono tracking-widest uppercase placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={any || !backupCodeInput.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    {loading === 'totp' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        <IconCheckCircle className="w-4 h-4" /> Xác nhận mã dự phòng
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTfaMode('choices'); setMsg({ type:'', text:'' }); }}
                    className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm"
                  >
                    ← Quay lại lựa chọn khác
                  </button>
                </form>
              </div>
            )}

            {/* Chế độ 3: Hướng dẫn liên hệ Admin Discord */}
            {tfaMode === 'admin_help' && (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2">
                  <DiscordIcon />
                  <h3 className="text-base font-bold text-white">Liên hệ Admin gỡ 2FA</h3>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Nếu bạn mất điện thoại và không còn mã dự phòng, vui lòng kết bạn trực tiếp với Admin trên Discord:
                </p>

                <div className="p-3.5 bg-gray-950 border border-indigo-900/60 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Discord Admin Username</div>
                    <div className="text-base font-mono font-bold text-indigo-400 select-all">toilathangvnxd</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('toilathangvnxd');
                      setCopiedAdminDiscord(true);
                      setTimeout(() => setCopiedAdminDiscord(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-indigo-900/50 hover:bg-indigo-800 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-700 flex items-center gap-1.5 transition-all"
                  >
                    {copiedAdminDiscord ? <><IconCheck className="w-3.5 h-3.5 text-green-400" /> Đã chép</> : <><IconCopy className="w-3.5 h-3.5" /> Sao chép</>}
                  </button>
                </div>

                <div className="p-3 bg-gray-800/60 border border-gray-700/60 rounded-xl text-xs text-gray-400 space-y-1.5">
                  <div className="font-semibold text-gray-300">Quy trình xác minh:</div>
                  <p>1. Kết bạn Discord với <b className="text-white">toilathangvnxd</b>.</p>
                  <p>2. Cung cấp email tài khoản của bạn: <code className="text-indigo-300">{pending.email}</code>.</p>
                  <p>3. Trả lời các câu hỏi bảo mật để chứng minh bạn là chủ sở hữu (thời gian tạo nick, lịch sử chơi,...).</p>
                  <p>4. Sau khi xác minh, Admin sẽ dùng lệnh bot để gỡ 2FA để bạn đăng nhập lại bình thường.</p>
                </div>

                <button
                  type="button"
                  onClick={() => { setTfaMode('choices'); setMsg({ type:'', text:'' }); }}
                  className="w-full py-2.5 text-gray-400 hover:text-gray-200 text-xs text-center"
                >
                  ← Quay lại lựa chọn khác
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // ═══ EMAIL VERIFY (OTP) STEP ═══
  if (stepVerify) {
    const remainMs = otpExpiresAt - nowTick;
    const remainSec = Math.max(0, Math.floor(remainMs / 1000));
    const expired = remainMs <= 0;
    const mm = String(Math.floor(remainSec / 60)).padStart(2, '0');
    const ss = String(remainSec % 60).padStart(2, '0');
    const resendWaitSec = Math.max(0, Math.ceil((resendAt - nowTick) / 1000));
    return (
      <>
        <Head><title>Xác minh tài khoản — Nối Từ Bot</title></Head>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4"
          style={{backgroundImage:'radial-gradient(ellipse at top,rgba(99,102,241,.1) 0%,transparent 55%)'}}>
          <div className="w-full max-w-sm">
            <div className="text-center mb-7">
              <IconMail className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-white">Xác minh tài khoản</h1>
              <p className="text-gray-400 text-sm mt-1">Mã xác minh đã được gửi tới {maskEmail(verifyCtx.email)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              {otpMsg.text && (
                <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm border ${otpMsg.type==='success' ? 'bg-green-900/30 border-green-700/50 text-green-400' : 'bg-indigo-900/30 border-indigo-700/50 text-indigo-300'}`}>
                  {otpMsg.type==='success'?<IconCheckCircle className="w-4 h-4 flex-shrink-0" />:<IconInfo className="w-4 h-4 flex-shrink-0" />} {otpMsg.text}
                </div>
              )}
              {otpErr && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-400 text-sm">
                  <IconAlertTriangle className="w-4 h-4 flex-shrink-0" /> {otpErr}
                </div>
              )}

              <div className="flex justify-center gap-2 mb-3" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} autoFocus={i===0}
                    value={d} disabled={otpLoading==='verify'}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 bg-gray-800 border border-gray-700 rounded-xl text-center text-white text-xl font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                ))}
              </div>

              <p className="text-center text-xs text-gray-500 mb-5">
                {expired
                  ? <span className="text-red-400">Mã đã hết hạn, vui lòng gửi lại mã mới.</span>
                  : <>Mã hết hạn sau <span className="text-gray-300 font-mono">{mm}:{ss}</span></>}
              </p>

              <button onClick={doVerifyOtp} disabled={otpLoading!=='' || otp.join('').length!==6 || expired}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 mb-3">
                {otpLoading==='verify'?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang xác minh...</>:<><IconCheckCircle className="w-4 h-4" /> Xác minh</>}
              </button>

              <button onClick={doResendOtp} disabled={otpLoading!=='' || nowTick < resendAt}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 text-gray-300 font-medium rounded-xl flex items-center justify-center gap-2 text-sm mb-2">
                {otpLoading==='resend'
                  ?<><div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin"/>Đang gửi...</>
                  :nowTick < resendAt
                    ?<><IconClock className="w-4 h-4"/> Gửi lại mã ({resendWaitSec}s)</>
                    :<><IconRefresh className="w-4 h-4" /> Gửi lại mã</>}
              </button>

              <button type="button" onClick={() => {
                  setStepVerify(false); setVerifyCtx({ email:'', pw:'' }); setOtp(['','','','','','']);
                  setOtpErr(''); setOtpMsg({type:'',text:''}); setOtpLoading('');
                  setTab('login'); setMsg({type:'',text:''});
                }}
                className="w-full py-2.5 text-gray-500 hover:text-gray-300 text-sm flex items-center justify-center gap-1">
                <IconChevronLeft className="w-4 h-4" /> Quay lại đăng nhập
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ═══ MAIN LOGIN PAGE (CodeCandy Morphing Layout) ═══
  const isActive = tab === 'register';

  return (
    <>
      <Head><title>{isActive ? 'Đăng ký' : 'Đăng nhập'} — Nối Từ Bot</title></Head>
      <div className="auth-wrapper"
        style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(255, 53, 45, 0.08) 0%, transparent 60%)' }}>
        
        {/* Main Auth Container */}
        <div className={`auth-container ${isActive ? 'active' : ''}`}>
          
          {/* Mobile Tab Header (< 768px) */}
          <div className="md:hidden flex border-b border-gray-800 bg-gray-900/90">
            <button
              type="button"
              onClick={() => { setTab('login'); setMsg({ type:'', text:'' }); }}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                !isActive ? 'text-white border-[#ff352d] bg-[#ff352d]/10' : 'text-gray-400 border-transparent'
              }`}
            >
              <IconLogIn className="w-4 h-4" /> Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setMsg({ type:'', text:'' }); }}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                isActive ? 'text-white border-[#ff352d] bg-[#ff352d]/10' : 'text-gray-400 border-transparent'
              }`}
            >
              <IconSparkles className="w-4 h-4" /> Đăng ký
            </button>
          </div>

          {/* Form Panel: LOGIN */}
          <div className="form-panel form-panel--login">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#ff352d]/20 border border-[#ff352d]/30 text-[#ff352d]">
                  <IconLink className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-gray-300">Nối Từ Bot</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Đăng nhập</h1>
              <p className="text-xs text-gray-400 mt-1">Chọn phương thức thuận tiện nhất cho bạn</p>
            </div>

            {/* Alert */}
            {msg.text && !isActive && (
              <div className={`flex gap-2 items-start p-3 rounded-xl text-xs mb-3 border ${
                msg.type === 'success' ? 'bg-green-900/30 border-green-700/50 text-green-400' :
                msg.type === 'info'    ? 'bg-indigo-900/30 border-indigo-700/50 text-indigo-300' :
                                         'bg-red-900/30 border-red-700/50 text-red-400'
              }`}>
                {msg.type === 'success' ? <IconCheckCircle className="w-4 h-4 flex-shrink-0" /> :
                 msg.type === 'info'    ? <IconInfo className="w-4 h-4 flex-shrink-0" /> :
                                          <IconAlertTriangle className="w-4 h-4 flex-shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            {/* Quick OAuth row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => oAuth('google')}
                disabled={any}
                title="Đăng nhập bằng Google"
                className="flex items-center justify-center py-2.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl transition-all disabled:opacity-50"
              >
                <GoogleIcon />
              </button>
              <button
                type="button"
                onClick={() => oAuth('github')}
                disabled={any}
                title="Đăng nhập bằng GitHub"
                className="flex items-center justify-center py-2.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl transition-all disabled:opacity-50 text-white"
              >
                <GithubIcon />
              </button>
              <button
                type="button"
                onClick={() => oAuth('discord')}
                disabled={any}
                title="Đăng nhập bằng Discord"
                className="flex items-center justify-center py-2.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl transition-all disabled:opacity-50"
              >
                <DiscordIcon />
              </button>
            </div>

            <Divider text="hoặc email" />

            <form onSubmit={doLogin} className="space-y-3" noValidate>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <IconMail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="ban@email.com"
                    autoComplete="email"
                    className={`w-full bg-gray-800/90 border rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-sm ${
                      lErr.email ? 'border-red-600' : 'border-gray-700 focus:border-[#ff352d]'
                    }`}
                    value={lEmail}
                    onChange={e => setLEmail(e.target.value)}
                  />
                </div>
                {lErr.email && <p className="mt-1 text-xs text-red-400">{lErr.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Mật khẩu</label>
                  <Link href="/auth/reset-password" className="text-xs text-red-400 hover:text-red-300 font-medium">Quên?</Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <IconKey className="w-4 h-4" />
                  </div>
                  <input
                    type={showLPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full bg-gray-800/90 border rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-sm ${
                      lErr.pw ? 'border-red-600' : 'border-gray-700 focus:border-[#ff352d]'
                    }`}
                    value={lPw}
                    onChange={e => setLPw(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showLPw ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                  </button>
                </div>
                {lErr.pw && <p className="mt-1 text-xs text-red-400">{lErr.pw}</p>}
              </div>

              <button
                type="submit"
                disabled={any}
                className="w-full py-2.5 mt-2 bg-[#ff352d] hover:bg-[#e0261f] disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all text-sm active:scale-[0.98]"
              >
                {loading === 'creds' ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang đăng nhập...</>
                ) : (
                  <><IconRocket className="w-4 h-4" /> Đăng nhập</>
                )}
              </button>
            </form>

            {/* Mobile switch */}
            <p className="md:hidden text-center text-xs text-gray-400 mt-4">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => { setTab('register'); setMsg({ type:'', text:'' }); }}
                className="text-[#ff352d] font-semibold hover:underline"
              >
                Đăng ký ngay
              </button>
            </p>

            {/* Admin Key Collapsible */}
            <div className="mt-4 border-t border-gray-800/80 pt-3">
              <button
                type="button"
                onClick={() => setShowAdmin(s => !s)}
                className="w-full flex items-center justify-between text-[11px] text-gray-500 hover:text-gray-300"
              >
                <span className="flex items-center gap-1.5">
                  <IconLock className="w-3 h-3" /> Đăng nhập Admin bằng API Key
                </span>
                <svg className={`w-3 h-3 transition-transform ${showAdmin ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showAdmin && (
                <form onSubmit={doAdminLogin} className="mt-2 space-y-2">
                  {aErr && <div className="p-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-[11px]">{aErr}</div>}
                  <input
                    type="url"
                    placeholder="API URL (https://...)"
                    required
                    value={aUrl}
                    onChange={e => setAUrl(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#ff352d]"
                  />
                  <input
                    type="password"
                    placeholder="API Key"
                    required
                    value={aKey}
                    onChange={e => setAKey(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#ff352d]"
                  />
                  <button
                    type="submit"
                    disabled={aLoading}
                    className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-60 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5"
                  >
                    {aLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <IconLogIn className="w-3 h-3" />}
                    Vào Admin
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Form Panel: REGISTER */}
          <div className="form-panel form-panel--register">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#ff352d]/20 border border-[#ff352d]/30 text-[#ff352d]">
                  <IconSparkles className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-gray-300">Nối Từ Bot</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Tạo tài khoản</h1>
              <p className="text-xs text-gray-400 mt-1">Đăng ký nhanh hoặc dùng email của bạn</p>
            </div>

            {/* Alert */}
            {msg.text && isActive && (
              <div className={`flex gap-2 items-start p-3 rounded-xl text-xs mb-3 border ${
                msg.type === 'success' ? 'bg-green-900/30 border-green-700/50 text-green-400' :
                msg.type === 'info'    ? 'bg-indigo-900/30 border-indigo-700/50 text-indigo-300' :
                                         'bg-red-900/30 border-red-700/50 text-red-400'
              }`}>
                {msg.type === 'success' ? <IconCheckCircle className="w-4 h-4 flex-shrink-0" /> :
                 msg.type === 'info'    ? <IconInfo className="w-4 h-4 flex-shrink-0" /> :
                                          <IconAlertTriangle className="w-4 h-4 flex-shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            {/* Quick OAuth row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => oAuth('google')}
                disabled={any}
                title="Đăng ký với Google"
                className="flex items-center justify-center py-2.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl transition-all disabled:opacity-50"
              >
                <GoogleIcon />
              </button>
              <button
                type="button"
                onClick={() => oAuth('github')}
                disabled={any}
                title="Đăng ký với GitHub"
                className="flex items-center justify-center py-2.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl transition-all disabled:opacity-50 text-white"
              >
                <GithubIcon />
              </button>
              <button
                type="button"
                onClick={() => oAuth('discord')}
                disabled={any}
                title="Đăng ký với Discord"
                className="flex items-center justify-center py-2.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl transition-all disabled:opacity-50"
              >
                <DiscordIcon />
              </button>
            </div>

            <Divider text="hoặc bằng email" />

            <form onSubmit={doRegister} className="space-y-2.5" noValidate>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Tên người dùng</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <IconUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="noitufan123"
                    autoComplete="username"
                    minLength={3}
                    maxLength={30}
                    className={`w-full bg-gray-800/90 border rounded-xl pl-9 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none transition-colors text-sm ${
                      rErr.name ? 'border-red-600' : 'border-gray-700 focus:border-[#ff352d]'
                    }`}
                    value={rName}
                    onChange={e => setRName(e.target.value)}
                  />
                </div>
                {rErr.name && <p className="mt-0.5 text-xs text-red-400">{rErr.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <IconMail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="ban@email.com"
                    autoComplete="email"
                    className={`w-full bg-gray-800/90 border rounded-xl pl-9 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none transition-colors text-sm ${
                      rErr.email ? 'border-red-600' : 'border-gray-700 focus:border-[#ff352d]'
                    }`}
                    value={rEmail}
                    onChange={e => setREmail(e.target.value)}
                  />
                </div>
                {rErr.email && <p className="mt-0.5 text-xs text-red-400">{rErr.email}</p>}
              </div>

              <PasswordStrengthInput
                value={rPw}
                onChange={e => setRPw(e.target.value)}
                onSuggest={generated => {
                  setRPw(generated);
                  setRPw2(generated);
                }}
                error={rErr.pw}
                label="Password"
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
              />

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <IconKey className="w-4 h-4" />
                  </div>
                  <input
                    type={showRPw ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    className={`w-full bg-gray-800/90 border rounded-xl pl-9 pr-10 py-2 text-white placeholder-gray-500 focus:outline-none transition-colors text-sm ${
                      rErr.pw2 ? 'border-red-600' : rPw2 && rPw2 === rPw ? 'border-green-600' : 'border-gray-700 focus:border-[#ff352d]'
                    }`}
                    value={rPw2}
                    onChange={e => setRPw2(e.target.value)}
                  />
                  {rPw2 && rPw2 === rPw && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                      <IconCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {rErr.pw2 && <p className="mt-0.5 text-xs text-red-400">{rErr.pw2}</p>}
              </div>

              <button
                type="submit"
                disabled={any}
                className="w-full py-2.5 mt-2 bg-[#ff352d] hover:bg-[#e0261f] disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all text-sm active:scale-[0.98]"
              >
                {loading === 'reg' ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang tạo...</>
                ) : (
                  <><IconSparkles className="w-4 h-4" /> Tạo tài khoản</>
                )}
              </button>
            </form>

            {/* Mobile switch */}
            <p className="md:hidden text-center text-xs text-gray-400 mt-4">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => { setTab('login'); setMsg({ type:'', text:'' }); }}
                className="text-[#ff352d] font-semibold hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          </div>

          {/* Morphing Overlay Panel (CodeCandy) */}
          <div className="overlay-panel">
            {/* When at Login state (panel on the right): invite to Register */}
            <div className="overlay-content overlay-content--signin">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-white mb-6 shadow-md backdrop-blur-sm">
                <IconSparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Chào bạn mới!</h2>
              <p className="mt-3 text-sm text-white/90 leading-relaxed max-w-[280px]">
                Tạo tài khoản ngay để lưu kỷ lục điểm số các trò chơi, leo rank và kết nối cùng cộng đồng Nối Từ!
              </p>
              <button
                type="button"
                onClick={() => { setTab('register'); setMsg({ type:'', text:'' }); }}
                className="mt-8 px-8 py-3 rounded-full border-2 border-white text-white font-bold text-sm tracking-wide hover:bg-white hover:text-[#ff352d] transition-all shadow-xl active:scale-95"
              >
                Đăng ký ngay
              </button>
            </div>

            {/* When at Register state (panel on the left): invite to Login */}
            <div className="overlay-content overlay-content--signup">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-white mb-6 shadow-md backdrop-blur-sm">
                <IconShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Mừng bạn trở lại!</h2>
              <p className="mt-3 text-sm text-white/90 leading-relaxed max-w-[280px]">
                Nếu bạn đã có tài khoản, hãy đăng nhập để tiếp tục hành trình tranh tài cùng bạn bè nhé!
              </p>
              <button
                type="button"
                onClick={() => { setTab('login'); setMsg({ type:'', text:'' }); }}
                className="mt-8 px-8 py-3 rounded-full border-2 border-white text-white font-bold text-sm tracking-wide hover:bg-white hover:text-[#ff352d] transition-all shadow-xl active:scale-95"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>

        </div>

        {/* Back to public link */}
        <p className="absolute bottom-4 text-center text-xs text-gray-500 hover:text-gray-400">
          <Link href="/pub">← Về trang Public</Link>
        </p>
      </div>
    </>
  );
}
