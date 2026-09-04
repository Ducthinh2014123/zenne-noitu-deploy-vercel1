import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { IconBomb, IconPin, IconPartyPopper, IconFrown, IconRefresh, IconClock } from '../../components/icons';

// Do min (Minesweeper) kich thuoc co ban 9x9, 10 qua min. Click trai de mo o,
// click phai (hoac nhan giu tren di dong) de cam co. Diem = cang thang nhanh
// cang cao: max(0, 1000 - so giay * 3).

const COLS = 9, ROWS = 9, MINES = 10;
const BEST_KEY = 'noitu_minesweeper_best';

function buildBoard(safeIdx) {
  const total = COLS * ROWS;
  const mineSet = new Set();
  while (mineSet.size < MINES) {
    const idx = Math.floor(Math.random() * total);
    if (idx === safeIdx) continue;
    mineSet.add(idx);
  }
  const cells = Array.from({ length: total }, (_, i) => ({
    mine: mineSet.has(i), revealed: false, flagged: false, adjacent: 0,
  }));
  for (let i = 0; i < total; i++) {
    if (cells[i].mine) continue;
    const x = i % COLS, y = Math.floor(i / COLS);
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
        if (cells[ny * COLS + nx].mine) count++;
      }
    }
    cells[i].adjacent = count;
  }
  return cells;
}

function floodReveal(cells, startIdx) {
  const next = cells.map(c => ({ ...c }));
  const stack = [startIdx];
  while (stack.length) {
    const i = stack.pop();
    const cell = next[i];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0 && !cell.mine) {
      const x = i % COLS, y = Math.floor(i / COLS);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
          const ni = ny * COLS + nx;
          if (!next[ni].revealed && !next[ni].flagged) stack.push(ni);
        }
      }
    }
  }
  return next;
}

const NUM_COLORS = ['', 'text-blue-400','text-green-400','text-red-400','text-purple-400','text-yellow-500','text-teal-400','text-white','text-gray-400'];

export default function Minesweeper() {
  const [cells, setCells]     = useState(null);
  const [status, setStatus]   = useState('ready'); // ready | playing | won | lost
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest]       = useState(0);
  const startTimeRef = useRef(null);
  const { status: authStatus } = useSession();

  useEffect(() => {
    try {
      const b = window.localStorage.getItem(BEST_KEY);
      if (b) setBest(parseInt(b, 10) || 0);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 250);
    return () => clearInterval(timer);
  }, [status]);

  const finishGame = useCallback((won, finalCells, finalElapsed) => {
    if (won) {
      const score = Math.max(0, 1000 - finalElapsed * 3);
      setBest(b => {
        if (score > b) {
          try { window.localStorage.setItem(BEST_KEY, String(score)); } catch (e) { /* ignore */ }
          if (authStatus === 'authenticated') {
            pubApi.submitGameScore('minesweeper', score).catch(() => { /* im lang neu loi */ });
          }
          return score;
        }
        return b;
      });
      setCells(finalCells.map(c => (c.mine ? { ...c, flagged: true } : c)));
      setStatus('won');
    } else {
      setCells(finalCells.map(c => (c.mine ? { ...c, revealed: true } : c)));
      setStatus('lost');
    }
  }, [authStatus]);

  function checkWin(nextCells) {
    return nextCells.every(c => c.mine || c.revealed);
  }

  function reveal(i) {
    if (status === 'won' || status === 'lost') return;
    if (cells && cells[i].flagged) return;

    if (status === 'ready' || !cells) {
      const fresh = buildBoard(i);
      const revealed = floodReveal(fresh, i);
      startTimeRef.current = Date.now();
      setElapsed(0);
      setStatus('playing');
      setCells(revealed);
      return;
    }

    if (cells[i].revealed) return;
    if (cells[i].mine) {
      const finalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      finishGame(false, cells, finalElapsed);
      return;
    }
    const next = floodReveal(cells, i);
    if (checkWin(next)) {
      const finalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      finishGame(true, next, finalElapsed);
    } else {
      setCells(next);
    }
  }

  function toggleFlag(e, i) {
    e.preventDefault();
    if (!cells || status === 'won' || status === 'lost' || cells[i].revealed) return;
    const next = cells.map((c, idx) => (idx === i ? { ...c, flagged: !c.flagged } : c));
    setCells(next);
  }

  function newGame() {
    setCells(null);
    setStatus('ready');
    setElapsed(0);
  }

  const flagCount = cells ? cells.filter(c => c.flagged).length : 0;

  return (
    <PubLayout title="Minesweeper">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-gray-500 text-sm flex-1">
            Click de mo o, click phai (hoac nhan giu tren di dong) de cam co bao min. Mo het cac o an toan de thang, cang nhanh cang duoc nhieu diem.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-center min-w-[56px]">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center justify-center gap-1"><IconBomb className="w-3 h-3" /></div>
              <div className="text-lg font-bold text-white">{MINES - flagCount}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-center min-w-[56px]">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center justify-center gap-1"><IconClock className="w-3 h-3" /></div>
              <div className="text-lg font-bold text-white">{elapsed}s</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-center min-w-[56px]">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Ky luc</div>
              <div className="text-lg font-bold text-indigo-400">{best}</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            className="grid bg-gray-800 p-1.5 rounded-2xl select-none"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))`, gap: '2px' }}
          >
            {Array.from({ length: COLS * ROWS }).map((_, i) => {
              const c = cells ? cells[i] : null;
              const revealed = c?.revealed;
              const flagged = c?.flagged;
              return (
                <button
                  key={i}
                  onClick={() => reveal(i)}
                  onContextMenu={(e) => toggleFlag(e, i)}
                  className={`aspect-square rounded-[3px] flex items-center justify-center text-xs sm:text-sm font-bold ${
                    revealed ? (c.mine ? 'bg-red-700' : 'bg-gray-700') : 'bg-gray-900/70 hover:bg-gray-900'
                  } ${revealed && !c.mine ? NUM_COLORS[c.adjacent] : ''}`}
                >
                  {revealed
                    ? (c.mine ? <IconBomb className="w-3.5 h-3.5 text-white" /> : (c.adjacent > 0 ? c.adjacent : ''))
                    : (flagged ? <IconPin className="w-3.5 h-3.5 text-orange-400" /> : '')}
                </button>
              );
            })}
          </div>

          {(status === 'won' || status === 'lost') && (
            <div className="absolute inset-0 bg-gray-950/85 rounded-2xl flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                {status === 'won'
                  ? <><IconPartyPopper className="w-7 h-7 text-yellow-400" /> Ban thang!</>
                  : <><IconFrown className="w-7 h-7 text-gray-400" /> Dam min roi!</>}
              </div>
              <button
                onClick={newGame}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
              >
                Choi lai
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            onClick={newGame}
            className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-medium"
          >
            <IconRefresh className="w-4 h-4" /> Choi lai tu dau
          </button>
        </div>
      </div>
    </PubLayout>
  );
}
