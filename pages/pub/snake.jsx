import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import PubLayout from '../../components/PubLayout';
import { pubApi } from '../../lib/pubApi';
import { IconFrown, IconRefresh } from '../../components/icons';

// Ran san moi (Snake) - thuan client-side, dieu khien bang phim mui ten/WASD
// hoac vuot tay tren di dong.

const SIZE = 16;
const TICK_MS = 130;
const BEST_KEY = 'noitu_snake_best';

function randCell(exclude) {
  const excluded = new Set(exclude.map(p => p.x + ',' + p.y));
  let x, y;
  do {
    x = Math.floor(Math.random() * SIZE);
    y = Math.floor(Math.random() * SIZE);
  } while (excluded.has(x + ',' + y));
  return { x, y };
}

function initialSnake() {
  const mid = Math.floor(SIZE / 2);
  return [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
}

export default function SnakeGame() {
  const [snake, setSnake]       = useState(initialSnake);
  const [food, setFood]         = useState(() => randCell(initialSnake()));
  const [dir, setDir]           = useState({ x: 1, y: 0 });
  const [score, setScore]       = useState(0);
  const [best, setBest]         = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning]   = useState(true);
  const dirRef = useRef(dir);
  const dirLockRef = useRef(false);
  const touchStart = useRef(null);
  const { status: authStatus } = useSession();

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

  useEffect(() => {
    if (gameOver && authStatus === 'authenticated' && score > 0) {
      pubApi.submitGameScore('snake', score).catch(() => { /* im lang neu loi */ });
    }
  }, [gameOver, authStatus, score]);

  const setDirection = useCallback((nx, ny) => {
    if (dirLockRef.current) return;
    const cur = dirRef.current;
    if (cur.x === -nx && cur.y === -ny) return; // khong the quay dau 180 do
    dirRef.current = { x: nx, y: ny };
    dirLockRef.current = true;
    setDir({ x: nx, y: ny });
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;
    const timer = setInterval(() => {
      dirLockRef.current = false;
      setSnake(prev => {
        const d = dirRef.current;
        const head = { x: prev[0].x + d.x, y: prev[0].y + d.y };
        if (head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE) {
          setGameOver(true);
          return prev;
        }
        if (prev.some(seg => seg.x === head.x && seg.y === head.y)) {
          setGameOver(true);
          return prev;
        }
        const ateFood = head.x === food.x && head.y === food.y;
        const nextSnake = [head, ...prev];
        if (ateFood) {
          setScore(s => s + 10);
          setFood(randCell(nextSnake));
        } else {
          nextSnake.pop();
        }
        return nextSnake;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [running, gameOver, food]);

  useEffect(() => {
    function onKeyDown(e) {
      const map = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
        a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1],
        A: [-1, 0], D: [1, 0], W: [0, -1], S: [0, 1],
      };
      const v = map[e.key];
      if (v) { e.preventDefault(); setDirection(v[0], v[1]); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setDirection]);

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
    if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 1 : -1, 0);
    else setDirection(0, dy > 0 ? 1 : -1);
  }

  function newGame() {
    const s = initialSnake();
    setSnake(s);
    setFood(randCell(s));
    dirRef.current = { x: 1, y: 0 };
    setDir({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }

  const snakeSet = new Map(snake.map((seg, i) => [seg.x + ',' + seg.y, i]));

  return (
    <PubLayout title="Snake">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-gray-500 text-sm flex-1">
            Dung phim mui ten (hoac WASD), hoac vuot tren man hinh de dieu khien ran. An moi de dai them va ghi diem, tranh dam vao tuong hoac chinh minh.
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
            className="grid bg-gray-800 p-1.5 rounded-2xl select-none touch-none"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))`, gap: '2px' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {Array.from({ length: SIZE * SIZE }).map((_, i) => {
              const x = i % SIZE, y = Math.floor(i / SIZE);
              const segIdx = snakeSet.get(x + ',' + y);
              const isHead = segIdx === 0;
              const isFood = food.x === x && food.y === y;
              let cls = 'bg-gray-900/60';
              if (isFood) cls = 'bg-red-500';
              else if (segIdx !== undefined) cls = isHead ? 'bg-green-400' : 'bg-green-600';
              return <div key={i} className={`aspect-square rounded-[3px] ${cls}`} />;
            })}
          </div>

          {gameOver && (
            <div className="absolute inset-0 bg-gray-950/85 rounded-2xl flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                <IconFrown className="w-7 h-7 text-gray-400" /> Thua roi!
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
