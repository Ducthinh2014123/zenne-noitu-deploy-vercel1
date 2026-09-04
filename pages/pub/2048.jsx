import { useEffect, useState, useCallback, useRef } from 'react';
import PubLayout from '../../components/PubLayout';
import { IconPartyPopper, IconFrown, IconRefresh } from '../../components/icons';

// Game 2048 - thuan client-side, khong can goi API bot. Diem cao nhat luu
// trong localStorage cua trinh duyet.

const SIZE = 4;
const BEST_KEY = 'noitu_2048_best';

function emptyGrid() {
  return Array(SIZE * SIZE).fill(0);
}

function addRandomTile(grid) {
  const emptyIdx = [];
  for (let i = 0; i < grid.length; i++) if (grid[i] === 0) emptyIdx.push(i);
  if (emptyIdx.length === 0) return grid;
  const idx = emptyIdx[Math.floor(Math.random() * emptyIdx.length)];
  const next = grid.slice();
  next[idx] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function getRow(grid, r) {
  const out = [];
  for (let c = 0; c < SIZE; c++) out.push(grid[r * SIZE + c]);
  return out;
}

function getCol(grid, c) {
  const out = [];
  for (let r = 0; r < SIZE; r++) out.push(grid[r * SIZE + c]);
  return out;
}

function slideAndMerge(line) {
  const vals = line.filter(v => v !== 0);
  const merged = [];
  let scoreGained = 0;
  for (let i = 0; i < vals.length; i++) {
    if (i < vals.length - 1 && vals[i] === vals[i + 1]) {
      const val = vals[i] * 2;
      merged.push(val);
      scoreGained += val;
      i++;
    } else {
      merged.push(vals[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  const moved = merged.some((v, i) => v !== line[i]);
  return { line: merged, scoreGained, moved };
}

function move(grid, direction) {
  const next = grid.slice();
  let totalScore = 0;
  let anyMoved = false;

  if (direction === 'left' || direction === 'right') {
    for (let r = 0; r < SIZE; r++) {
      let row = getRow(next, r);
      if (direction === 'right') row = row.slice().reverse();
      const { line, scoreGained, moved } = slideAndMerge(row);
      const finalLine = direction === 'right' ? line.slice().reverse() : line;
      for (let c = 0; c < SIZE; c++) next[r * SIZE + c] = finalLine[c];
      totalScore += scoreGained;
      anyMoved = anyMoved || moved;
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      let col = getCol(next, c);
      if (direction === 'down') col = col.slice().reverse();
      const { line, scoreGained, moved } = slideAndMerge(col);
      const finalLine = direction === 'down' ? line.slice().reverse() : line;
      for (let r = 0; r < SIZE; r++) next[r * SIZE + c] = finalLine[r];
      totalScore += scoreGained;
      anyMoved = anyMoved || moved;
    }
  }
  return { grid: next, scoreGained: totalScore, moved: anyMoved };
}

function canMoveAnywhere(grid) {
  return ['left', 'right', 'up', 'down'].some(dir => move(grid, dir).moved);
}

const TILE_STYLES = {
  2:    'bg-gray-200 text-gray-900',
  4:    'bg-gray-300 text-gray-900',
  8:    'bg-orange-300 text-white',
  16:   'bg-orange-400 text-white',
  32:   'bg-orange-500 text-white',
  64:   'bg-orange-600 text-white',
  128:  'bg-yellow-400 text-white',
  256:  'bg-yellow-500 text-white',
  512:  'bg-yellow-600 text-white',
  1024: 'bg-indigo-500 text-white',
  2048: 'bg-indigo-600 text-white',
};

function tileClass(v) {
  if (v === 0) return 'bg-gray-900/60';
  return TILE_STYLES[v] || 'bg-purple-700 text-white';
}

function tileTextSize(v) {
  if (v >= 1000) return 'text-lg sm:text-xl';
  if (v >= 100) return 'text-xl sm:text-2xl';
  return 'text-2xl sm:text-3xl';
}

export default function Game2048() {
  const [grid, setGrid]   = useState(() => addRandomTile(addRandomTile(emptyGrid())));
  const [score, setScore] = useState(0);
  const [best, setBest]   = useState(0);
  const [gameOver, setGameOver]     = useState(false);
  const [won, setWon]               = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const touchStart = useRef(null);

  useEffect(() => {
    try {
      const b = window.localStorage.getItem(BEST_KEY);
      if (b) setBest(parseInt(b, 10) || 0);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      try { window.localStorage.setItem(BEST_KEY, String(score)); } catch (e) { /* ignore */ }
    }
  }, [score, best]);

  const handleMove = useCallback((direction) => {
    if (gameOver || (won && !keepPlaying)) return;
    setGrid(prevGrid => {
      const { grid: movedGrid, scoreGained, moved } = move(prevGrid, direction);
      if (!moved) return prevGrid;
      if (scoreGained > 0) setScore(s => s + scoreGained);
      const withNewTile = addRandomTile(movedGrid);
      if (!won && withNewTile.includes(2048)) setWon(true);
      if (!canMoveAnywhere(withNewTile)) setGameOver(true);
      return withNewTile;
    });
  }, [gameOver, won, keepPlaying]);

  useEffect(() => {
    function onKeyDown(e) {
      const map = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
        A: 'left', D: 'right', W: 'up', S: 'down',
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); handleMove(dir); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleMove]);

  function onTouchStart(e) {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }
  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left');
    else handleMove(dy > 0 ? 'down' : 'up');
  }

  function newGame() {
    setGrid(addRandomTile(addRandomTile(emptyGrid())));
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
  }

  const showOverlay = gameOver || (won && !keepPlaying);

  return (
    <PubLayout title="2048">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-gray-500 text-sm flex-1">
            Dung phim mui ten (hoac WASD) tren may tinh, vuot tren di dong de don cac o so giong nhau lai voi nhau. Dat o <strong className="text-white">2048</strong> la thang!
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-center min-w-[64px]">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Diem</div>
              <div className="text-lg font-bold text-white">{score}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-center min-w-[64px]">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Ky luc</div>
              <div className="text-lg font-bold text-indigo-400">{best}</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            className="grid grid-cols-4 gap-2 bg-gray-800 p-2 rounded-2xl select-none touch-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {grid.map((v, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center font-extrabold transition-all duration-150 ${tileClass(v)} ${v !== 0 ? tileTextSize(v) : ''}`}
              >
                {v !== 0 && v}
              </div>
            ))}
          </div>

          {showOverlay && (
            <div className="absolute inset-0 bg-gray-950/85 rounded-2xl flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                {won
                  ? <><IconPartyPopper className="w-7 h-7 text-yellow-400" /> Ban thang roi!</>
                  : <><IconFrown className="w-7 h-7 text-gray-400" /> Thua roi!</>}
              </div>
              <div className="flex gap-2">
                {won && !gameOver && (
                  <button
                    onClick={() => setKeepPlaying(true)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-medium"
                  >
                    Choi tiep
                  </button>
                )}
                <button
                  onClick={newGame}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
                >
                  Choi lai
                </button>
              </div>
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
