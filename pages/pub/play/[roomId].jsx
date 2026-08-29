import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import PubLayout from '../../../components/PubLayout';
import { getWsUrl, pubApi } from '../../../lib/pubApi';

export default function GameRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const { data: session, status: authStatus } = useSession();
  const wsRef    = useRef(null);
  const timerRef = useRef(null);
  const logRef   = useRef(null);
  const inputRef = useRef(null);

  const [phase, setPhase]       = useState('name');   // name|waiting|playing|ended
  const [myName, setMyName]     = useState('');
  const [isHost, setIsHost]     = useState(false);
  const [gs, setGs]             = useState(null);     // game state
  const [wordInput, setWord]    = useState('');
  const [log, setLog]           = useState([]);
  const [timer, setTimer]       = useState(0);
  const [timeLimit, setTL]      = useState(30);
  const [connected, setConn]    = useState(false);
  const [flash, setFlash]       = useState(null);
  const [copyOk, setCopyOk]     = useState(false);
  const [error, setError]       = useState('');
  const [checking, setChecking] = useState(false);

  const addLog = useCallback((text, ok=true) => {
    setLog(prev => [...prev.slice(-99), { text, ok }]);
    setTimeout(() => logRef.current?.scrollTo(0, 9999), 40);
  }, []);

  const flash_ = useCallback((msg, ok=true) => {
    setFlash({ msg, ok }); setTimeout(() => setFlash(null), 2500);
  }, []);

  const startTick = useCallback((limit) => {
    clearInterval(timerRef.current); setTimer(limit);
    timerRef.current = setInterval(() => setTimer(t => { if (t<=1){clearInterval(timerRef.current);return 0;} return t-1; }), 1000);
  }, []);

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg));
  }, []);

  const connect = useCallback(async (name) => {
    const wsUrl = getWsUrl(roomId);
    if (!wsUrl) { setError('Chua co API URL. Vao trang Admin dang nhap truoc.'); return; }
    let token;
    try {
      const t = await pubApi.gameToken();
      token = t.token;
    } catch (e) { setError(e.message || 'Ban can dang nhap de choi online.'); return; }
    const ws = new WebSocket(wsUrl); wsRef.current = ws;
    ws.onopen = () => { setConn(true); ws.send(JSON.stringify({ type:'join', name, token })); };
    ws.onclose = () => { setConn(false); addLog('Mat ket noi.', false); };
    ws.onerror = () => setError('Loi WebSocket — kiem tra CF Worker da cap nhat chua.');
    ws.onmessage = (e) => {
      let d; try { d = JSON.parse(e.data); } catch { return; }
      const t = d.type;
      if (t==='joined') {
        setMyName(name); setIsHost(d.is_host); setTL(d.time_limit||30);
        setPhase(d.state==='playing'?'playing':'waiting'); setGs(d);
        addLog('Vao phong thanh cong la ' + name + (d.is_host?' (Host)':''));
      } else if (t==='state') {
        setGs(d);
      } else if (t==='game_start') {
        setGs(d); setPhase('playing'); startTick(d.time_limit||30);
        addLog('Game bat dau! Tu dau: "' + d.current_word + '"');
      } else if (t==='word_accepted') {
        setChecking(false);
        setGs(prev=>prev?({...prev,current_word:d.word,last_char:d.word.slice(-1)}):prev);
        startTick(timeLimit); addLog(d.player + ': ' + d.word + ' (+' + d.score + ')');
      } else if (t==='checking') {
        setChecking(true);
      } else if (t==='word_invalid') {
        setChecking(false);
        flash_('Tu "' + d.word + '" khong ton tai trong tu dien!', false);
        addLog(d.player + ' nhap tu khong hop le: "' + d.word + '" \u2192 mat mang (con ' + d.lives + ')', false);
      } else if (t==='word_used') {
        setChecking(false);
        flash_('Tu "' + d.word + '" da dung roi!', false);
        addLog(d.player + ' dung tu lap → mat mang (con ' + d.lives + ')', false);
      } else if (t==='timeout') {
        addLog(d.player + ' het gio! (con ' + d.lives + ' mang)', false);
      } else if (t==='eliminated') {
        addLog(d.player + ' bi loai!', false);
      } else if (t==='player_joined') {
        addLog(d.name + ' da vao phong.');
      } else if (t==='player_left') {
        addLog(d.name + ' da roi phong.', false);
      } else if (t==='new_host') {
        addLog(d.name + ' la Host moi.');
        if (d.name === myName) { setIsHost(true); flash_('Ban la Host moi!'); }
      } else if (t==='game_end') {
        clearInterval(timerRef.current); setPhase('ended');
        setGs(prev=>({...prev,winner:d.winner,scores:d.scores,state:'ended'}));
        addLog('Ket thuc! Nguoi thang: ' + (d.winner||'Hoa'));
      } else if (t==='restarted') {
        setPhase('waiting'); clearInterval(timerRef.current); setTimer(0);
        addLog('Game khoi dong lai.');
      } else if (t==='error') {
        setChecking(false);
        flash_(d.msg, false);
      }
    };
  }, [roomId, addLog, flash_, startTick, timeLimit, myName]);

  useEffect(() => () => { clearInterval(timerRef.current); wsRef.current?.close(); }, []);

  if (!roomId) return <PubLayout title="Game"><p className="text-gray-500 animate-pulse">Loading...</p></PubLayout>;

  const isMyTurn = gs?.current_turn === myName && phase==='playing';
  const pct = timeLimit>0 ? (timer/timeLimit)*100 : 0;
  const timerCls = timer>10 ? 'bg-green-500' : timer>5 ? 'bg-yellow-500' : 'bg-red-500';

  if (authStatus === 'loading') return (
    <PubLayout title="Game"><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"/></div></PubLayout>
  );

  if (authStatus !== 'authenticated') return (
    <PubLayout title="Vao Phong">
      <div className="max-w-sm mx-auto mt-10 bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-lg font-bold text-white mb-2">Cần đăng nhập để vào phòng</h2>
        <p className="text-gray-500 text-sm mb-6">Đăng nhập để điểm của bạn được ghi vào bảng xếp hạng chung.</p>
        <button onClick={()=>router.push('/auth/login?callbackUrl=' + encodeURIComponent('/pub/play/' + roomId))}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg">
          🔑 Đăng nhập
        </button>
      </div>
    </PubLayout>
  );

  // Name screen — ten lay tu tai khoan da dang nhap, khong cho tu go de dam bao gan dung danh tinh voi bang xep hang.
  if (phase==='name') {
    const suggestedName = session?.user?.username || session?.user?.name || 'Nguoi choi';
    return (
      <PubLayout title="Vao Phong">
        {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>}
        <div className="max-w-sm mx-auto mt-10">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎮</div>
              <h2 className="text-xl font-bold text-white">Noi Tu Online</h2>
              <p className="text-gray-500 text-sm mt-1">Phong: <code className="text-indigo-400 font-mono">{roomId}</code></p>
            </div>
            <div className="text-center mb-5 p-3 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-500">Vào phong với tài khoản</div>
              <div className="text-white font-semibold">{suggestedName}</div>
            </div>
            <button onClick={()=>connect(suggestedName)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-lg text-lg">
              Vao phong!
            </button>
          </div>
        </div>
      </PubLayout>
    );
  }

  return (
    <PubLayout title={'Phong ' + roomId}>
      {flash && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-lg border ${
          flash.ok ? 'bg-green-900 border-green-600 text-green-200' : 'bg-red-900 border-red-600 text-red-200'
        }`}>{flash.msg}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Players */}
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm">Nguoi choi ({gs?.players?.length||0})</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${connected?'bg-green-900/50 text-green-400':'bg-red-900/50 text-red-400'}`}>
                {connected?'Online':'Offline'}
              </span>
            </div>
            <div className="space-y-2">
              {gs?.players?.map((p,i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${
                  p.name===gs.current_turn&&phase==='playing' ? 'bg-indigo-900/50 border border-indigo-600'
                  : p.name===myName ? 'bg-gray-800' : 'bg-gray-800/40'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {p.name===gs.current_turn&&phase==='playing'&&<span className="animate-pulse text-xs">▶️</span>}
                    <span className="text-sm text-white truncate">{p.name}</span>
                    {p.name===myName&&<span className="text-xs text-gray-500">(ban)</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs">{'❤️'.repeat(p.lives)}{'💔'.repeat(Math.max(0,3-p.lives))}</span>
                    <span className="text-sm font-bold text-indigo-400">{p.score}pt</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.href);setCopyOk(true);setTimeout(()=>setCopyOk(false),2000);}}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-400">
            {copyOk?'Copied!':'Copy link moi'}
          </button>
        </div>

        {/* Game area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Timer */}
          {phase==='playing'&&(
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{gs?.current_turn} dang di</span>
                <span className={timer<=5?'text-red-400 font-bold':''}>{timer}s</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className={`${timerCls} h-2 rounded-full transition-all duration-1000`} style={{width:pct+'%'}}/>
              </div>
            </div>
          )}

          {/* Current word */}
          {phase==='playing'&&(
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 text-center">
              <div className="text-xs text-gray-500 mb-1">Tu hien tai</div>
              <div className="text-4xl font-bold text-white mb-2 tracking-wide">{gs?.current_word||'...'}</div>
              <div className="text-sm text-indigo-400">Bat dau bang: <strong className="text-xl">"{gs?.last_char}"</strong></div>
            </div>
          )}

          {/* Waiting */}
          {phase==='waiting'&&(
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <h2 className="text-lg font-semibold text-white mb-1">Cho bat dau...</h2>
              <p className="text-gray-500 text-sm mb-5">{gs?.players?.length||0} nguoi da vao phong.</p>
              {isHost&&(
                <button onClick={()=>send({type:'start'})}
                  className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg text-lg">
                  Bat dau game!
                </button>
              )}
              {!isHost&&<p className="text-gray-600 text-sm">Doi host bat dau...</p>}
            </div>
          )}

          {/* Ended */}
          {phase==='ended'&&(
            <div className="bg-gray-900 border border-indigo-700 rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-4">{gs?.winner?gs.winner+' chien thang!':'Ket thuc!'}</h2>
              <div className="space-y-2 mb-4">
                {gs?.scores?.map((p,i)=>(
                  <div key={i} className="flex justify-between px-4 py-2 bg-gray-800 rounded-lg">
                    <span className="text-white">{i===0?'🥇 ':i===1?'🥈 ':i===2?'🥉 ':`${i+1}. `}{p.name}</span>
                    <span className="text-indigo-400 font-bold">{p.score} diem</span>
                  </div>
                ))}
              </div>
              {isHost&&<button onClick={()=>send({type:'restart'})} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">Choi lai</button>}
            </div>
          )}

          {/* Input */}
          {phase==='playing'&&(
            <form onSubmit={e=>{e.preventDefault();const w=wordInput.trim();if(w&&!checking){send({type:'word',word:w});setWord('');inputRef.current?.focus();}}} className="flex gap-2">
              <input ref={inputRef} autoFocus
                className={`flex-1 bg-gray-800 border rounded-lg px-4 py-3 text-white text-lg placeholder-gray-600 focus:outline-none transition-colors ${
                  isMyTurn&&!checking?'border-indigo-500':'border-gray-700 opacity-60'
                }`}
                placeholder={isMyTurn?(checking?'Dang kiem tra tu...':`Bat dau bang "${gs?.last_char}"...`):'Chua den luot ban'}
                disabled={!isMyTurn||checking} value={wordInput} onChange={e=>setWord(e.target.value)}/>
              <button type="submit" disabled={!isMyTurn||!wordInput.trim()||checking}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-lg text-xl">
                {checking?'⏳':'➔'}
              </button>
            </form>
          )}

          {/* Log */}
          <div ref={logRef} className="h-44 overflow-y-auto bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-1 font-mono text-xs">
            {log.length===0&&<p className="text-gray-700 text-center py-4">Nhat ky game hien o day...</p>}
            {log.map((l,i)=>(<div key={i} className={l.ok?'text-green-400':'text-red-400'}>{l.text}</div>))}
          </div>
        </div>
      </div>
    </PubLayout>
  );
}
