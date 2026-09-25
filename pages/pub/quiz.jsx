import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { getQuizQuestion } from '../../lib/quizEngine';
import {
  IconSparkles, IconFlame, IconTrophy, IconRefresh,
  IconCheckCircle, IconXCircle, IconPartyPopper,
  IconLogIn, IconArrowRight, IconBookOpen, IconLightbulb
} from '../../components/icons';

const SUBJECTS = [
  { id: 'toan', label: 'Toán Học', desc: 'Đại số, Hình học, Phép tính & Đố mẹo phản xạ', Icon: IconSparkles, color: 'text-amber-400 bg-amber-900/20 border-amber-700/40' },
  { id: 'khoahoc', label: 'Khoa Học Tự Nhiên', desc: 'Sinh học, Vật lí, Hóa học & Khám phá vũ trụ', Icon: IconLightbulb, color: 'text-cyan-400 bg-cyan-900/20 border-cyan-700/40' },
];

const LEVELS = [
  { level: 1, title: 'Cấp 1 (Lớp 1 - 5)', sub: 'Cộng trừ nhân chia, tìm x, toán đố phản xạ nhanh', badge: '15s Phản Xạ', points: '+10 ~ 15 điểm' },
  { level: 2, title: 'Cấp 2 (Lớp 6 - 9)', sub: 'Phân số, lũy thừa, PT bậc 1/2, góc, diện tích & KHTN Lí - Hóa', badge: '25s Tiêu Chuẩn', points: '+20 ~ 25 điểm' },
  { level: 3, title: 'Cấp 3 (Lớp 10 - 12)', sub: 'Lượng giác, logarit, đạo hàm, tích phân, xác suất & Lí-Hóa-Sinh THPT', badge: '35s Thử Thách', points: '+40 điểm (Khủng)' },
];

export default function QuizGame() {
  const { data: session, status: authStatus } = useSession();

  // Mode selection
  const [subject, setSubject] = useState('toan');
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'playing', 'gameover'

  // Question state
  const [currentQ, setCurrentQ] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [totalTime, setTotalTime] = useState(15);

  // Score & Streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Session token & submitting
  const [sessionToken, setSessionToken] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const timerRef = useRef(null);

  // Next question
  const nextQuestion = useCallback(() => {
    setSelectedIdx(null);
    setAnswered(false);
    const q = getQuizQuestion({ subject, level });
    setCurrentQ(q);
    setTimeLeft(q.timeLimit || 20);
    setTotalTime(q.timeLimit || 20);
  }, [subject, level]);

  // Start game round
  const startGame = async () => {
    if (authStatus !== 'authenticated') return;
    setSaving(true);
    setSaveMsg('');
    try {
      const data = await pubApi.gameSessionStart('quiz');
      setSessionToken(data.token);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setCorrectCount(0);
      setTotalCount(0);
      setGameState('playing');
      const q = getQuizQuestion({ subject, level });
      setCurrentQ(q);
      setTimeLeft(q.timeLimit || 20);
      setTotalTime(q.timeLimit || 20);
    } catch (e) {
      alert(e.message || 'Không thể bắt đầu phiên chơi');
    } finally {
      setSaving(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || answered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, answered, currentQ]);

  // Handle timeout
  const handleTimeOut = () => {
    if (answered) return;
    setAnswered(true);
    setSelectedIdx(-1); // No choice made
    setStreak(0);
    setTotalCount((t) => t + 1);
  };

  // Handle Answer Selection
  const handleSelectOption = (idx) => {
    if (answered || gameState !== 'playing') return;
    clearInterval(timerRef.current);
    setSelectedIdx(idx);
    setAnswered(true);
    setTotalCount((t) => t + 1);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      setCorrectCount((c) => c + 1);

      // Streak combo bonus
      const bonusMultiplier = newStreak >= 5 ? 2.0 : newStreak >= 3 ? 1.5 : 1.0;
      const earned = Math.round((currentQ.points || 10) * bonusMultiplier);
      setScore((s) => s + earned);
    } else {
      setStreak(0);
    }
  };

  // End Game and Submit Score
  const endGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('gameover');
    if (score > 0 && sessionToken && authStatus === 'authenticated') {
      setSaving(true);
      try {
        await pubApi.submitGameScore('quiz', score, sessionToken);
        setSaveMsg(`Đã lưu thành công ${score} điểm vào Bảng Xếp Hạng!`);
      } catch (e) {
        setSaveMsg(e.message || 'Lỗi lưu điểm');
      } finally {
        setSaving(false);
      }
    }
  };

  if (authStatus !== 'authenticated') {
    return (
      <PubLayout title="Đấu Trí Tri Thức">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center mb-4">
            <IconSparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Đăng nhập để chơi Giải Đố</h2>
          <p className="text-gray-400 text-sm mb-6">
            Đăng nhập tài khoản để thi đấu giải đố Toán & Khoa Học Tự Nhiên từ Lớp 1 - 12 và ghi danh lên Bảng Xếp Hạng!
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
    <PubLayout title="Đấu Trí Tri Thức (Toán & KHTN)">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <IconSparkles className="w-6 h-6" />
              </span>
              Đấu Trí Tri Thức (Lớp 1 - 12)
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Thử thách giải đố Toán Học & Khoa Học Tự Nhiên, đua chuỗi streak và cày điểm Bảng Xếp Hạng!
            </p>
          </div>
          <Link
            href="/pub/leaderboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-amber-400 hover:border-amber-500/40 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            <IconTrophy className="w-4 h-4" /> BXH Tri Thức
          </Link>
        </div>

        {/* LOBBY SCREEN */}
        {gameState === 'lobby' && (
          <div className="space-y-6">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">
                1. Chọn Môn Học
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUBJECTS.map((sub) => {
                  const active = subject === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSubject(sub.id)}
                      className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                        active
                          ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-950/50'
                          : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <span className={`p-2.5 rounded-xl border flex-shrink-0 ${sub.color}`}>
                        <sub.Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <div className={`font-bold text-base ${active ? 'text-white' : 'text-gray-200'}`}>
                          {sub.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{sub.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">
                2. Chọn Cấp Học
              </label>
              <div className="space-y-3">
                {LEVELS.map((lvl) => {
                  const active = level === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() => setLevel(lvl.level)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        active
                          ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-950/30'
                          : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${active ? 'text-amber-400' : 'text-white'}`}>
                            {lvl.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                            {lvl.badge}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{lvl.sub}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-500/90 whitespace-nowrap">
                        {lvl.points}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={startGame}
                disabled={saving}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-extrabold text-base shadow-xl shadow-orange-950/60 active:scale-95 transition-all"
              >
                {saving ? 'Đang khởi tạo...' : '🔥 Bắt Đầu Ván Đấu Tri Thức'}
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Mỗi câu trả lời đúng liên tiếp sẽ kích hoạt hệ số nhân điểm Combo x1.5 và x2.0!
              </p>
            </div>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {gameState === 'playing' && currentQ && (
          <div className="space-y-5">
            {/* Top Bar: Stats & Streak */}
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Điểm số</div>
                  <div className="text-xl font-extrabold text-amber-400 font-mono">{score}</div>
                </div>
                {streak > 1 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-400 text-xs font-bold animate-bounce">
                    <IconFlame className="w-3.5 h-3.5" />
                    <span>x{streak >= 5 ? '2.0' : '1.5'} (Streak {streak})</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                  Đúng: {correctCount}/{totalCount}
                </div>
                <button
                  type="button"
                  onClick={endGame}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold underline mt-0.5"
                >
                  Kết thúc ván & nộp điểm
                </button>
              </div>
            </div>

            {/* Timer Progress Bar */}
            <div className="relative w-full h-2.5 rounded-full bg-gray-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 4 ? 'bg-red-500' : timeLeft <= 8 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(0, (timeLeft / totalTime) * 100)}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gray-900/90 border border-gray-800 shadow-2xl relative">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 border border-indigo-700/50 text-indigo-300">
                  {currentQ.category}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  ⏳ <b>{timeLeft}s</b>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed mb-6">
                {currentQ.question}
              </h2>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  let btnStyle = 'bg-gray-950/70 border-gray-800 hover:border-gray-700 text-gray-200';

                  if (answered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-950/50';
                    } else if (idx === selectedIdx) {
                      btnStyle = 'bg-red-950/80 border-red-500 text-red-300';
                    } else {
                      btnStyle = 'bg-gray-950/40 border-gray-900 text-gray-600 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleSelectOption(idx)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${btnStyle}`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-gray-800/80 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {letters[idx]}
                      </span>
                      <span className="text-sm font-medium flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Question */}
              {answered && (
                <div className="mt-6 pt-5 border-t border-gray-800 animate-fadeIn">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-950/90 border border-gray-800 text-sm mb-4">
                    {selectedIdx === currentQ.correctIndex ? (
                      <IconCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <IconXCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-white mb-1">
                        {selectedIdx === currentQ.correctIndex
                          ? '🎉 Chính xác!'
                          : selectedIdx === -1
                          ? '⏰ Hết thời gian suy nghĩ!'
                          : '❌ Chưa chính xác!'}
                      </div>
                      <div className="text-xs text-gray-400 leading-relaxed">
                        {currentQ.explanation}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition-all active:scale-95"
                    >
                      <span>Câu tiếp theo</span>
                      <IconArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GAMEOVER SCREEN */}
        {gameState === 'gameover' && (
          <div className="text-center p-8 sm:p-12 rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4">
              <IconPartyPopper className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Ván Đấu Kết Thúc!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Bạn đã hoàn thành lượt thi đấu giải đố tri thức.
            </p>

            {saveMsg && (
              <div className="p-3.5 mb-6 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs font-semibold">
                {saveMsg}
              </div>
            )}

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Tổng Điểm</div>
                <div className="text-2xl font-extrabold text-amber-400 font-mono">{score}</div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Max Streak</div>
                <div className="text-2xl font-extrabold text-orange-400 font-mono">🔥 {maxStreak}</div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Độ Chính Xác</div>
                <div className="text-2xl font-extrabold text-indigo-400 font-mono">
                  {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={startGame}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all"
              >
                <IconRefresh className="w-4 h-4" /> Chơi Lại Ván Mới
              </button>
              <button
                type="button"
                onClick={() => setGameState('lobby')}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition-all"
              >
                Chọn Lại Môn & Cấp Độ
              </button>
            </div>
          </div>
        )}
      </div>
    </PubLayout>
  );
}

