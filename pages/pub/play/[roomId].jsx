import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import PubLayout from '../../../components/PubLayout';
import { getWsUrl, pubApi } from '../../../lib/pubApi';
import { useI18n } from '../../../lib/i18n';
import { IconLock, IconLogIn, IconGamepad, IconPlay, IconUsers, IconArrowRight, IconHeart, IconHeartOff, IconCopy, IconCheck, IconCheckCircle, IconAlertTriangle, IconClock, IconTrophy, IconMedal, IconLightbulb } from '../../../components/icons';

export default function GameRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const { data: session, status: authStatus } = useSession();
  const { t } = useI18n();
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
  const [hint, setHint]         = useState(null); // { syllable, can_continue, words }
  const [hintLoading, setHintLoading] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);

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
        if (typeof d.hints_left === 'number') setHintsLeft(d.hints_left);
        addLog('Vao phong thanh cong la ' + name + (d.is_host?' (Host)':''));
      } else if (t==='state') {
        setGs(d);
      } else if (t==='game_start') {
        setGs(d); setPhase('playing'); startTick(d.time_limit||30); setHint(null);
        addLog('Game bat dau! Tu dau: "' + d.current_word + '"');
      } else if (t==='word_accepted') {
        setChecking(false);
        setHint(null);
        // Dung am tiet cuoi cung (tach theo khoang trang), khong phai ky tu cuoi cung,
        // de khop voi cach server tinh last_char va tranh hien thi sai luc co luc khong.
        const parts = d.word.trim().split(/\s+/);
        setGs(prev=>prev?({...prev,current_word:d.word,last_char:parts[parts.length-1]}):prev);
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
        setHintsLeft(3); setHint(null);
        addLog('Game khoi dong lai.');
      } else if (t==='hint_result') {
        setHintLoading(false);
        setHint({ syllable: d.syllable, can_continue: d.can_continue, words: d.words||[] });
        if (typeof d.hints_left === 'number') setHintsLeft(d.hints_left);
      } else if (t==='hint_limit_reached') {
        setHintLoading(false);
        setHintsLeft(0);
        flash_('Ban da dung het 3 luot goi y roi!', false);
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
        <IconLock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">{t('need_login_title')}</h2>
        <p className="text-gray-500 text-sm mb-6">{t('need_login_desc')}</p>
        <button onClick={()=>router.push('/auth/login?callbackUrl=' + encodeURIComponent('/pub/play/' + roomId))}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg">
          <IconLogIn className="w-4 h-4" /> {t('login_button')}
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
              <IconGamepad className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-white">Noi Tu Online</h2>
              <p className="text-gray-500 text-sm mt-1">Phong: <code className="text-indigo-400 font-mono">{roomId}</code></p>
            </div>
            <div className="text-center mb-5 p-3 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-500">Vào phong với tài khoản</div>
              <div className="text-white font-semibold">{suggestedName}</div>
            </div>
            <button onClick={()=>connect(suggestedName)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-lg text-lg">
              <IconPlay className="w-5 h-5" /> {t('enter_room_button')}
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
              <h3 className="flex items-center gap-1.5 font-bold text-white text-sm"><IconUsers className="w-4 h-4" /> {t('players_label')} ({gs?.players?.length||0})</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${connected?'bg-green-900/50 text-green-400':'bg-red-900/50 text-red-400'}`}>
                {connected?t('online'):t('offline')}
              </span>
            </div>
            <div className="space-y-2">
              {gs?.players?.map((p,i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${
                  p.name===gs.current_turn&&phase==='playing' ? 'bg-indigo-900/50 border border-indigo-600'
                  : p.name===myName ? 'bg-gray-800' : 'bg-gray-800/40'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {p.name===gs.current_turn&&phase==='playing'&&<IconArrowRight className="w-3.5 h-3.5 text-indigo-400 animate-pulse flex-shrink-0" />}
                    <span className="text-sm text-white truncate">{p.name}</span>
                    {p.name===myName&&<span className="text-xs text-gray-500">(ban)</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-0.5 text-red-400">
                      {Array.from({length:p.lives}).map((_,li)=><IconHeart key={'h'+li} className="w-3.5 h-3.5" />)}
                      {Array.from({length:Math.max(0,3-p.lives)}).map((_,li)=><IconHeartOff key={'e'+li} className="w-3.5 h-3.5 text-gray-600" />)}
                    </span>
                    <span className="text-sm font-bold text-indigo-400">{p.score}pt</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.href);setCopyOk(true);setTimeout(()=>setCopyOk(false),2000);}}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-400">
            {copyOk?<IconCheck className="w-4 h-4 text-green-400" />:<IconCopy className="w-4 h-4" />} {copyOk?t('copied'):t('copy_link')}
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
              <div className="text-xs text-gray-500 mb-1">{t('current_word_label')}</div>
              <div className="text-4xl font-bold text-white mb-2 tracking-wide">{gs?.current_word||'...'}</div>
              <div className="text-sm text-indigo-400">{t('start_with_label')}: <strong className="text-xl">"{gs?.last_char}"</strong></div>
              {hint && hint.syllable===gs?.last_char && (
                hint.can_continue ? (
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-green-400">
                    <IconCheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> Còn nối được: {hint.words.map((w,i)=>(<code key={i} className="mx-1 px-1.5 py-0.5 bg-green-900/40 rounded">{w}</code>))}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-yellow-400"><IconAlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Chưa tìm thấy từ nào nối tiếp được — có thể sẩp bị tu!</div>
                )
              )}
            </div>
          )}

          {/* Waiting */}
          {phase==='waiting'&&(
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <IconClock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <h2 className="text-lg font-semibold text-white mb-1">{t('waiting_title')}</h2>
              <p className="text-gray-500 text-sm mb-5">{gs?.players?.length||0} nguoi da vao phong.</p>
              {isHost&&(
                <button onClick={()=>send({type:'start'})}
                  className="flex items-center gap-2 mx-auto px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg text-lg">
                  <IconPlay className="w-4 h-4" /> {t('start_game_button')}
                </button>
              )}
              {!isHost&&<p className="text-gray-600 text-sm">{t('waiting_host')}</p>}
            </div>
          )}

          {/* Ended */}
          {phase==='ended'&&(
            <div className="bg-gray-900 border border-indigo-700 rounded-xl p-6 text-center">
              <IconTrophy className="w-9 h-9 text-yellow-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white mb-4">{gs?.winner?gs.winner+' '+t('winner_suffix'):t('ended_title')}</h2>
              <div className="space-y-2 mb-4">
                {gs?.scores?.map((p,i)=>(
                  <div key={i} className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-lg">
                    <span className="flex items-center gap-1.5 text-white">
                      {i<3 ? <IconMedal className={`w-4 h-4 ${i===0?'text-yellow-400':i===1?'text-gray-300':'text-orange-400'}`} /> : <span className="text-gray-500 text-sm">{i+1}.</span>}
                      {p.name}
                    </span>
                    <span className="text-indigo-400 font-bold">{p.score} diem</span>
                  </div>
                ))}
              </div>
              {isHost&&<button onClick={()=>send({type:'restart'})} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">{t('play_again')}</button>}
            </div>
          )}

          {/* Input */}
          {phase==='playing'&&(
            <form onSubmit={e=>{e.preventDefault();const w=wordInput.trim();if(w&&!checking){send({type:'word',word:w});setWord('');inputRef.current?.focus();}}} className="flex gap-2">
              <input ref={inputRef} autoFocus
                className={`flex-1 bg-gray-800 border rounded-lg px-4 py-3 text-white text-lg placeholder-gray-600 focus:outline-none transition-colors ${
                  isMyTurn&&!checking?'border-indigo-500':'border-gray-700 opacity-60'
                }`}
                placeholder={isMyTurn?(checking?t('checking_word'):`${t('start_with_label')} "${gs?.last_char}"...`):t('not_your_turn')}
                disabled={!isMyTurn||checking} value={wordInput} onChange={e=>setWord(e.target.value)}
                onPaste={e=>e.preventDefault()}/>
              <button type="submit" disabled={!isMyTurn||!wordInput.trim()||checking}
                className="flex items-center justify-center px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-lg">
                {checking?<IconClock className="w-5 h-5 animate-pulse" />:<IconArrowRight className="w-5 h-5" />}
              </button>
              <button type="button" title={hintsLeft<=0?'Ban da dung het 3 luot goi y':t('hint_title')}
                disabled={hintLoading||checking||!gs?.last_char||hintsLeft<=0}
                onClick={()=>{setHintLoading(true);setHint(null);send({type:'hint'});}}
                className="flex items-center gap-1.5 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 border border-gray-700 text-white rounded-lg text-sm">
                {hintLoading?<IconClock className="w-4 h-4 animate-pulse" />:<IconLightbulb className="w-4 h-4" />} {t('hint_button')} ({hintsLeft})
              </button>
            </form>
          )}

          {/* Log */}
          <div ref={logRef} className="h-44 overflow-y-auto bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-1 font-mono text-xs">
            {log.length===0&&<p className="text-gray-700 text-center py-4">{t('log_empty')}</p>}
            {log.map((l,i)=>(<div key={i} className={l.ok?'text-green-400':'text-red-400'}>{l.text}</div>))}
          </div>
        </div>
      </div>
    </PubLayout>
  );
}
