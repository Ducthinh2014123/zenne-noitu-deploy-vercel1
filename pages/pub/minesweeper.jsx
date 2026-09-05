import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { IconBomb, IconPin, IconPartyPopper, IconFrown, IconRefresh, IconClock } from '../../components/icons';

const COLS = 9, ROWS = 9, MINES = 10;
const NUM_COLORS = ['', 'text-blue-400','text-green-400','text-red-400','text-purple-400','text-yellow-500','text-teal-400','text-white','text-gray-400'];

export default function Minesweeper() {
  const [cells, setCells]     = useState(() => Array.from({ length: COLS * ROWS }, () => ({ revealed: false, flagged: false, mine: false, adjacent: 0 })));
  const [status, setStatus]   = useState('ready');
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore]     = useState(0);
  const [best, setBest]       = useState(0);
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState('');
  const { status: authStatus } = useSession();

  const newGame = useCallback(async () => {
    if (authStatus !== 'authenticated') return;
    setBusy(true); setError('');
    try {
      await pubApi.msMove('new');
      setCells(Array.from({ length: COLS * ROWS }, () => ({ revealed: false, flagged: false, mine: false, adjacent: 0 })));
      setStatus('ready'); setElapsed(0); setScore(0);
    } catch (e) {
      setError(e.message || 'Khong the bat dau van moi.');
    } finally {
      setBusy(false);
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') newGame();
  }, [authStatus, newGame]);

  async function reveal(i) {
    if (busy || status === 'won' || status === 'lost' || cells[i].flagged || cells[i].revealed) return;
    setBusy(true); setError('');
    try {
      const data = await pubApi.msMove('reveal', i);
      if (data.result === 'lost') {
        setCells(prev => prev.map((c, idx) => (data.mines.includes(idx) ? { ...c, revealed: true, mine: true } : c)));
        setStatus('lost');
        return;
      }
      setStatus('playing');
      setCells(prev => {
        const next = prev.map(c => ({ ...c }));
        for (const r of data.revealed) { next[r.index].revealed = true; next[r.index].adjacent = r.adjacent; }
        return next;
      });
      if (data.result === 'won') {
        setStatus('won'); setElapsed(data.elapsed); setScore(data.score);
        setBest(b => Math.max(b, data.score));
      }
    } catch (e) {
      setError(e.message || 'Khong mo duoc o nay.');
    } finally {
      setBusy(false);
    }
  }

  function toggleFlag(e, i) {
    e.preventDefault();
    if (busy || status === 'won' || status === 'lost' || cells[i].revealed) return;
    setCells(prev => prev.map((c, idx) => (idx === i ? { ...c, flagged: !c.flagged } : c)));
  }

  const flagCount = cells.filter(c => c.flagged).length;

  if (authStatus !== 'authenticated') {
    return (
      <PubLayout title="Minesweeper">
        <div className="max-w-md mx-auto text-center text-gray-400 text-sm py-10">
          Ban can dang nhap de choi va ghi diem vao bang xep hang.
        </div>
      </PubLayout>
    );
  }

  return (
    <PubLayout title="Minesweeper">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-gray-500 text-sm flex-1">
            Click de mo o, click phai (hoac nhan giu tren di dong) de cam co bao min. Mo het cac o an toan de thang, cang nhanh cang duoc nhieu diem. Vi tri min do Server giu kin, khong the xem truoc.
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
        {error && <div className="text-center mb-3 text-xs text-red-400">{error}</div>}

        <div className="relative">
          <div
            className="grid bg-gray-800 p-1.5 rounded-2xl select-none"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))`, gap: '2px' }}
          >
            {cells.map((c, i) => (
              <button
                key={i}
                onClick={() => reveal(i)}
                onContextMenu={(e) => toggleFlag(e, i)}
                className={`aspect-square rounded-[3px] flex items-center justify-center text-xs sm:text-sm font-bold ${
                  c.revealed ? (c.mine ? 'bg-red-700' : 'bg-gray-700') : 'bg-gray-900/70 hover:bg-gray-900'
                } ${c.revealed && !c.mine ? NUM_COLORS[c.adjacent] : ''}`}
              >
                {c.revealed
                  ? (c.mine ? <IconBomb className="w-3.5 h-3.5 text-white" /> : (c.adjacent > 0 ? c.adjacent : ''))
                  : (c.flagged ? <IconPin className="w-3.5 h-3.5 text-orange-400" /> : '')}
              </button>
            ))}
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
                disabled={busy}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold disabled:opacity-40"
              >
                Choi lai
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            onClick={newGame}
            disabled={busy}
            className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-medium disabled:opacity-40"
          >
            <IconRefresh className="w-4 h-4" /> Choi lai tu dau
          </button>
        </div>
      </div>
    </PubLayout>
  );
}
