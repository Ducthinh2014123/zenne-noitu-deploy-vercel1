import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { IconRefresh, IconFlame, IconPartyPopper, IconFrown } from '../../components/icons';

// Tic Tac Toe doi dau AI (minimax - AI choi hoan hao). Ban la X, may la O.
// Diem xep hang = chuoi thang lien tiep dai nhat (best win streak).

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

const BEST_KEY = 'noitu_tictactoe_best_streak';

function winnerOf(board) {
  for (const [a,b,c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(v => v)) return 'draw';
  return null;
}

function minimax(board, player) {
  const win = winnerOf(board);
  if (win === 'O') return { score: 1 };
  if (win === 'X') return { score: -1 };
  if (win === 'draw') return { score: 0 };

  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    const next = board.slice();
    next[i] = player;
    const result = minimax(next, player === 'O' ? 'X' : 'O');
    moves.push({ index: i, score: result.score });
  }
  if (player === 'O') {
    return moves.reduce((best, m) => (m.score > best.score ? m : best), { score: -Infinity });
  }
  return moves.reduce((best, m) => (m.score < best.score ? m : best), { score: Infinity });
}

function aiMove(board) {
  const empties = board.reduce((acc, v, i) => (v ? acc : [...acc, i]), []);
  if (empties.length === 9) return 4; // di nuoc dau tien vao giua cho nhanh
  return minimax(board, 'O').index;
}

export default function TicTacToe() {
  const [board, setBoard]     = useState(Array(9).fill(null));
  const [turn, setTurn]       = useState('X');
  const [streak, setStreak]   = useState(0);
  const [best, setBest]       = useState(0);
  const [result, setResult]   = useState(null); // 'X' | 'O' | 'draw' | null
  const aiTimer = useRef(null);
  const { status: authStatus } = useSession();

  useEffect(() => {
    try {
      const b = window.localStorage.getItem(BEST_KEY);
      if (b) setBest(parseInt(b, 10) || 0);
    } catch (e) { /* ignore */ }
    return () => { if (aiTimer.current) clearTimeout(aiTimer.current); };
  }, []);

  const finish = useCallback((win) => {
    setResult(win);
    if (win === 'X') {
      setStreak(s => {
        const ns = s + 1;
        if (ns > best) {
          setBest(ns);
          try { window.localStorage.setItem(BEST_KEY, String(ns)); } catch (e) { /* ignore */ }
          if (authStatus === 'authenticated') {
            pubApi.submitGameScore('tictactoe', ns).catch(() => { /* im lang neu loi */ });
          }
        }
        return ns;
      });
    } else if (win === 'O') {
      setStreak(0);
    }
  }, [best, authStatus]);

  function playerMove(i) {
    if (board[i] || result || turn !== 'X') return;
    const next = board.slice();
    next[i] = 'X';
    setBoard(next);
    const win = winnerOf(next);
    if (win) { finish(win); return; }
    setTurn('O');
    aiTimer.current = setTimeout(() => {
      const idx = aiMove(next);
      const afterAi = next.slice();
      afterAi[idx] = 'O';
      setBoard(afterAi);
      const win2 = winnerOf(afterAi);
      if (win2) finish(win2);
      else setTurn('X');
    }, 350);
  }

  function newRound() {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setResult(null);
  }

  const statusText = result === 'X' ? 'Ban thang!'
    : result === 'O' ? 'May thang!'
    : result === 'draw' ? 'Hoa!'
    : turn === 'X' ? 'Luot cua ban (X)' : 'May dang di (O)...';

  return (
    <PubLayout title="Tic Tac Toe">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-gray-500 text-sm flex-1">
            Ban la <strong className="text-white">X</strong>, doi dau voi may (O). Thang cang nhieu van lien tiep, diem cang cao.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-center min-w-[64px]">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center justify-center gap-1"><IconFlame className="w-3 h-3" /> Streak</div>
              <div className="text-lg font-bold text-white">{streak}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-center min-w-[64px]">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Ky luc</div>
              <div className="text-lg font-bold text-indigo-400">{best}</div>
            </div>
          </div>
        </div>

        <div className="text-center mb-3 text-sm font-medium text-gray-300">{statusText}</div>

        <div className="relative">
          <div className="grid grid-cols-3 gap-2 bg-gray-800 p-2 rounded-2xl select-none">
            {board.map((v, i) => (
              <button
                key={i}
                onClick={() => playerMove(i)}
                disabled={Boolean(v) || Boolean(result) || turn !== 'X'}
                className={`aspect-square rounded-lg flex items-center justify-center text-4xl font-extrabold transition-colors ${
                  v ? (v === 'X' ? 'bg-indigo-900/40 text-indigo-400' : 'bg-red-900/40 text-red-400') : 'bg-gray-900/60 hover:bg-gray-900'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {result && (
            <div className="absolute inset-0 bg-gray-950/85 rounded-2xl flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                {result === 'X' && <><IconPartyPopper className="w-7 h-7 text-yellow-400" /> Ban thang!</>}
                {result === 'O' && <><IconFrown className="w-7 h-7 text-gray-400" /> May thang!</>}
                {result === 'draw' && <>Hoa!</>}
              </div>
              <button
                onClick={newRound}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
              >
                Choi tiep
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            onClick={() => { newRound(); setStreak(0); }}
            className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-medium"
          >
            <IconRefresh className="w-4 h-4" /> Choi lai tu dau (reset streak)
          </button>
        </div>
      </div>
    </PubLayout>
  );
}
