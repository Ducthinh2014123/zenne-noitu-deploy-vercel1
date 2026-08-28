import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// ── SVG Icons ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
    <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
    <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
    <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
  </svg>
);

// ── OAuth Button ────────────────────────────────────────────────────────────
const OAuthBtn = ({ icon, label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-500 text-gray-200 rounded-xl transition-all duration-150 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed group">
    <span className="flex-shrink-0">{icon}</span>
    <span className="flex-1 text-left group-hover:text-white">{label}</span>
    <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
    </svg>
  </button>
);

// ── Divider ─────────────────────────────────────────────────────────────────
const Divider = ({ text }) => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-gray-700" />
    <span className="text-xs text-gray-500 whitespace-nowrap">{text}</span>
    <div className="flex-1 h-px bg-gray-700" />
  </div>
);

// ── Input ───────────────────────────────────────────────────────────────────
const Input = ({ label, icon, error, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
      <input {...props}
        className={`w-full bg-gray-800/80 border rounded-xl px-4 py-3 ${icon ? 'pl-10' : ''} text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${
          error ? 'border-red-600 focus:border-red-500' : 'border-gray-700 focus:border-indigo-500'
        }`}/>
    </div>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

// ── Password strength ────────────────────────────────────────────────────────
const StrengthBar = ({ pw }) => {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length;
  const clr = ['bg-red-500','bg-orange-500','bg-yellow-500','bg-green-500'][score-1] || 'bg-gray-700';
  return pw ? (
    <div className="mt-1.5 flex gap-1">
      {[0,1,2,3].map(i => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? clr : 'bg-gray-700'}`}/>
      ))}
      <span className="text-xs text-gray-500 ml-1">{['','Yeu','Trung binh','Tot','Manh'][score]}</span>
    </div>
  ) : null;
};

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AuthLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { callbackUrl, error: qError } = router.query;
  const [tab, setTab]         = useState('login');   // login | register
  const [loading, setLoading] = useState('');
  const [msg, setMsg]         = useState({ type: '', text: '' });

  // Login state
  const [loginEmail, setLoginEmail]   = useState('');
  const [loginPw,    setLoginPw]      = useState('');
  const [showPw,     setShowPw]       = useState(false);
  const [loginErr,   setLoginErr]     = useState({});

  // Register state
  const [regName,    setRegName]      = useState('');
  const [regEmail,   setRegEmail]     = useState('');
  const [regPw,      setRegPw]        = useState('');
  const [regPw2,     setRegPw2]       = useState('');
  const [showRegPw,  setShowRegPw]    = useState(false);
  const [regErr,     setRegErr]       = useState({});

  // Redirect khi da dang nhap
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl || (session?.user?.isAdmin ? '/pending' : '/pub'));
    }
  }, [status, session, router, callbackUrl]);

  // Hien loi OAuth
  useEffect(() => {
    const errMap = {
      OAuthSignin: 'Loi OAuth, thu lai sau.',
      OAuthCallback: 'Loi callback OAuth.',
      OAuthAccountNotLinked: 'Email nay da dung voi phuong thuc khac.',
      CredentialsSignin: 'Email hoac mat khau khong dung.',
      Default: 'Da xay ra loi. Thu lai sau.',
    };
    if (qError) setMsg({ type: 'error', text: errMap[qError] || errMap.Default });
  }, [qError]);

  // ── OAuth ──
  const handleOAuth = async (provider) => {
    setLoading(provider); setMsg({ type: '', text: '' });
    await signIn(provider, { callbackUrl: callbackUrl || '/' });
  };

  // ── Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginEmail) errs.email = 'Nhap email';
    if (!loginPw)    errs.pw    = 'Nhap mat khau';
    if (Object.keys(errs).length) { setLoginErr(errs); return; }
    setLoginErr({}); setLoading('credentials'); setMsg({ type: '', text: '' });
    const res = await signIn('credentials', {
      email: loginEmail, password: loginPw, redirect: false,
    });
    setLoading('');
    if (res?.error) setMsg({ type: 'error', text: res.error === 'CredentialsSignin' ? 'Email hoac mat khau khong dung.' : 'Dang nhap that bai.' });
  };

  // ── Register ──
  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!regName)        errs.name  = 'Nhap ten dang nhap';
    else if (regName.length < 3) errs.name = 'Toi thieu 3 ky tu';
    if (!regEmail)       errs.email = 'Nhap email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errs.email = 'Email khong hop le';
    if (!regPw)          errs.pw    = 'Nhap mat khau';
    else if (regPw.length < 6) errs.pw = 'Toi thieu 6 ky tu';
    if (regPw !== regPw2) errs.pw2  = 'Mat khau khong khop';
    if (Object.keys(errs).length) { setRegErr(errs); return; }
    setRegErr({}); setLoading('register'); setMsg({ type: '', text: '' });
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regName, email: regEmail, password: regPw }),
      });
      const data = await r.json();
      if (!r.ok) { setMsg({ type: 'error', text: data.error || 'Dang ky that bai' }); setLoading(''); return; }
      setMsg({ type: 'success', text: 'Dang ky thanh cong! Dang nhap...' });
      await signIn('credentials', { email: regEmail, password: regPw, redirect: false });
    } catch { setMsg({ type: 'error', text: 'Loi ket noi server.' }); }
    setLoading('');
  };

  const isLoading = (p) => loading === p;
  const anyLoading = loading !== '';

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"/>
    </div>;
  }

  return (
    <>
      <Head><title>Dang nhap — Noi Tu Bot</title></Head>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" style={{
        backgroundImage: 'radial-gradient(ellipse at top, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(168,85,247,0.05) 0%, transparent 60%)',
      }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-4xl mb-4 shadow-lg shadow-indigo-900/20">
              🐟
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Nối Từ Bot</h1>
            <p className="text-gray-500 text-sm mt-1">Người dùng &amp; Admin — một nơi duy nhất</p>
          </div>

          {/* Card */}
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              {[['login','Dang nhap'],['register','Dang ky']].map(([k,l]) => (
                <button key={k} onClick={() => { setTab(k); setMsg({ type:'',text:'' }); }}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                    tab===k ? 'text-white border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-gray-500 hover:text-gray-300'
                  }`}>{l}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Global message */}
              {msg.text && (
                <div className={`flex items-center gap-2 p-3.5 rounded-xl text-sm mb-5 border ${
                  msg.type==='success'
                    ? 'bg-green-900/30 border-green-700/50 text-green-400'
                    : 'bg-red-900/30 border-red-700/50 text-red-400'
                }`}>
                  <span>{msg.type==='success' ? '✅' : '⚠️'}</span>
                  <span>{msg.text}</span>
                </div>
              )}

              {/* ── LOGIN TAB ── */}
              {tab === 'login' && (
                <>
                  {/* OAuth buttons */}
                  <div className="space-y-2.5">
                    <OAuthBtn icon={<GoogleIcon/>}    label="Tiếp tục với Google"    onClick={() => handleOAuth('google')}    disabled={anyLoading && !isLoading('google')}/>
                    <OAuthBtn icon={<GithubIcon/>}    label="Tiếp tục với GitHub"    onClick={() => handleOAuth('github')}    disabled={anyLoading && !isLoading('github')}/>
                    <OAuthBtn icon={<FacebookIcon/>}  label="Tiếp tục với Facebook"  onClick={() => handleOAuth('facebook')}  disabled={anyLoading && !isLoading('facebook')}/>
                    <OAuthBtn icon={<MicrosoftIcon/>} label="Tiếp tục với Microsoft" onClick={() => handleOAuth('microsoft')} disabled={anyLoading && !isLoading('microsoft')}/>
                  </div>

                  <Divider text="hoặc đăng nhập bằng email" />

                  {/* Credentials form */}
                  <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    <Input label="Email" type="email" placeholder="ban@email.com"
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                      value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      error={loginErr.email} autoComplete="email"/>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Mật khẩu</label>
                        <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300">
                          Quên mật khẩu?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                        <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                          className={`w-full bg-gray-800/80 border rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${
                            loginErr.pw ? 'border-red-600' : 'border-gray-700 focus:border-indigo-500'
                          }`}
                          value={loginPw} onChange={e => setLoginPw(e.target.value)} autoComplete="current-password"/>
                        <button type="button" onClick={() => setShowPw(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {showPw
                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/></svg>
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          }
                        </button>
                      </div>
                      {loginErr.pw && <p className="mt-1 text-xs text-red-400">{loginErr.pw}</p>}
                    </div>

                    <button type="submit" disabled={anyLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30">
                      {isLoading('credentials')
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Dang nhap...</>
                        : '🚀 Dang nhap'
                      }
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-500 mt-5">
                    Chua co tai khoan?{' '}
                    <button onClick={() => setTab('register')} className="text-indigo-400 hover:text-indigo-300 font-medium">Dang ky ngay</button>
                  </p>
                </>
              )}

              {/* ── REGISTER TAB ── */}
              {tab === 'register' && (
                <>
                  {/* OAuth quick register */}
                  <div className="space-y-2.5 mb-2">
                    <p className="text-xs text-gray-500 text-center">Dang ky nhanh bang</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[['google',<GoogleIcon/>],['github',<GithubIcon/>],['facebook',<FacebookIcon/>],['microsoft',<MicrosoftIcon/>]].map(([p,ic]) => (
                        <button key={p} onClick={() => handleOAuth(p)} disabled={anyLoading}
                          title={'Sign in with ' + p}
                          className="flex items-center justify-center py-2.5 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-500 hover:bg-gray-750 transition-colors disabled:opacity-50">
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Divider text="hoặc đăng kí bằng email" />

                  <form onSubmit={handleRegister} className="space-y-4" noValidate>
                    <Input label="Ten dang nhap" type="text" placeholder="noitufan123" autoComplete="username"
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                      value={regName} onChange={e => setRegName(e.target.value)} error={regErr.name} minLength={3} maxLength={30}/>

                    <Input label="Email" type="email" placeholder="ban@email.com" autoComplete="email"
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                      value={regEmail} onChange={e => setRegEmail(e.target.value)} error={regErr.email}/>

                    {/* Password with strength */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Mat khau</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                        <input type={showRegPw ? 'text' : 'password'} placeholder="toi-thieu-6-ky-tu"
                          className={`w-full bg-gray-800/80 border rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${
                            regErr.pw ? 'border-red-600' : 'border-gray-700 focus:border-indigo-500'
                          }`}
                          value={regPw} onChange={e => setRegPw(e.target.value)} autoComplete="new-password"/>
                        <button type="button" onClick={() => setShowRegPw(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {showRegPw
                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/></svg>
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          }
                        </button>
                      </div>
                      <StrengthBar pw={regPw}/>
                      {regErr.pw && <p className="mt-1 text-xs text-red-400">{regErr.pw}</p>}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Xac nhan mat khau</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        </div>
                        <input type={showRegPw ? 'text' : 'password'} placeholder="nhap lai mat khau"
                          className={`w-full bg-gray-800/80 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${
                            regErr.pw2 ? 'border-red-600'
                            : regPw2 && regPw2 === regPw ? 'border-green-600'
                            : 'border-gray-700 focus:border-indigo-500'
                          }`}
                          value={regPw2} onChange={e => setRegPw2(e.target.value)} autoComplete="new-password"/>
                        {regPw2 && regPw2 === regPw && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                          </div>
                        )}
                      </div>
                      {regErr.pw2 && <p className="mt-1 text-xs text-red-400">{regErr.pw2}</p>}
                    </div>

                    <button type="submit" disabled={anyLoading}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30">
                      {isLoading('register')
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Dang tao tai khoan...</>
                        : '✨ Tao tai khoan'
                      }
                    </button>

                    <p className="text-xs text-gray-600 text-center">
                      Bang cach dang ky, ban dong y voi dieu khoan su dung.
                    </p>
                  </form>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Da co tai khoan?{' '}
                    <button onClick={() => setTab('login')} className="text-indigo-400 hover:text-indigo-300 font-medium">Dang nhap</button>
                  </p>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-700 mt-6">
            <a href="/pub" className="hover:text-gray-500">← Xem trang public</a>
            {' · '}
            <a href="/" className="hover:text-gray-500">Admin API Key →</a>
          </p>
        </div>
      </div>
    </>
  );
}
