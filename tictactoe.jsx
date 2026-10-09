import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { IconRefresh, IconFlame, IconPartyPopper, IconFrown } from '../../components/icons';

export default function TicTacToe() {
  const [board, setBoard]   = useState(Array(9).fill(null));
  const [streak, setStreak] = useState(0);
  const [best, setBest]     = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState('');
  const { status: authStatus } = useSession();

  const startNew = useCallback(async () => {
    if (authStatus !== 'authenticated') return;
    setBusy(true); setError('');
    try {
      const data = await pubApi.tttMove('new');
      setBoard(data.board); setResult(data.result); setStreak(data.streak);
      setBest(b => Math.max(b, data.streak));
    } catch (e) {
      setError(e.message || 'Khong the bat dau van moi.');
    } finally {
      setBusy(false);
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') startNew();
  }, [authStatus, startNew]);

  async function playerMove(i) {
    if (busy || board[i] || result || authStatus !== 'authenticated') return;
    setBusy(true); setError('');
    try {
      const data = await pubApi.tttMove('move', i);
      setBoard(data.board); setResult(data.result); setStreak(data.streak);
      setBest(b => Math.max(b, data.streak));
    } catch (e) {
      setError(e.message || 'Nuoc di khong hop le.');
    } finally {
      setBusy(false);
    }
  }

  const statusText = result === 'X' ? 'Ban thang!'
    : result === 'O' ? 'May thang!'
    : result === 'draw' ? 'Hoa!'
    : busy ? 'Dang xu ly...'
    : 'Luot cua ban (X)';

  if (authStatus !== 'authenticated') {
    return (
      <PubLayout title="Tic Tac Toe">
        <div className="max-w-md mx-auto text-center text-gray-400 text-sm py-10">
          Ban can dang nhap de choi va ghi diem vao bang xep hang.
        </div>
      </PubLayout>
    );
  }

  return (
    <PubLayout title="Tic Tac Toe">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-gray-500 text-sm flex-1">
            Ban la <strong className="text-white">X</strong>, doi dau voi may (O). Thang cang nhieu van lien tiep, diem cang cao. Toan bo ket qua do Server tinh, khong the gian lan.
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
        {error && <div className="text-center mb-3 text-xs text-red-400">{error}</div>}

        <div className="relative">
          <div className="grid grid-cols-3 gap-2 bg-gray-800 p-2 rounded-2xl select-none">
            {board.map((v, i) => (
              <button
                key={i}
                onClick={() => playerMove(i)}
                disabled={Boolean(v) || Boolean(result) || busy}
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
                onClick={startNew}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
              >
                Choi tiep
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            onClick={startNew}
            disabled={busy}
            className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-medium disabled:opacity-40"
          >
            <IconRefresh className="w-4 h-4" /> Choi lai tu dau (reset streak)
          </button>
        </div>
      </div>
    </PubLayout>
  );
}
