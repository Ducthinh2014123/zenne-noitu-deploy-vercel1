import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// ── Icons
const GoogleIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>);
const GithubIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>);
const FacebookIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>);
const DiscordIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.031.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>);
const SteamIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.523-4.524 4.523h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zm-5.39 17.747l-1.662-.688a2.54 2.54 0 0 0 1.248 1.346 2.541 2.541 0 0 0 1.948.066A2.535 2.535 0 0 0 9.41 16.03l-1.662-.688a.735.735 0 1 1 .573-1.354l1.717.71A2.542 2.542 0 0 0 6.59 17.747zm10.443-9.93a3.013 3.013 0 0 1-3.012 3.011 3.013 3.013 0 0 1-3.012-3.011 3.013 3.013 0 0 1 3.012-3.012 3.013 3.013 0 0 1 3.012 3.012zm-5.272-.006a2.256 2.256 0 1 0 4.512 0 2.256 2.256 0 0 0-4.512 0z"/></svg>);

const OAuthBtn = ({ icon, label, onClick, loading, disabled }) => (
  <button onClick={onClick} disabled={disabled || loading}
    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-gray-200 hover:text-white rounded-xl transition-all font-medium text-sm disabled:opacity-50 group">
    <span className="flex-shrink-0">{loading ? <div className="w-5 h-5 border-2 border-gray-500 border-t-white rounded-full animate-spin"/> : icon}</span>
    <span className="flex-1 text-left">{label}</span>
    <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
  </button>
);
const Divider = ({ text }) => (<div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-gray-700"/><span className="text-xs text-gray-500">{text}</span><div className="flex-1 h-px bg-gray-700"/></div>);
const EyeOpen = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;
const EyeOff  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/></svg>;
const PwStrength = ({ pw }) => { const n=[/.{8,}/,/[A-Z]/,/[0-9]/,/[^A-Za-z0-9]/].filter(r=>r.test(pw)).length; const c=['','bg-red-500','bg-orange-400','bg-yellow-400','bg-green-500'][n]; return pw?(<div className="flex items-center gap-1 mt-1.5">{[0,1,2,3].map(i=><div key={i} className={`h-1 flex-1 rounded-full ${i<n?c:'bg-gray-700'}`}/>)}<span className="text-xs text-gray-500 ml-1">{['','Yếu','TB','Tốt','Mạnh'][n]}</span></div>):null; };

export default function AuthLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { callbackUrl, error: qError, steam_token, steam_msg } = router.query;

  const [tab,       setTab]       = useState('login');
  const [loading,   setLoading]   = useState('');
  const [msg,       setMsg]       = useState({ type:'', text:'' });
  const [showAdmin, setShowAdmin] = useState(false);

  // Email login
  const [lEmail,  setLEmail]  = useState('');
  const [lPw,     setLPw]     = useState('');
  const [showLPw, setShowLPw] = useState(false);
  const [lErr,    setLErr]    = useState({});

  // 2FA step
  const [step2FA,   setStep2FA]   = useState(false);
  const [pending,   setPending]   = useState({ email:'', pw:'' });
  const [totpCode,  setTotpCode]  = useState('');

  // Register
  const [rName,  setRName]  = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPw,    setRPw]    = useState('');
  const [rPw2,   setRPw2]   = useState('');
  const [showRPw,setShowRPw]= useState(false);
  const [rErr,   setRErr]   = useState({});

  // Admin key
  const [aUrl,     setAUrl]     = useState('');
  const [aKey,     setAKey]     = useState('');
  const [aErr,     setAErr]     = useState('');
  const [aLoading, setALoading] = useState(false);

  useEffect(() => { setAUrl(localStorage.getItem('nt_api_url')||''); setAKey(localStorage.getItem('nt_api_key')||''); }, []);

  // Redirect khi da login
  useEffect(() => {
    if (status === 'authenticated') router.push(callbackUrl||(session?.user?.isAdmin?'/pending':'/pub'));
  }, [status, session, router, callbackUrl]);

  // Xu ly loi tu URL
  useEffect(() => {
    if (!router.isReady) return;
    if (qError === 'Needs2FA') { setStep2FA(true); return; }
    if (steam_msg) { setMsg({ type:'error', text: `Steam: ${steam_msg}` }); return; }
    const errMap = {
      Invalid2FA: 'Mã OTP sai.',
      OAuthSignin: 'Lỗi OAuth.', OAuthCallback: 'Lỗi OAuth.',
      OAuthAccountNotLinked: 'Email đã dùng với phương thức khác.',
      CredentialsSignin: 'Email hoặc mật khẩu không đúng.',
      SteamError: 'Đăng nhập Steam thất bại.',
      Default: 'Đã xảy ra lỗi.',
    };
    if (qError) setMsg({ type:'error', text: errMap[qError]||errMap.Default });
  }, [router.isReady, qError, steam_msg]);

  // Auto sign-in sau Steam callback
  useEffect(() => {
    if (!steam_token || status !== 'unauthenticated') return;
    setLoading('steam');
    setMsg({ type:'info', text: '🎮 Đang xác thực Steam...' });
    signIn('credentials', { steamToken: steam_token, redirect: false }).then(res => {
      setLoading('');
      if (!res?.ok || res?.error) setMsg({ type:'error', text: 'Xác thực Steam thất bại. Thử lại.' });
    });
  }, [steam_token, status]);

  const oAuth = async (p) => { setLoading(p); setMsg({type:'',text:''}); await signIn(p, { callbackUrl: callbackUrl||'/pub' }); };
  const goSteam = () => { setLoading('steam'); window.location.href = '/api/auth/steam-login'; };

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
      setMsg({type:'success',text:'✅ Đăng ký thành công! Đang đăng nhập...'});
      await signIn('credentials',{email:rEmail,password:rPw,redirect:false});
    } catch { setMsg({type:'error',text:'Lỗi kết nối server.'}); }
    setLoading('');
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
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-white">Xác thực 2 bước</h1>
            <p className="text-gray-400 text-sm mt-1">{pending.email}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            {msg.text && <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-400 text-sm">{msg.text}</div>}
            <p className="text-sm text-gray-400 mb-5">Mở <b className="text-white">Google Authenticator</b> / <b className="text-white">Authy</b> và nhập mã 6 chữ số:</p>
            <form onSubmit={do2FA} className="space-y-4">
              <input type="text" inputMode="numeric" maxLength={6} placeholder="000000"
                autoFocus autoComplete="one-time-code"
                value={totpCode} onChange={e=>setTotpCode(e.target.value.replace(/\D/g,''))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white text-center text-3xl font-mono tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:border-indigo-500"/>
              <button type="submit" disabled={any || totpCode.length!==6}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                {loading==='totp'?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Xác nhận...</>:'✅ Xác nhận'}
              </button>
              <button type="button" onClick={()=>{setStep2FA(false);setPending({email:'',pw:''});setTotpCode('');setMsg({type:'',text:''});}}
                className="w-full py-2.5 text-gray-500 hover:text-gray-300 text-sm">← Quay lại đăng nhập</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );

  // ═══ MAIN LOGIN PAGE ═══
  return (
    <>
      <Head><title>Đăng nhập — Nối Từ Bot</title></Head>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4"
        style={{backgroundImage:'radial-gradient(ellipse at top,rgba(99,102,241,.1) 0%,transparent 55%)'}}>
        <div className="w-full max-w-md">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-4xl mb-3 bg-indigo-600/15 border border-indigo-500/25 shadow-lg">🐟</div>
            <h1 className="text-2xl font-bold text-white">Nối Từ Bot</h1>
            <p className="text-gray-500 text-sm mt-0.5">Đăng nhập để tiếp tục</p>
          </div>

          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              {[['login','🔑 Đăng nhập'],['register','✨ Đăng ký']].map(([k,l])=>(
                <button key={k} onClick={()=>{setTab(k);setMsg({type:'',text:''})}}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${tab===k?'text-white border-indigo-500 bg-indigo-500/5':'text-gray-500 border-transparent hover:text-gray-300'}`}>{l}</button>
              ))}
            </div>

            <div className="p-6">
              {/* Alert */}
              {msg.text && (
                <div className={`flex gap-2 items-start p-3.5 rounded-xl text-sm mb-5 border ${
                  msg.type==='success' ? 'bg-green-900/30 border-green-700/50 text-green-400' :
                  msg.type==='info'    ? 'bg-indigo-900/30 border-indigo-700/50 text-indigo-300' :
                                         'bg-red-900/30 border-red-700/50 text-red-400'
                }`}>
                  <span>{msg.type==='success'?'✅':msg.type==='info'?'ℹ️':'⚠️'}</span>
                  <span>{msg.text}</span>
                </div>
              )}

              {tab==='login' && (
                <>
                  {/* OAuth buttons */}
                  <div className="space-y-2.5">
                    <OAuthBtn icon={<GoogleIcon/>}   label="Tiếp tục với Google"   loading={loading==='google'}   disabled={any&&loading!=='google'}   onClick={()=>oAuth('google')}/>
                    <OAuthBtn icon={<GithubIcon/>}   label="Tiếp tục với GitHub"   loading={loading==='github'}   disabled={any&&loading!=='github'}   onClick={()=>oAuth('github')}/>
                    <OAuthBtn icon={<FacebookIcon/>} label="Tiếp tục với Facebook" loading={loading==='facebook'} disabled={any&&loading!=='facebook'} onClick={()=>oAuth('facebook')}/>
                    <OAuthBtn icon={<DiscordIcon/>}  label="Tiếp tục với Discord"  loading={loading==='discord'}  disabled={any&&loading!=='discord'}  onClick={()=>oAuth('discord')}/>
                    <OAuthBtn icon={<SteamIcon/>}    label="Tiếp tục với Steam"    loading={loading==='steam'}    disabled={any&&loading!=='steam'}    onClick={goSteam}/>
                  </div>

                  <Divider text="hoặc đăng nhập bằng email"/>

                  <form onSubmit={doLogin} className="space-y-4" noValidate>
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
                        <input type="email" placeholder="ban@email.com" autoComplete="email"
                          className={`w-full bg-gray-800 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${lErr.email?'border-red-600':'border-gray-700 focus:border-indigo-500'}`}
                          value={lEmail} onChange={e=>setLEmail(e.target.value)}/>
                      </div>
                      {lErr.email && <p className="mt-1 text-xs text-red-400">{lErr.email}</p>}
                    </div>
                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mật khẩu</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>
                        <input type={showLPw?'text':'password'} placeholder="••••••••" autoComplete="current-password"
                          className={`w-full bg-gray-800 border rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${lErr.pw?'border-red-600':'border-gray-700 focus:border-indigo-500'}`}
                          value={lPw} onChange={e=>setLPw(e.target.value)}/>
                        <button type="button" onClick={()=>setShowLPw(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showLPw?<EyeOff/>:<EyeOpen/>}</button>
                      </div>
                      {lErr.pw && <p className="mt-1 text-xs text-red-400">{lErr.pw}</p>}
                    </div>
                    <button type="submit" disabled={any}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30">
                      {loading==='creds'?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang đăng nhập...</>:'🚀 Đăng nhập'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-500 mt-5">Chưa có tài khoản?{' '}<button onClick={()=>setTab('register')} className="text-indigo-400 hover:text-indigo-300 font-medium">Đăng ký ngay →</button></p>
                </>
              )}

              {tab==='register' && (
                <>
                  {/* Quick OAuth register */}
                  <p className="text-xs text-gray-500 text-center mb-2">Đăng ký nhanh bằng</p>
                  <div className="grid grid-cols-5 gap-2 mb-1">
                    {[['google',<GoogleIcon/>],['github',<GithubIcon/>],['facebook',<FacebookIcon/>],['discord',<DiscordIcon/>],['steam',null]].map(([p,ic])=>(
                      <button key={p} onClick={p==='steam'?goSteam:()=>oAuth(p)} disabled={any}
                        title={'Đăng nhập với '+p}
                        className="flex items-center justify-center py-2.5 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-500 hover:bg-gray-700 disabled:opacity-50">
                        {p==='steam'?<SteamIcon/>:ic}
                      </button>
                    ))}
                  </div>

                  <Divider text="hoặc đăng ký bằng email"/>

                  <form onSubmit={doRegister} className="space-y-4" noValidate>
                    {/* Username */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tên đăng nhập</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>
                        <input type="text" placeholder="noitufan123" autoComplete="username" minLength={3} maxLength={30}
                          className={`w-full bg-gray-800 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${rErr.name?'border-red-600':'border-gray-700 focus:border-indigo-500'}`}
                          value={rName} onChange={e=>setRName(e.target.value)}/>
                      </div>
                      {rErr.name && <p className="mt-1 text-xs text-red-400">{rErr.name}</p>}
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
                        <input type="email" placeholder="ban@email.com" autoComplete="email"
                          className={`w-full bg-gray-800 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${rErr.email?'border-red-600':'border-gray-700 focus:border-indigo-500'}`}
                          value={rEmail} onChange={e=>setREmail(e.target.value)}/>
                      </div>
                      {rErr.email && <p className="mt-1 text-xs text-red-400">{rErr.email}</p>}
                    </div>
                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mật khẩu</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>
                        <input type={showRPw?'text':'password'} placeholder="tối thiểu 6 ký tự" autoComplete="new-password"
                          className={`w-full bg-gray-800 border rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${rErr.pw?'border-red-600':'border-gray-700 focus:border-indigo-500'}`}
                          value={rPw} onChange={e=>setRPw(e.target.value)}/>
                        <button type="button" onClick={()=>setShowRPw(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showRPw?<EyeOff/>:<EyeOpen/>}</button>
                      </div>
                      <PwStrength pw={rPw}/>
                      {rErr.pw && <p className="mt-1 text-xs text-red-400">{rErr.pw}</p>}
                    </div>
                    {/* Confirm password */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Xác nhận mật khẩu</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                        <input type={showRPw?'text':'password'} placeholder="nhập lại mật khẩu" autoComplete="new-password"
                          className={`w-full bg-gray-800 border rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${rErr.pw2?'border-red-600':rPw2&&rPw2===rPw?'border-green-600':'border-gray-700 focus:border-indigo-500'}`}
                          value={rPw2} onChange={e=>setRPw2(e.target.value)}/>
                        {rPw2&&rPw2===rPw&&<div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg></div>}
                      </div>
                      {rErr.pw2 && <p className="mt-1 text-xs text-red-400">{rErr.pw2}</p>}
                    </div>
                    <button type="submit" disabled={any}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                      {loading==='reg'?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang tạo...</>:'✨ Tạo tài khoản'}
                    </button>
                  </form>
                  <p className="text-center text-sm text-gray-500 mt-4">Đã có tài khoản?{' '}<button onClick={()=>setTab('login')} className="text-indigo-400 hover:text-indigo-300 font-medium">Đăng nhập</button></p>
                </>
              )}

              {/* Admin API Key */}
              <div className="mt-6 border-t border-gray-800 pt-4">
                <button onClick={()=>setShowAdmin(s=>!s)}
                  className="w-full flex items-center justify-between text-xs text-gray-600 hover:text-gray-400">
                  <span>🔒 Admin — đăng nhập bằng API Key</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${showAdmin?'rotate-180':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {showAdmin && (
                  <form onSubmit={doAdminLogin} className="mt-3 space-y-3">
                    {aErr && <div className="p-2.5 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-xs">{aErr}</div>}
                    <input type="url" placeholder="API URL (https://...)" required value={aUrl} onChange={e=>setAUrl(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"/>
                    <input type="password" placeholder="API Key" required value={aKey} onChange={e=>setAKey(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"/>
                    <button type="submit" disabled={aLoading}
                      className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-60 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2">
                      {aLoading?<><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang kết nối...</>:'🚪 Vào Admin Dashboard'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-700 mt-5"><a href="/pub" className="hover:text-gray-500">← Trang public</a></p>
        </div>
      </div>
    </>
  );
}
