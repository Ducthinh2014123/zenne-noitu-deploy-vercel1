import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import PubLayout from '../../../components/PubLayout';
import { getWsUrl } from '../../../lib/pubApi';

function LivesBar({ lives, max = 3 }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-sm ${i < lives ? '❤️' : '💔'}`} />
      ))}
    </span>
  );
}

export default function GameRoom() {
  const router = useRouter();
  const { roomId } = router.query;

  const wsRef      = useRef(null);
  const inputRef   = useRef(null);
  const logRef     = useRef(null);
  const timerRef   = useRef(null);

  const [phase, setPhase]     = useState('name');   // name | waiting | playing | ended
  const [myName, setMyName]   = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isHost, setIsHost]   = useState(false);
  const [state, setState]     = useState(null);     // game state from server
  const [wordInput, setWordInput] = useState('');
  const [log, setLog]         = useState([]);
  const [timer, setTimer]     = useState(0);
  const [timeLimit, setTimeLimit] = useState(30);
  const [connected, setConnected] = useState(false);
  const [error, setError]     = useState('');
  const [flash, setFlash]     = useState(null);    // { msg, ok }
  const [copyOk, setCopyOk]   = useState(false);

  const addLog = useCallback((entry) => {
    setLog(prev => [...prev.slice(-99), entry]);
    setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50);
  }, []);

  const showFlash = useCallback((msg, ok = true) => {
    setFlash({ msg, ok });
    setTimeout(() => setFlash(null), 2500);
  }, []);

  const startTimer = useCallback((limit) => {
    clearInterval(timerRef.current);
    setTimer(limit);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const connect = useCallback((name) => {
    const url = getWsUrl(roomId);
    if (!url) { setError('Chưa có API URL. Hãy đăng nhập Admin Dashboard trước.'); return; }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'join', name }));
    };

    ws.onmessage = (e) => {
      let data;
      try { data = JSON.parse(e.data); } catch { return; }
      const t = data.type;

      if (t === 'joined') {
        setMyName(name);
        setIsHost(data.is_host);
        setPhase(data.state === 'playing' ? 'playing' : 'waiting');
        setState(data);
        setTimeLimit(data.time_limit || 30);
        addLog({ text: `✅ Bạn đã vào phòng là ${name}${data.is_host ? ' (Host)' : ''}`, ok: true });
      } else if (t === 'state') {
        setState(data);
        if (data.state === 'playing') setPhase('playing');
      } else if (t === 'game_start') {
        setState(data);
        setPhase('playing');
        startTimer(data.time_limit || 30);
        addLog({ text: `🎮 Game bắt đầu! Từ đầu: “${data.current_word}”`, ok: true });
      } else if (t === 'word_accepted') {
        setState(prev => ({ ...prev, current_word: data.word, last_char: data.word.slice(-1) }));
        startTimer(timeLimit);
        addLog({ text: `✅ ${data.player}: ${data.word} (+${data.score})`, ok: true });
      } else if (t === 'word_used') {
        showFlash(`❌ Từ “${data.word}” đã dùng rồi!`, false);
        addLog({ text: `⚠️ ${data.player} dùng từ lặp → mất mạng (còn ${data.lives})`, ok: false });
      } else if (t === 'timeout') {
        addLog({ text: `⏰ ${data.player} hết giờ! (còn ${data.lives} mạng)`, ok: false });
      } else if (t === 'eliminated') {
        addLog({ text: `📍 ${data.player} bị loại!`, ok: false });
      } else if (t === 'player_joined') {
        addLog({ text: `➕ ${data.name} đã vào phòng (${data.count} người)`, ok: true });
        setState(prev => prev ? { ...prev } : null);
      } else if (t === 'player_left') {
        addLog({ text: `➖ ${data.name} đã rời phòng`, ok: false });
      } else if (t === 'new_host') {
        addLog({ text: `👑 ${data.name} trở thành Host mới`, ok: true });
        if (data.name === myName) { setIsHost(true); showFlash('👑 Bạn là Host mới!'); }
      } else if (t === 'game_end') {
        clearInterval(timerRef.current);
        setPhase('ended');
        addLog({ text: `🏆 Kết thúc! Người thắng: ${data.winner || 'Hòa'}`, ok: true });
        setState(prev => ({ ...prev, winner: data.winner, scores: data.scores, state: 'ended' }));
      } else if (t === 'restarted') {
        setPhase('waiting');
        clearInterval(timerRef.current);
        setTimer(0);
        addLog({ text: '🔄 Game được khởi động lại', ok: true });
      } else if (t === 'error') {
        showFlash(`❌ ${data.msg}`, false);
      }
    };

    ws.onclose = () => { setConnected(false); addLog({ text: '🔌 Mất kết nối', ok: false }); };
    ws.onerror = () => { setError('Lỗi kết nối WebSocket'); };
  }, [roomId, addLog, showFlash, startTimer, timeLimit, myName]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      wsRef.current?.close();
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    const n = nameInput.trim();
    if (!n) return;
    connect(n);
  };

  const handleWord = (e) => {
    e.preventDefault();
    const w = wordInput.trim();
    if (!w) return;
    send({ type: 'word', word: w });
    setWordInput('');
    inputRef.current?.focus();
  };

  const isMyTurn = state?.current_turn === myName && phase === 'playing';
  const pct = timeLimit > 0 ? (timer / timeLimit) * 100 : 0;
  const timerColor = timer > 10 ? 'bg-green-500' : timer > 5 ? 'bg-yellow-500' : 'bg-red-500';

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyOk(true); setTimeout(() => setCopyOk(false), 2000);
  };

  if (!roomId) return <PubLayout title="🎮 Game"><div className="animate-pulse text-gray-500">Loading...</div></PubLayout>;

  // NAME ENTRY
  if (phase === 'name') return (
    <PubLayout title="🎮 Vào Phòng">
      {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">⚠️ {error}</div>}
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎮</div>
            <h2 className="text-xl font-bold text-white">Nối Từ Online</h2>
            <p className="text-gray-500 text-sm mt-1">Phòng: <code className="text-indigo-400 font-mono">{roomId}</code></p>
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-lg placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              placeholder="Nhập tên của bạn"
              maxLength={20}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
            />
            <button type="submit" disabled={!nameInput.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors text-lg">
              🚀 Vào phòng!
            </button>
          </form>
        </div>
      </div>
    </PubLayout>
  );

  return (
    <PubLayout title={`🎮 Phòng ${roomId}`}>
      {/* Flash message */}
      {flash && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-lg border transition-all ${
          flash.ok ? 'bg-green-900 border-green-600 text-green-200' : 'bg-red-900 border-red-600 text-red-200'
        }`}>{flash.msg}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: Players */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm">👥 Người chơi ({state?.players?.length || 0})</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                connected ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
              }`}>{connected ? '⚡ Online' : '❌ Offline'}</span>
            </div>
            <div className="space-y-2">
              {state?.players?.map((p, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${
                  p.name === state.current_turn && phase === 'playing'
                    ? 'bg-indigo-900/50 border border-indigo-600'
                    : p.name === myName
                    ? 'bg-gray-800'
                    : 'bg-gray-800/50'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {p.name === state.current_turn && phase === 'playing' && (
                      <span className="text-xs animate-pulse">▶️</span>
                    )}
                    <span className="text-sm text-white truncate">{p.name}</span>
                    {p.name === myName && <span className="text-xs text-gray-500">(bạn)</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <LivesBar lives={p.lives} />
                    <span className="text-sm font-bold text-indigo-400">{p.score}pt</span>
                  </div>
                </div>
              ))}
              {(!state?.players || state.players.length === 0) && (
                <p className="text-gray-600 text-sm text-center py-2">Chưa có ai...</p>
              )}
            </div>
          </div>

          {/* Share link */}
          <button onClick={copyLink}
            className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-400 transition-colors">
            {copyOk ? '✅ Đã sao chép link!' : '🔗 Sao chép link mời'}
          </button>
        </div>

        {/* Center: Game */}
        <div className="lg:col-span-2 space-y-4">
          {/* Timer bar */}
          {phase === 'playing' && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>⏱️ {state?.current_turn} đang đi</span>
                <span className={timer <= 5 ? 'text-red-400 font-bold' : ''}>{timer}s</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className={`${timerColor} h-2 rounded-full transition-all duration-1000`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {/* Current word */}
          {phase === 'playing' && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 text-center">
              <div className="text-xs text-gray-500 mb-1">Từ hiện tại</div>
              <div className="text-4xl font-bold text-white mb-2 tracking-wide">
                {state?.current_word || '...'}
              </div>
              <div className="text-sm text-indigo-400">
                Từ tiếp theo phải bắt đầu bằng: <strong className="text-xl">“{state?.last_char}”</strong>
              </div>
            </div>
          )}

          {/* End screen */}
          {phase === 'ended' && (
            <div className="bg-gray-900 border border-indigo-700 rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {state?.winner ? `${state.winner} chiến thắng!` : 'Kết thúc!'}
              </h2>
              <div className="mt-4 space-y-2">
                {state?.scores?.map((p, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-2 bg-gray-800 rounded-lg">
                    <span className="text-white">{i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : `${i+1}. `}{p.name}</span>
                    <span className="text-indigo-400 font-bold">{p.score} điểm</span>
                  </div>
                ))}
              </div>
              {isHost && (
                <button onClick={() => send({ type: 'restart' })}
                  className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
                  🔄 Chơi lại
                </button>
              )}
            </div>
          )}

          {/* Waiting */}
          {phase === 'waiting' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <h2 className="text-lg font-semibold text-white mb-1">Chờ bắt đầu...</h2>
              <p className="text-gray-500 text-sm mb-4">{state?.players?.length || 0} người đã vào phòng.</p>
              {isHost && (
                <button onClick={() => send({ type: 'start', first_word: 'bắt đầu' })}
                  disabled={(state?.players?.length || 0) < 1}
                  className="px-8 py-3 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white font-semibold rounded-lg text-lg transition-colors">
                  ▶️ Bắt đầu game!
                </button>
              )}
              {!isHost && <p className="text-gray-600 text-sm">Đợi host bắt đầu...</p>}
            </div>
          )}

          {/* Word input */}
          {phase === 'playing' && (
            <form onSubmit={handleWord} className="flex gap-2">
              <input
                ref={inputRef}
                autoFocus
                className={`flex-1 bg-gray-800 border rounded-lg px-4 py-3 text-white text-lg placeholder-gray-600 focus:outline-none transition-colors ${
                  isMyTurn
                    ? 'border-indigo-500 focus:border-indigo-400'
                    : 'border-gray-700 opacity-60'
                }`}
                placeholder={isMyTurn ? `Bắt đầu bằng “${state?.last_char}”...` : 'Chưa đến lượt bạn'}
                disabled={!isMyTurn}
                value={wordInput}
                onChange={e => setWordInput(e.target.value)}
              />
              <button type="submit" disabled={!isMyTurn || !wordInput.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-lg text-xl transition-colors">
                ➔
              </button>
            </form>
          )}

          {/* Log */}
          <div ref={logRef}
            className="h-48 overflow-y-auto bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-1 font-mono text-xs">
            {log.length === 0 && <p className="text-gray-700 text-center py-4">Nhật ký game sẽ hiện ở đây...</p>}
            {log.map((entry, i) => (
              <div key={i} className={entry.ok ? 'text-green-400' : 'text-red-400'}>
                {entry.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PubLayout>
  );
}
