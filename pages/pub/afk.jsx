import { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import {
  IconClock, IconPartyPopper, IconRefresh, IconTrophy,
  IconAlertTriangle, IconCheckCircle, IconLogIn, IconRocket
} from '../../components/icons';

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return {
    hours: String(hrs).padStart(2, '0'),
    minutes: String(mins).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
    text: `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`,
  };
}

export default function AfkGame() {
  const { data: session, status: authStatus } = useSession();
  const [running, setRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [offlineGrace, setOfflineGrace] = useState(false);
  const [graceSecondsLeft, setGraceSecondsLeft] = useState(300);
  const [userTotalSeconds, setUserTotalSeconds] = useState(0);
  const [userPlays, setUserPlays] = useState(0);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const startTimestampRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const offlineTimestampRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Load user all-time stats from leaderboard
  const loadUserStats = useCallback(async () => {
    if (authStatus !== 'authenticated' || !session?.user?.id) return;
    try {
      const res = await pubApi.gameLeaderboard({ game: 'afk', limit: 100 });
      const currentUid = String(-Number(session.user.id));
      const entry = (res.data || []).find(r => String(r.user_id) === currentUid);
      if (entry) {
        setUserTotalSeconds(entry.best_score || 0);
        setUserPlays(entry.plays || 0);
      }
    } catch {
      // ignore
    }
  }, [authStatus, session]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // Handle Online / Offline Grace Period
  useEffect(() => {
    function handleOffline() {
      if (!running) return;
      setOfflineGrace(true);
      offlineTimestampRef.current = Date.now();
      setGraceSecondsLeft(300);
    }

    function handleOnline() {
      if (!running) return;
      setOfflineGrace(false);
      offlineTimestampRef.current = null;
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [running]);

  // Main ticking interval
  useEffect(() => {
    if (!running) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      if (!startTimestampRef.current) return;

      // Check offline grace countdown
      if (offlineTimestampRef.current) {
        const offElapsed = Math.floor((Date.now() - offlineTimestampRef.current) / 1000);
        const rem = Math.max(0, 300 - offElapsed);
        setGraceSecondsLeft(rem);
        if (rem <= 0) {
          // Grace period expired: stop session
          handleStop();
          return;
        }
      } else {
        const sec = Math.floor((Date.now() - startTimestampRef.current) / 1000);
        setElapsedSeconds(sec);
      }
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [running]);

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (!running) return;
    const { hours, minutes, seconds } = formatTime(elapsedSeconds);
    const originalTitle = document.title;
    document.title = `[${hours}:${minutes}:${seconds}] ⏳ Treo máy · Nối Từ Bot`;
    return () => {
      document.title = originalTitle;
    };
  }, [running, elapsedSeconds]);

  // Start AFK Session
  const handleStart = async () => {
    if (authStatus !== 'authenticated') return;
    setMsg({ type: '', text: '' });
    setSaving(true);
    try {
      const data = await pubApi.gameSessionStart('afk');
      sessionTokenRef.current = data.token;
      startTimestampRef.current = Date.now();
      setElapsedSeconds(0);
      setRunning(true);
      setOfflineGrace(false);
      setMsg({ type: 'success', text: 'Chế độ Treo máy đã BẬT! Giờ đang bắt đầu được tính.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Không thể bắt đầu phiên treo máy.' });
    } finally {
      setSaving(false);
    }
  };

  // Stop & Save AFK Session
  const handleStop = async () => {
    if (!running) return;
    setSaving(true);
    const totalSec = elapsedSeconds;
    const token = sessionTokenRef.current;

    // Reset local timer
    setRunning(false);
    setOfflineGrace(false);
    startTimestampRef.current = null;
    offlineTimestampRef.current = null;

    if (totalSec >= 5 && token && authStatus === 'authenticated') {
      try {
        await pubApi.submitGameScore('afk', totalSec, token);
        setMsg({
          type: 'success',
          text: `Đã lưu thành công phiên treo máy: +${formatTime(totalSec).text} vào bảng xếp hạng!`,
        });
        setUserTotalSeconds(prev => prev + totalSec);
        setUserPlays(p => p + 1);
        loadUserStats();
      } catch (e) {
        setMsg({ type: 'error', text: e.message || 'Không thể lưu thời gian phiên này.' });
      }
    } else if (totalSec < 5) {
      setMsg({ type: 'info', text: 'Phiên quá ngắn (dưới 5 giây), chưa được tính vào bảng xếp hạng.' });
    }
    setSaving(false);
  };

  const timeFmt = formatTime(elapsedSeconds);
  const totalFmt = formatTime(userTotalSeconds + (running ? elapsedSeconds : 0));

  if (authStatus !== 'authenticated') {
    return (
      <PubLayout title="Treo Máy (AFK Time)">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <IconClock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Đăng nhập để treo máy</h2>
          <p className="text-gray-400 text-sm mb-6">
            Bạn cần đăng nhập tài khoản để thời gian treo máy được lưu vĩnh viễn và cộng dồn vào bảng xếp hạng đua top.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff352d] hover:bg-[#e0261f] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-950/40"
          >
            <IconLogIn className="w-4 h-4" /> Đăng nhập ngay
          </Link>
        </div>
      </PubLayout>
    );
  }

  return (
    <PubLayout title="Treo Máy (AFK Time)">
      <div className="max-w-2xl mx-auto">
        {/* Header Description */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <IconClock className="w-6 h-6" />
              </span>
              Phòng Treo Máy (AFK Room)
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Cắm tab thư giãn, tích lũy thời gian online không giới hạn và đua top bảng xếp hạng cùng cộng đồng!
            </p>
          </div>
          <Link
            href="/pub/leaderboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-amber-400 hover:border-amber-500/40 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            <IconTrophy className="w-4 h-4" /> BXH AFK
          </Link>
        </div>

        {/* Alert Messages */}
        {msg.text && (
          <div
            className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm mb-5 border ${
              msg.type === 'success'
                ? 'bg-green-900/30 border-green-700/50 text-green-400'
                : msg.type === 'info'
                ? 'bg-amber-900/30 border-amber-700/50 text-amber-300'
                : 'bg-red-900/30 border-red-700/50 text-red-400'
            }`}
          >
            {msg.type === 'success' ? (
              <IconCheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : msg.type === 'info' ? (
              <IconClock className="w-5 h-5 flex-shrink-0" />
            ) : (
              <IconAlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Offline Grace Period Warning */}
        {offlineGrace && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-950/50 border border-amber-600/60 text-amber-300 text-sm flex items-center gap-3 animate-pulse">
            <IconAlertTriangle className="w-6 h-6 flex-shrink-0 text-amber-400" />
            <div>
              <div className="font-bold">Mất kết nối mạng! (Thời gian ân hạn 5 phút)</div>
              <div className="text-xs text-amber-300/80 mt-0.5">
                Đang chờ kết nối lại: <b>{Math.floor(graceSecondsLeft / 60)}m {graceSecondsLeft % 60}s</b>. Phiên sẽ tự động tiếp tục khi có mạng trở lại.
              </div>
            </div>
          </div>
        )}

        {/* Main Chill Digital Clock Display */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gray-900/90 border border-gray-800 shadow-2xl overflow-hidden mb-6 text-center backdrop-blur">
          {/* Ambient Glow */}
          <div
            className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              running ? 'bg-amber-500/20' : 'bg-indigo-500/10'
            }`}
          />

          {/* Running Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border bg-gray-950/60">
            {running ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400">Đang Treo Máy (Online)</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                <span className="text-gray-400">Đang Dừng (Sẵn sàng)</span>
              </>
            )}
          </div>

          {/* Clock Timer */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 my-2 select-none">
            {/* Hours */}
            <div className="bg-gray-950/80 border border-gray-800/80 rounded-2xl px-4 py-4 sm:px-6 sm:py-6 min-w-[76px] sm:min-w-[104px]">
              <span className="font-mono text-3xl sm:text-5xl font-extrabold text-white tracking-wider">
                {timeFmt.hours}
              </span>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase mt-1">Giờ</div>
            </div>
            <span className="text-3xl sm:text-5xl font-extrabold text-amber-500/70 -mt-4">:</span>
            {/* Minutes */}
            <div className="bg-gray-950/80 border border-gray-800/80 rounded-2xl px-4 py-4 sm:px-6 sm:py-6 min-w-[76px] sm:min-w-[104px]">
              <span className="font-mono text-3xl sm:text-5xl font-extrabold text-white tracking-wider">
                {timeFmt.minutes}
              </span>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase mt-1">Phút</div>
            </div>
            <span className="text-3xl sm:text-5xl font-extrabold text-amber-500/70 -mt-4">:</span>
            {/* Seconds */}
            <div className="bg-gray-950/80 border border-gray-800/80 rounded-2xl px-4 py-4 sm:px-6 sm:py-6 min-w-[76px] sm:min-w-[104px]">
              <span className="font-mono text-3xl sm:text-5xl font-extrabold text-amber-400 tracking-wider">
                {timeFmt.seconds}
              </span>
              <div className="text-[10px] sm:text-xs text-amber-500/70 uppercase mt-1">Giây</div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6 max-w-sm mx-auto">
            {running
              ? '✨ Bạn có thể mở tab khác làm việc, nghe nhạc hoặc xem phim. Tiêu đề tab sẽ tự cập nhật đồng hồ!'
              : '⚡ Bấm nút Bắt đầu bên dưới để mở phiên treo máy không giới hạn thời gian.'}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-3">
            {!running ? (
              <button
                type="button"
                onClick={handleStart}
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <IconRocket className="w-5 h-5" /> Bắt đầu treo máy
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStop}
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-950/50 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <IconClock className="w-5 h-5" /> Dừng & Lưu giờ vào BXH
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-center">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Phiên hiện tại</div>
            <div className="text-lg font-bold text-white font-mono">{timeFmt.text}</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-center">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Tổng giờ tích lũy</div>
            <div className="text-lg font-bold text-amber-400 font-mono">{totalFmt.text}</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-center col-span-2 sm:col-span-1">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Số phiên đã cày</div>
            <div className="text-lg font-bold text-indigo-400 font-mono">{userPlays} phiên</div>
          </div>
        </div>

        {/* Discord Bot tip box */}
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <IconPartyPopper className="w-5 h-5" />
          </div>
          <div className="text-xs text-gray-400 flex-1">
            <b className="text-white">Mẹo hữu ích:</b> Bạn cũng có thể treo máy trực tiếp trên Discord bằng lệnh{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-800 text-indigo-300 font-mono">/afk action:Start</code> hoặc{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-800 text-indigo-300 font-mono">!afk start</code>. Giờ cày trên bot và web đều được cộng dồn chung vào một bảng xếp hạng!
          </div>
        </div>
      </div>
    </PubLayout>
  );
}

